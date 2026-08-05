<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚲 RideKolkata

A cycle rental web app for Kolkata — browse available bikes, view them on a map, and book rides across the city.

## Prerequisites

- **Node.js** v20+ — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/hawike22405/ridekolkata.git
cd ridekolkata

# 2. Install dependencies
npm install

# 3. (Optional) Set up your Gemini API key
#    Copy .env.example to .env.local and add your key
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

The app will be running at **http://localhost:3000**

## Demo Login

| Email | Password |
|---|---|
| `demo@ridekolkata.in` | `demo1234` |

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js (in-memory data)
- **Maps:** Leaflet / React-Leaflet
- **Animations:** Motion (Framer Motion)
- **3D:** React Three Fiber

## Troubleshooting

If `npm run dev` fails with `'node' is not recognized`:

1. Make sure Node.js is installed: `node --version`
2. If it works in PowerShell but not via npm, **restart your PC** to refresh the system PATH
3. As a workaround, run directly:
   ```bash
   node node_modules/tsx/dist/cli.mjs server.ts
   ```

## License

MIT
