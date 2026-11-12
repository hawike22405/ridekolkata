import { test, expect, Page } from "@playwright/test";
// Isolated browser transport fixtures only; never seeded into the app database.
async function empty(page: Page) {
  await page.route("**/api/catalog/**", (route) =>
    route.fulfill({ json: { data: [], page: 1, limit: 12, total: 0 } }),
  );
  await page.route("**/api/ui/3d-config", (route) =>
    route.fulfill({ status: 404, json: { error: "Not configured" } }),
  );
}
test("empty database and API outage display explicit states with no prototype content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await empty(page);
  await page.goto("/");
  await expect(
    page.getByText("Nothing published yet. Check back soon."),
  ).toHaveCount(2);
  await expect(page.getByText("No 3D configuration available.")).toBeVisible();
  await expect(page.locator(".route-card")).toHaveCount(0);
  await expect(page.locator(".price-card")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Share location", exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/api/catalog/**");
  await page.route("**/api/catalog/**", (route) =>
    route.fulfill({ status: 503, json: { error: "Service unavailable" } }),
  );
  await page.getByRole("button", { name: "Refresh routes" }).click();
  await expect(
    page.getByText("We couldn’t load this right now. Service unavailable"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("configured catalogs render only supplied records and do not retain malformed output", async ({
  page,
}) => {
  await empty(page);
  await page.route("**/api/catalog/routes*", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: "a".repeat(24),
            name: "Contract route only",
            description: "Supplied by test transport",
            start: { type: "Point", coordinates: [88, 22] },
            end: { type: "Point", coordinates: [89, 23] },
            waypoints: [],
            enabled: true,
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        page: 1,
        limit: 12,
        total: 1,
      },
    }),
  );
  await page.route("**/api/catalog/pricing*", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: "b".repeat(24),
            name: "Contract tariff only",
            currency: "INR",
            baseFareMinor: 700,
            perMinuteMinor: 150,
            surgeMultiplier: 1.5,
            enabled: true,
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        page: 1,
        limit: 12,
        total: 1,
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".route-card")).toHaveCount(1);
  await expect(page.locator(".price-card")).toHaveCount(1);
  await expect(page.getByText("Contract route only")).toBeVisible();
  await expect(page.getByText("₹1.50", { exact: false })).toBeVisible();
  await page.getByText("View route coordinates").click();
  await expect(page.getByText("Start: 22, 88")).toBeVisible();
  await page.unroute("**/api/catalog/routes*");
  await page.route("**/api/catalog/routes*", (route) =>
    route.fulfill({
      json: { data: [{ name: "Malformed" }], page: 1, limit: 12, total: 1 },
    }),
  );
  await page.getByRole("button", { name: "Refresh routes" }).click();
  await expect(page.locator(".route-card")).toHaveCount(0);
  await expect(
    page.getByText(
      "We couldn’t load this right now. The server returned invalid data.",
    ),
  ).toBeVisible();
});
test("3D revision changes preserve the canvas; missing config clears it; failed assets show an error", async ({
  page,
}) => {
  await empty(page);
  let revision = 1,
    missing = false,
    badAsset = false;
  await page.route("**/api/ui/3d-config", (route) =>
    missing
      ? route.fulfill({ status: 404, json: { error: "Not configured" } })
      : route.fulfill({
          json: {
            data: {
              schemaVersion: 1,
              modelUrl: badAsset ? "/missing.glb" : "/contract-test.gltf",
              modelScale: 1,
              modelRotationQuaternion: [0, 0, 0, 1],
              lightingIntensity: revision,
              cameraPivotPoints: [
                { position: [0, 0, 3], rotationQuaternion: [0, 0, 0, 1] },
              ],
              cameraFov: 60,
              drivetrainAnimationSpeed: 0,
              hexColors: {
                background: "#000000",
                primary: "#ffffff",
                accent: "#00ff00",
              },
            },
            revision: `00000000-0000-4000-8000-${String(revision).padStart(12, "0")}`,
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        }),
  );
  await page.route("**/contract-test.gltf", (route) =>
    route.fulfill({
      json: { asset: { version: "2.0" }, scene: 0, scenes: [{ nodes: [] }] },
    }),
  );
  await page.route("**/missing.glb", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.goto("/");
  await expect(
    page.getByText("Configured model loaded.", { exact: true }),
  ).toBeVisible();
  await page
    .locator("canvas")
    .evaluate(
      (canvas) => ((canvas as HTMLElement).dataset.identity = "original"),
    );
  revision++;
  await page.getByRole("button", { name: "Refresh view" }).click();
  await expect
    .poll(() => page.locator("canvas").getAttribute("data-identity"))
    .toBe("original");
  await expect(
    page.getByText("Configured model loaded.", { exact: true }),
  ).toBeVisible();
  missing = true;
  await page.getByRole("button", { name: "Refresh view" }).click();
  await expect(page.getByText("No 3D configuration available.")).toBeVisible();
  expect(await page.locator("canvas").getAttribute("data-identity")).toBe(
    "original",
  );
  missing = false;
  badAsset = true;
  revision++;
  await page.getByRole("button", { name: "Refresh view" }).click();
  await expect(page.getByText("Model request failed (404).")).toBeVisible();
});
test("a ride token is used only as a bearer header and does not start GPS automatically", async ({
  page,
}) => {
  await empty(page);
  await page.addInitScript(() => {
    (window as any).__locationRequests = 0;
    navigator.geolocation.watchPosition = () => {
      (window as any).__locationRequests++;
      return 1;
    };
  });
  let auth = "";
  await page.route("**/api/rides/current", (route) => {
    auth = route.request().headers().authorization;
    return route.fulfill({
      json: {
        ride: {
          id: "a".repeat(24),
          riderRef: "test-only",
          routeId: "b".repeat(24),
          routeName: "Closed contract ride",
          status: "completed",
          startedAt: "2026-01-01T00:00:00.000Z",
          endedAt: "2026-01-01T00:01:00.000Z",
          expiresAt: "2026-01-02T00:00:00.000Z",
          serverTime: "2026-01-01T00:01:00.000Z",
          durationSeconds: 60,
          sampleCount: 0,
          lastSequence: 0,
          distanceMeters: null,
          observedSeconds: 0,
          gapSeconds: 0,
          averageSpeedKmh: null,
          sessionAverageSpeedKmh: null,
          currentSpeedKmh: null,
          trackingFresh: false,
          lastReceivedAt: null,
          lastPosition: null,
        },
      },
    });
  });
  await page.goto("/");
  await page.getByLabel("Ride access token").fill("test-only-capability");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("This ride has ended.")).toBeVisible();
  expect(auth).toBe("Bearer test-only-capability");
  expect(await page.evaluate(() => (window as any).__locationRequests)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(page.url()).not.toContain("test-only");
  await expect(
    page.getByRole("button", { name: "Share location", exact: true }),
  ).toBeDisabled();
});
test("mobile layout fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await empty(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "test-results/mobile-empty.png",
    fullPage: true,
  });
});

test("active rider shares only after consent, stops on rejection, resynchronizes, and finishes", async ({
  page,
}) => {
  const { createServer } = await import("node:http");
  const { Server } = await import("socket.io");
  const server = createServer(),
    io = new Server(server, { transports: ["websocket"] });
  const start = new Date(Date.now() - 60000).toISOString();
  let ride = {
    id: "a".repeat(24),
    riderRef: "test-only",
    routeId: "b".repeat(24),
    routeName: "Active contract ride",
    status: "active",
    startedAt: start,
    endedAt: null as string | null,
    expiresAt: new Date(Date.now() + 600000).toISOString(),
    serverTime: new Date().toISOString(),
    durationSeconds: 60,
    sampleCount: 0,
    lastSequence: 0,
    distanceMeters: null as number | null,
    observedSeconds: 0,
    gapSeconds: 0,
    averageSpeedKmh: null,
    currentSpeedKmh: null,
    sessionAverageSpeedKmh: null,
    trackingFresh: false,
    lastReceivedAt: null as string | null,
    lastPosition: null,
  };
  let reject = false;
  const sequences: number[] = [];
  io.use((socket, next) =>
    next(
      socket.handshake.auth.token === "test-only-active"
        ? undefined
        : new Error("Bad token"),
    ),
  );
  io.on("connection", (socket) =>
    socket.on("telemetry:ping", (input, ack) => {
      sequences.push(input.sequence);
      if (reject) {
        ack({
          ok: false,
          error: {
            code: "TEST_REJECTED",
            message: "Test transport rejected capture.",
          },
        });
        return;
      }
      ride = {
        ...ride,
        lastSequence: input.sequence,
        sampleCount: ride.sampleCount + 1,
        distanceMeters: 0,
        lastReceivedAt: new Date().toISOString(),
      };
      ack({ ok: true, duplicate: false, ride });
    }),
  );
  await new Promise<void>((resolve) =>
    server.listen(4199, "127.0.0.1", resolve),
  );
  try {
    await empty(page);
    await page.route("**/api/rides/current", (route) =>
      route.fulfill({ json: { ride } }),
    );
    await page.route("**/api/rides/finish", (route) => {
      ride = {
        ...ride,
        status: "completed",
        endedAt: new Date().toISOString(),
      };
      return route.fulfill({ json: { ride } });
    });
    await page.addInitScript(() => {
      (window as any).__requests = 0;
      (window as any).__clears = 0;
      navigator.geolocation.watchPosition = (success) => {
        (window as any).__requests++;
        (window as any).__position = success;
        return (window as any).__requests;
      };
      navigator.geolocation.clearWatch = () => {
        (window as any).__clears++;
      };
    });
    await page.goto("/");
    await page.getByLabel("Ride access token").fill("test-only-active");
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(
      page.getByText("Connected. Start location sharing when you are ready."),
    ).toBeVisible();
    expect(await page.evaluate(() => (window as any).__requests)).toBe(0);
    const capture = () =>
      page.evaluate(() =>
        (window as any).__position({
          timestamp: Date.now(),
          coords: { longitude: 88, latitude: 22, accuracy: 5 },
        }),
      );
    await page
      .getByRole("button", { name: "Share location", exact: true })
      .click();
    await capture();
    await expect(
      page.getByText("Location received.", { exact: true }),
    ).toBeVisible();
    expect(sequences).toEqual([1]);
    await page
      .getByRole("button", { name: "Pause sharing", exact: true })
      .click();
    expect(await page.evaluate(() => (window as any).__clears)).toBe(1);
    reject = true;
    await page
      .getByRole("button", { name: "Share location", exact: true })
      .click();
    await page.waitForTimeout(1050);
    await capture();
    await expect(
      page.getByText(/Test transport rejected capture/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Share location", exact: true }),
    ).toBeDisabled();
    expect(await page.evaluate(() => (window as any).__clears)).toBe(2);
    reject = false;
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(
      page.getByText("Connected. Start location sharing when you are ready."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Share location", exact: true })
      .click();
    await page.waitForTimeout(1050);
    await capture();
    await expect(
      page.getByText("Location received.", { exact: true }),
    ).toBeVisible();
    expect(sequences).toEqual([1, 2, 2]);
    await page
      .getByRole("button", { name: "Finish ride", exact: true })
      .click();
    await expect(
      page.getByText("Ride finished.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Finish ride", exact: true }),
    ).toBeDisabled();
    expect(await page.evaluate(() => (window as any).__clears)).toBe(3);
  } finally {
    await new Promise<void>((resolve) => io.close(() => resolve()));
  }
});
