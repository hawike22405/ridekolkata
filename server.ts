import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasMainCycleGlb: fs.existsSync(path.join(process.cwd(), 'public', 'Main Cycle.glb')),
    timestamp: new Date().toISOString(),
  });
});

// Explicit Handler for Main Cycle.glb to ensure binary content-type and 404 handling
app.get(['/Main%20Cycle.glb', '/Main Cycle.glb'], (req, res) => {
  const modelPath = path.join(process.cwd(), 'public', 'Main Cycle.glb');
  if (fs.existsSync(modelPath)) {
    res.setHeader('Content-Type', 'model/gltf-binary');
    return res.sendFile(modelPath);
  }
  return res.status(404).json({ error: 'Main Cycle.glb not found in public directory' });
});

// Upload endpoint for Main Cycle.glb (supports raw binary upload)
app.post('/api/upload-model', express.raw({ type: '*/*', limit: '100mb' }), (req, res) => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const targetPath = path.join(publicDir, 'Main Cycle.glb');
    fs.writeFileSync(targetPath, req.body);
    console.log(`[Server] Saved Main Cycle.glb (${req.body.length} bytes) to ${targetPath}`);
    res.json({
      success: true,
      size: req.body.length,
      path: '/Main Cycle.glb',
      message: 'Model saved successfully.',
    });
  } catch (err: any) {
    console.error('[Server] Failed to save uploaded model:', err);
    res.status(500).json({ error: err.message || 'Failed to save model' });
  }
});

// AI Route Recommender Endpoint
app.post('/api/recommend-routes', async (req, res) => {
  const { pastRides = [], preferences = {} } = req.body;

  const gemini = getGeminiClient();

  if (!gemini) {
    console.log('[API] GEMINI_API_KEY not found in environment, returning null to let client use intelligent heuristic fallback.');
    return res.status(503).json({
      error: 'GEMINI_API_KEY not configured',
      useFallback: true,
    });
  }

  try {
    const prompt = `You are the chief AI Route Architect for "Ride Kolkata", a high-octane urban micromobility & cycling heritage platform in Kolkata, India.

A cyclist has requested a personalized heritage circuit recommendation based on their past ride history and stored app preferences.

PAST RIDE HISTORY (from app LocalStorage):
${JSON.stringify(pastRides, null, 2)}

RIDER STORED ROUTE PREFERENCES:
${JSON.stringify(preferences, null, 2)}

INSTRUCTIONS:
1. Carefully analyze their past rides: average speeds, total distance, favorite times of day, notes, and the preferred difficulty (${preferences.preferredDifficulty || 'Moderate'}).
2. Recommend:
   - "riderPersona": title, tagline, keyTraits (array of 3 short badges), paceCategory.
   - "primaryRecommendation": A deeply detailed, immersive heritage circuit perfectly tailored to their difficulty and past telemetry.
   - "alternativeCircuits": An array of 2 alternative heritage circuits (e.g. one lighter/recovery and one higher intensity/endurance).
   - "aiSummaryRationale": 2-3 sentences explaining exactly why this primary route was engineered for them based on specific past ride stats.
3. Incorporate real Kolkata landmarks: Victoria Memorial, Red Road aero straights, Prinsep Ghat, Howrah Bridge, Vidyasagar Setu, College Street Boi Para, Kumartuli, Bowbazar, B.B.D. Bagh/Dalhousie, St. Paul's Cathedral, Southern Avenue, Rabindra Sarobar, or New Town Eco-Grid.
4. Provide realistic values:
   - distanceKm (number)
   - avgSpeedKmh (number)
   - estimatedDuration (e.g. "45 mins")
   - matchScorePercent (number 88-99)
   - matchReasoning (1-2 sentences referencing specific past ride metrics)
   - stops (string formatted with ➔ arrows)
   - surfaceComposition (e.g. "90% Smooth Asphalt, 10% Riverside Flagstone")
   - bestTimeSlot (e.g. "23:00 - 02:00 (Midnight Nocturnal Breeze)")
   - elevationGainM (number)
   - recommendedSteed: { name: string, type: string, reason: string }
   - projectedStats: { calories: number, co2SavedKg: number, ecoXp: number }
   - waypoints: array of 3-4 objects with { name, landmark, audioNote, historicalTrivia }
   - streetTips: array of 3 punchy local Kolkata street advice items
   - image: either "/howrah-bridge.jpg", "/prinsep-ghat.jpg", or a relevant cycling photo.

Respond ONLY with valid JSON following this exact structure:
{
  "riderPersona": {
    "title": "string",
    "tagline": "string",
    "keyTraits": ["string", "string", "string"],
    "paceCategory": "string"
  },
  "primaryRecommendation": {
    "id": "rec-ai-01",
    "code": "AI-HERITAGE 01",
    "title": "string",
    "difficulty": "${preferences.preferredDifficulty || 'Moderate'}",
    "distanceKm": 16.5,
    "estimatedDuration": "45 mins",
    "avgSpeedKmh": 20.5,
    "matchScorePercent": 96,
    "matchReasoning": "string referencing past rides",
    "historicalBackstory": "string",
    "stops": "Landmark 1 ➔ Landmark 2 ➔ Landmark 3",
    "surfaceComposition": "string",
    "bestTimeSlot": "string",
    "elevationGainM": 14,
    "recommendedSteed": {
      "name": "The Yellow Taxi Stealth",
      "type": "Electric High-Torque",
      "reason": "string"
    },
    "projectedStats": {
      "calories": 480,
      "co2SavedKg": 2.2,
      "ecoXp": 320
    },
    "waypoints": [
      {
        "name": "string",
        "landmark": "string",
        "audioNote": "string",
        "historicalTrivia": "string"
      }
    ],
    "streetTips": ["tip 1", "tip 2", "tip 3"],
    "image": "/howrah-bridge.jpg"
  },
  "alternativeCircuits": [
    {
      "id": "rec-ai-alt1",
      "code": "AI-HERITAGE 02",
      "title": "string",
      "difficulty": "Easy",
      "distanceKm": 11.2,
      "estimatedDuration": "35 mins",
      "avgSpeedKmh": 16.0,
      "matchScorePercent": 91,
      "matchReasoning": "string",
      "historicalBackstory": "string",
      "stops": "Landmark A ➔ Landmark B",
      "surfaceComposition": "string",
      "bestTimeSlot": "string",
      "elevationGainM": 8,
      "recommendedSteed": { "name": "Ghats Cruiser V2", "type": "Belt-Hybrid", "reason": "string" },
      "projectedStats": { "calories": 310, "co2SavedKg": 1.4, "ecoXp": 190 },
      "waypoints": [{ "name": "string", "landmark": "string", "audioNote": "string", "historicalTrivia": "string" }],
      "streetTips": ["tip 1"],
      "image": "/prinsep-ghat.jpg"
    }
  ],
  "aiSummaryRationale": "string"
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from Gemini model');
    }

    const parsed = JSON.parse(responseText);
    return res.json({
      ...parsed,
      isAiGenerated: true,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API Error in /api/recommend-routes]:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate AI route recommendation',
      useFallback: true,
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RideKolkata] Full-stack dev server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
