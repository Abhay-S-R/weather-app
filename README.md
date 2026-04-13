# Havamana: Real-Time Weather App

A modern, full-stack weather application with real-time weather data, city search, geolocation, and an AI-powered weather assistant.

**Live Demo:** [havamana.vercel.app](https://havamana.vercel.app)

## Features

- **Real-Time Weather**: Temperature, humidity, wind speed, pressure, visibility, and cloudiness
- **City Search**: Search any city worldwide with autocomplete suggestions
- **Geolocation**: Auto-detect your location on page load
- **AI Weather Assistant**: Chat with a Gemini-powered assistant that gives personalized weather advice
- **Dynamic Backgrounds**: Background images change based on weather conditions and time of day
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Analytics**: Vercel Web Analytics for visitor insights

## Tech Stack

### Frontend
- **React 19** + **Vite**: Fast development and optimized production builds
- **Vanilla CSS**: Custom styling with animations and glassmorphism effects
- **Vercel Analytics**: Built-in web analytics

### Backend
- **Express 5**: API proxy server with route handlers
- **Zod**: Request validation on all API endpoints
- **Winston**: Structured logging with environment-aware transports
- **Helmet**: HTTP security headers
- **express-rate-limit**: Global and per-route rate limiting
- **LRU Cache**: In-memory caching for API responses

### External APIs
- [OpenWeather API](https://openweathermap.org/api): Weather data and geocoding
- [GeoJS](https://www.geojs.io/): IP-based geolocation
- [Google Gemini](https://ai.google.dev/): AI chat assistant

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

The app is split across two platforms:

| Service | Platform | Details |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Static site with edge CDN |
| Backend | [Render](https://render.com) | Web service (`server/` root directory) |

### Backend Environment Variables (Render)

| Variable | Description |
|---|---|
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGIN` | Frontend URL (e.g. `https://havamana.vercel.app`) |
| `NODE_ENV` | Set to `production` |
