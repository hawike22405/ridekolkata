import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { finishRide, getRide, Ride } from "./api";
import { pingInput } from "../../backend/src/telemetry/contracts.js";
import { pingAck } from "../../backend/src/telemetry/response-contract.js";
export default function RidePanel() {
  const [token, setToken] = useState(""),
    [ride, setRide] = useState<Ride | null>(null),
    [message, setMessage] = useState(
      "Enter the ride access token supplied by your administrator.",
    ),
    [connected, setConnected] = useState(false),
    [tracking, setTracking] = useState(false),
    [busy, setBusy] = useState(false),
    [now, setNow] = useState(Date.now());
  const socket = useRef<Socket | null>(null),
    watch = useRef<number | null>(null),
    generation = useRef(0),
    sequence = useRef(0),
    pending = useRef(false),
    last = useRef(0),
    access = useRef("");
  function stopGPS() {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
    setTracking(false);
  }
  function disconnect() {
    setBusy(false);
    generation.current++;
    stopGPS();
    socket.current?.disconnect();
    socket.current = null;
    setConnected(false);
    pending.current = false;
  }
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      generation.current++;
      if (watch.current !== null)
        navigator.geolocation.clearWatch(watch.current);
      socket.current?.disconnect();
    };
  }, []);
  async function connect() {
    disconnect();
    setRide(null);
    setBusy(true);
    const own = generation.current;
    access.current = token.trim();
    try {
      const result = await getRide(access.current);
      if (own !== generation.current) return;
      setRide(result.ride);
      sequence.current = result.ride.lastSequence;
      if (result.ride.status !== "active") {
        setMessage("This ride has ended.");
        return;
      }
      const client = io({
        transports: ["websocket"],
        auth: { token: access.current },
        reconnection: false,
        autoConnect: false,
        timeout: 10000,
      });
      socket.current = client;
      client.on("connect", async () => {
        try {
          const current = await getRide(access.current);
          if (own !== generation.current) return;
          setRide(current.ride);
          sequence.current = current.ride.lastSequence;
          setConnected(true);
          setMessage("Connected. Start location sharing when you are ready.");
        } catch (error) {
          if (own === generation.current) {
            disconnect();
            setMessage(String(error));
          }
        }
      });
      client.on("connect_error", () => {
        if (own === generation.current) {
          disconnect();
          setMessage("Connection failed. Check your token and reconnect.");
        }
      });
      client.on("disconnect", () => {
        if (own === generation.current) {
          stopGPS();
          setConnected(false);
          setMessage("Disconnected. Reconnect before sharing more locations.");
        }
      });
      client.connect();
    } catch (error) {
      if (own === generation.current)
        setMessage(
          error instanceof Error ? error.message : "Connection failed.",
        );
    } finally {
      if (own === generation.current) setBusy(false);
    }
  }
  function start() {
    if (!connected || !navigator.geolocation) {
      setMessage(
        "Location sharing requires a connected ride and browser location support.",
      );
      return;
    }
    stopGPS();
    setTracking(true);
    setMessage("Requesting location permission…");
    const own = generation.current;
    watch.current = navigator.geolocation.watchPosition(
      async (position) => {
        const client = socket.current;
        if (
          own !== generation.current ||
          !client?.connected ||
          pending.current ||
          Date.now() - last.current < 1000
        )
          return;
        const input = pingInput.safeParse({
          sequence: sequence.current + 1,
          capturedAt: new Date(position.timestamp).toISOString(),
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracyMeters: position.coords.accuracy,
        });
        if (!input.success) {
          setMessage("Waiting for a location accurate to 50 metres or better.");
          return;
        }
        pending.current = true;
        last.current = Date.now();
        try {
          const result = pingAck.parse(
            await client
              .timeout(5000)
              .emitWithAck("telemetry:ping", input.data),
          );
          if (own !== generation.current) return;
          if (!result.ok) throw new Error(result.error.message);
          sequence.current = result.ride.lastSequence;
          setRide(result.ride);
          setMessage("Location received.");
        } catch (error) {
          if (own === generation.current) {
            disconnect();
            setMessage(
              (error instanceof Error
                ? error.message
                : "Location acknowledgement failed.") +
                " Reconnect to synchronise before continuing.",
            );
          }
        } finally {
          if (own === generation.current) pending.current = false;
        }
      },
      (error) => {
        if (own === generation.current) {
          stopGPS();
          setMessage(
            error.code === 1
              ? "Location permission was denied."
              : "Location unavailable. Try again outdoors.",
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }
  async function finish() {
    disconnect();
    setBusy(true);
    const own = generation.current;
    try {
      const result = await finishRide(access.current);
      if (own !== generation.current) return;
      setRide(result.ride);
      setMessage("Ride finished.");
    } catch (error) {
      if (own === generation.current)
        setMessage(
          (error instanceof Error ? error.message : "Could not finish ride.") +
            " Reconnect to check its status.",
        );
    } finally {
      if (own === generation.current) setBusy(false);
    }
  }
  const fresh =
    ride?.trackingFresh &&
    ride.lastReceivedAt &&
    now - Date.parse(ride.lastReceivedAt) < 30000;
  return (
    <section id="ride" className="panel ride-panel">
      <div>
        <span className="eyebrow">YOUR RIDE</span>
        <h2>Every turn, accounted for.</h2>
        <p>
          Connect an active ride, then choose when to share your location. Keep
          this page open while riding.
        </p>
      </div>
      <div>
        <label htmlFor="ride-token">Ride access token</label>
        <div className="token-row">
          <input
            id="ride-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => {
              disconnect();
              access.current = "";
              setRide(null);
              setToken(e.target.value);
            }}
          />
          <button disabled={busy || !token.trim()} onClick={connect}>
            Connect
          </button>
        </div>
        <p role="status">{message}</p>
        {ride && (
          <>
            <h3>{ride.routeName}</h3>
            <div className="ride-stats">
              <div>
                <small>Status</small>
                <strong>{ride.status}</strong>
              </div>
              <div>
                <small>Recorded distance</small>
                <strong>
                  {ride.distanceMeters === null
                    ? "Unavailable"
                    : (ride.distanceMeters / 1000).toFixed(2) + " km"}
                </strong>
              </div>
              <div>
                <small>Current speed</small>
                <strong>
                  {fresh && ride.currentSpeedKmh !== null
                    ? ride.currentSpeedKmh.toFixed(1) + " km/h"
                    : "Unavailable"}
                </strong>
              </div>
              <div>
                <small>Elapsed time at last update</small>
                <strong>
                  {Math.floor(ride.durationSeconds / 60)}m{" "}
                  {Math.floor(ride.durationSeconds % 60)}s
                </strong>
              </div>
            </div>
            <div className="actions">
              <button disabled={!connected || tracking || busy} onClick={start}>
                Share location
              </button>
              <button disabled={!tracking} onClick={stopGPS}>
                Pause sharing
              </button>
              <button
                disabled={busy || ride.status !== "active" || !access.current}
                onClick={finish}
              >
                Finish ride
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setRide(null);
                  setToken("");
                  access.current = "";
                  setMessage("Disconnected.");
                }}
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
