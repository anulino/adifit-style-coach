# Adifit Style Coach

Adifit Style Coach is a full-stack web application that blends personal styling guidance with fitness planning. The Express server exposes REST endpoints for managing user profiles, generating AI-powered virtual try-on images, and building adaptive workout plans, while the Vite/React client offers an interactive dashboard for trying looks, scheduling workouts, and reviewing saved outfits.

## Features

- **Virtual try-on generation** – Upload a selfie and experiment with curated Adidas-inspired looks rendered through Google Gemini image generation.
- **Personalized training plans** – Configure goals, preferred weekdays, and session duration to receive structured workout plans.
- **User wardrobe history** – Save generated outfits and revisit previous virtual try-on results.
- **Single codebase** – A unified repository that serves both the client and API from one Express entry point for smooth local development.

## Prerequisites

- Node.js 20.x or newer
- npm 10.x or newer (bundled with Node.js 20)
- A [Google Gemini API key](https://ai.google.dev/) stored in the `GEMINI_API_KEY` environment variable for virtual try-on image generation

## Installation

1. Clone the repository and move into the project directory:

   ```bash
   git clone <repository-url>
   cd adifit-style-coach
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Environment configuration

Create a `.env` file in the project root (next to `package.json`) and add any required environment variables:

```bash
cp .env.example .env # if you have a template
```

If an example file is not available, create a new `.env` file and set:

```ini
GEMINI_API_KEY=your-google-gemini-api-key
PORT=5000 # optional, defaults to 5000
```

> 💡 The application will still boot without `GEMINI_API_KEY`, but AI image generation routes will fail until the key is provided.

## Running the app locally

1. Start the development server:

   ```bash
   npm run dev
   ```

   This launches the Express server with Vite middleware on [http://localhost:5000](http://localhost:5000). Both the API and the React client are served from this single port. Any file changes automatically trigger hot module replacement (HMR).

2. Open the site in your browser at `http://localhost:5000` and begin exploring the dashboard.

### Available scripts

- `npm run dev` – Run the development server with live reloading.
- `npm run build` – Produce optimized production bundles for the client and server.
- `npm run start` – Serve the built application (requires `npm run build` first).
- `npm run check` – Type-check the project.
- `npm run db:push` – Synchronize Drizzle schema changes to the configured database (not required for the in-memory demo storage).

## Project structure

```
client/        # React application powered by Vite and Tailwind CSS
server/        # Express entrypoint, REST routes, and Gemini integration
shared/        # Shared types, validation schemas, and mock data
attached_assets/ # Static design references
```

## Troubleshooting

- **Port already in use** – Set a different `PORT` value in `.env` before running `npm run dev`.
- **Gemini API errors** – Ensure `GEMINI_API_KEY` is present and valid. Calls may fail if the key lacks image generation access.
- **Missing styles** – Verify Tailwind CSS is compiling by checking the terminal output for PostCSS errors.

For additional help or to file issues, please open a ticket in the repository's issue tracker.
