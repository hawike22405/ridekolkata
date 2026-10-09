<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aa42319f-ed61-4b7a-8c8b-dac7b4fc74a6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Phase 1 MongoDB backend

The independently deployable Node.js/Express admin backend lives in [`backend/`](backend/README.md). It provides strict route/pricing models, JWT admin authentication, CRUD endpoints, an admin console, and container/serverless entry points without seeding business records.

Start with `cd backend`, then follow [backend setup](backend/README.md). The root app and its npm commands remain separate. Use a different backend port when running both services locally.

Frontend database integration is pending Phase 4; existing frontend mock data and legacy fallback behavior have not been migrated by this addition. No Atlas credentials are committed.
