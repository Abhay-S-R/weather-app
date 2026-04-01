# Havamana — Real-Time Weather App

A modern, full-stack weather application with real-time weather data, city search, geolocation, and an AI-powered weather assistant.

**Live Demo:** [havamana.onrender.com](https://havamana.onrender.com)

## Features

- 🌦️ **Real-Time Weather** — Temperature, humidity, wind speed, pressure, visibility, and cloudiness
- 🔍 **City Search** — Search any city worldwide with autocomplete suggestions
- 📍 **Geolocation** — Auto-detect your location on page load
- 🤖 **AI Weather Assistant** — Chat with a Gemini-powered assistant that gives personalized weather advice
- 🌅 **Dynamic Backgrounds** — Background images change based on weather conditions and time of day
- 💀 **Skeleton Loading** — Smooth loading states that match the UI layout
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- **React 19** + **Vite** — Fast development and optimized production builds
- **Vanilla CSS** — Custom styling with animations and glassmorphism effects

### Backend
- **Express 5** — API proxy server with route handlers
- **Zod** — Request validation on all API endpoints
- **Winston** — Structured logging with environment-aware transports
- **Helmet** — HTTP security headers
- **express-rate-limit** — Global and per-route rate limiting
- **LRU Cache** — In-memory caching for API responses

### External APIs
- [OpenWeather API](https://openweathermap.org/api) — Weather data and geocoding
- [GeoJS](https://www.geojs.io/) — IP-based geolocation
- [Google Gemini](https://ai.google.dev/) — AI chat assistant

## Project Structure

```
weather-app/
├── src/                    # Frontend (React)
│   ├── components/         # UI components
│   │   ├── ChatPanel/      # AI weather chat interface
│   │   ├── SearchBar/      # City search with autocomplete
│   │   ├── WeatherDisplay/ # Weather data cards
│   │   ├── WeatherSkeleton/# Loading skeleton UI
│   │   ├── Footer/         # App footer
│   │   └── ErrorBoundry/   # Error boundary wrapper
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   └── HomePage/           # Main page component
├── server/                 # Backend (Express)
│   ├── routes/
│   │   ├── weather.js      # /api/weather — weather data proxy
│   │   ├── geo.js          # /api/geo — geocoding & IP location
│   │   └── chat.js         # /api/chat — AI assistant endpoint
│   ├── utils/
│   │   ├── cache.js        # LRU cache utility
│   │   └── logger.js       # Winston logger setup
│   └── index.js            # Server entry point
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- [OpenWeather API key](https://openweathermap.org/appid)
- [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhay-S-R/weather-app.git
cd weather-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Environment Setup

Create a `.env` file in the `server/` directory:

```env
OPENWEATHER_API_KEY=your_openweather_key
GEMINI_API_KEY=your_gemini_key
CORS_ORIGIN=http://localhost:5173
```

### Running Locally

Open two terminals:

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

This app is deployed on [Render](https://render.com) as two services:

| Service | Type | Root Directory |
|---|---|---|
| Frontend | Static Site | `/` (repo root) |
| Backend | Web Service | `server/` |

The frontend uses Render's rewrite rules to proxy `/api/*` requests to the backend service.

### Backend Environment Variables (Render)

| Variable | Description |
|---|---|
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGIN` | Frontend URL |
| `NODE_ENV` | Set to `production` |

