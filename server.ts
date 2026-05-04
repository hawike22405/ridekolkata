import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Simple in-memory "database" ─────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  joinedAt: string;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "ridekolkata_salt").digest("hex");
}

function safeUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// Seed a demo account
const users: User[] = [
  {
    id: "demo-001",
    name: "Demo User",
    email: "demo@ridekolkata.in",
    phone: "+91 98765 43210",
    passwordHash: hashPassword("demo1234"),
    joinedAt: "2024-01-15T10:00:00Z",
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ── Auth endpoints ───────────────────────────────────────────────────────

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      passwordHash: hashPassword(password),
      joinedAt: new Date().toISOString(),
    };
    users.push(newUser);
    res.json({ success: true, user: safeUser(newUser) });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, error: "Incorrect email or password." });
    }

    res.json({ success: true, user: safeUser(user) });
  });

  // ── Cycle rental endpoints ───────────────────────────────────────────────

  const cycles = [
    { id: 1, name: "City Cruiser", type: "Standard", price: 15, available: true, location: [22.5726, 88.3639], description: "Perfect for city streets." },
    { id: 2, name: "Mountain Pro", type: "MTB", price: 25, available: true, location: [22.5851, 88.3468], description: "Tackle any terrain." },
    { id: 3, name: "Electric Glide", type: "Electric", price: 40, available: true, location: [22.5675, 88.3474], description: "Effortless riding." },
    { id: 4, name: "Vintage Kolkata", type: "Classic", price: 20, available: true, location: [22.5958, 88.3433], description: "Classic look, modern feel." },
  ];

  app.get("/api/cycles", (req, res) => {
    res.json(cycles);
  });

  app.post("/api/book", (req, res) => {
    const { cycleId, userId } = req.body;
    res.json({ success: true, bookingId: `BK-${Math.floor(Math.random() * 10000)}`, message: "Booking successful!" });
  });

  // ── Vite / static serving ────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RideKolkata Server running on http://localhost:${PORT}`);
    console.log(`Demo login → demo@ridekolkata.in / demo1234`);
  });
}

startServer();
