import { useCallback, useState } from "react";
import ConfiguredScene from "./integration/ConfiguredScene";
import RidePanel from "./integration/RidePanel";
import { getPrices, getRoutes, getVisual } from "./integration/api";
import { useResource } from "./integration/useResource";
import "./integration/integration.css";
const visualLoader = (signal: AbortSignal) => getVisual(signal);
const money = (minor: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    minor / 100,
  );
function Notice({
  loading,
  error,
  empty,
  retry,
}: {
  loading: boolean;
  error: Error | null;
  empty: boolean;
  retry: () => void;
}) {
  return loading ? (
    <p role="status">Loading…</p>
  ) : error ? (
    <div role="status">
      <p>We couldn’t load this right now. {error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  ) : empty ? (
    <p className="empty">Nothing published yet. Check back soon.</p>
  ) : null;
}
export default function App() {
  const [routePage, setRoutePage] = useState(1),
    [pricePage, setPricePage] = useState(1);
  const routes = useResource(
    useCallback(
      (signal: AbortSignal) => getRoutes(routePage, signal),
      [routePage],
    ),
    30000,
  );
  const prices = useResource(
    useCallback(
      (signal: AbortSignal) => getPrices(pricePage, signal),
      [pricePage],
    ),
    30000,
  );
  const visual = useResource(visualLoader, 30000, true);
  return (
    <div className="connected-app">
      <header className="nav">
        <a className="brand" href="#">
          RIDE<span>KOLKATA</span>
          <i>↗</i>
        </a>
        <nav aria-label="Main navigation">
          <a href="#routes">Routes</a>
          <a href="#pricing">Pricing</a>
          <a href="#ride" className="nav-cta">
            Your ride ↗
          </a>
        </nav>
      </header>
      <main>
        <section className="intro">
          <div className="intro-copy">
            <span className="eyebrow">TWO WHEELS. ONE INCREDIBLE CITY.</span>
            <h1>
              Take the
              <br />
              scenic <em>route.</em>
            </h1>
            <p>
              A different pace. A closer look. Discover Kolkata from the saddle,
              with routes and rates published by the Ride Kolkata team.
            </p>
            <div className="actions">
              <a className="button" href="#routes">
                Explore routes <span>↗</span>
              </a>
              <a href="#ride" className="text-link">
                Already riding? →
              </a>
            </div>
          </div>
          <div className="visual-wrap">
            <ConfiguredScene config={visual.data} />
            <div className="visual-caption">
              <span>THE RIDE, IN DETAIL</span>
              <button className="quiet" onClick={visual.refresh}>
                Refresh view ↻
              </button>
            </div>
            {visual.error && (
              <p className="muted" role="status">
                The 3D configuration is currently unavailable.
              </p>
            )}
          </div>
        </section>
        <section id="routes" className="catalog">
          <div className="section-head">
            <div>
              <span className="eyebrow">CHOOSE YOUR NEXT TURN</span>
              <h2>The city is yours to explore.</h2>
            </div>
            <button className="quiet" onClick={routes.refresh}>
              Refresh routes ↻
            </button>
          </div>
          <Notice
            loading={routes.loading}
            error={routes.error}
            empty={!routes.data?.data.length}
            retry={routes.refresh}
          />
          <div className="grid">
            {routes.data?.data.map((route) => (
              <article className="route-card" key={route.id}>
                <div className="route-icon" aria-hidden="true">
                  ↗
                </div>
                <h3>{route.name}</h3>
                <p>{route.description}</p>
                <details>
                  <summary>View route coordinates</summary>
                  <ol className="coordinates">
                    {[route.start, ...route.waypoints, route.end].map(
                      (point, i) => (
                        <li key={i}>
                          {i === 0
                            ? "Start"
                            : i === route.waypoints.length + 1
                              ? "End"
                              : "Waypoint " + i}
                          : {point.coordinates[1]}, {point.coordinates[0]}
                        </li>
                      ),
                    )}
                  </ol>
                </details>
              </article>
            ))}
          </div>
          {routes.data && routes.data.total > 12 && (
            <div className="pagination">
              <button
                disabled={routePage === 1}
                onClick={() => setRoutePage((p) => p - 1)}
              >
                Previous
              </button>
              <span>Page {routePage}</span>
              <button
                disabled={routePage * 12 >= routes.data.total}
                onClick={() => setRoutePage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
        <section id="pricing" className="catalog">
          <div className="section-head">
            <div>
              <span className="eyebrow">PLAN YOUR PACE</span>
              <h2>Know your rate.</h2>
            </div>
            <button className="quiet" onClick={prices.refresh}>
              Refresh rates ↻
            </button>
          </div>
          <Notice
            loading={prices.loading}
            error={prices.error}
            empty={!prices.data?.data.length}
            retry={prices.refresh}
          />
          <div className="grid">
            {prices.data?.data.map((price) => (
              <article className="price-card" key={price.id}>
                <span className="eyebrow">{price.name}</span>
                <h3>
                  {money(price.perMinuteMinor)}
                  <small> / minute</small>
                </h3>
                <dl>
                  <div>
                    <dt>Base fare</dt>
                    <dd>{money(price.baseFareMinor)}</dd>
                  </div>
                  <div>
                    <dt>Surge multiplier</dt>
                    <dd>{price.surgeMultiplier}×</dd>
                  </div>
                </dl>
                <p className="muted">
                  Estimated fare = (base fare + minutes × per-minute rate) ×
                  surge. This page does not collect payments.
                </p>
              </article>
            ))}
          </div>
          {prices.data && prices.data.total > 12 && (
            <div className="pagination">
              <button
                disabled={pricePage === 1}
                onClick={() => setPricePage((p) => p - 1)}
              >
                Previous
              </button>
              <span>Page {pricePage}</span>
              <button
                disabled={pricePage * 12 >= prices.data.total}
                onClick={() => setPricePage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
        <RidePanel />
      </main>
      <footer>
        <a className="brand" href="#">
          RIDE<span>KOLKATA</span>
        </a>
        <p>See more. Ride Kolkata.</p>
        <a href="/admin/">Administrator portal ↗</a>
      </footer>
    </div>
  );
}
