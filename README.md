# NYC Transit Hub

NYC Transit Hub is a full-stack web application for viewing real-time New York City subway and bus service alerts. It uses the official MTA GTFS-RT alerts feed, exposes a small Flask API, and presents the data in a Next.js dashboard with search, favorites, summary cards, and automatic refresh.

## Features

- Real-time subway and bus service alerts from MTA GTFS-RT data.
- Separate subway and bus sections with alerts prioritized above good service.
- Search by route, alert title, or alert details.
- Favorite routes saved in the browser with `localStorage`.
- Summary dashboard for totals, active alerts, favorites, and last updated time.
- Auto-refresh every 60 seconds.
- Expandable good-service sections and bus list pagination.

## Tech Stack

- Frontend: Next.js App Router, React, Tailwind CSS setup, custom component styling.
- Backend: Flask, Flask-CORS, Requests, GTFS Realtime bindings.
- Data source: MTA GTFS-RT Alerts API.

## Project Structure

```text
NYC-transit-hub-main/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── routes/
│   │   └── transit.py
│   └── services/
│       ├── mta_alerts_service.py
│       └── mta_service.py
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.js
│   ├── package.json
│   └── env.local.example
└── README.md
```

## Environment Variables

Create a backend environment file from the example:

```bash
cp backend/.env.example backend/.env
```

Backend variables:

```bash
FLASK_DEBUG=True
PORT=5000
MTA_SUBWAY_ALERTS_URL=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys/all-alerts
MTA_BUS_ALERTS_URL=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys/all-alerts
MTA_API_KEY=
```

Create a frontend environment file from the example:

```bash
cp frontend/env.local.example frontend/.env.local
```

Frontend variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

The sample MTA URL points to the all-alerts GTFS-RT feed. You can replace it with another MTA GTFS-RT alerts feed if your project or instructor requires a specific endpoint. If the MTA endpoint returns `403 Forbidden`, create an API key from the MTA Developer Resources page and set `MTA_API_KEY` in `backend/.env`.

## Run Locally

### 1. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

The backend runs at `http://127.0.0.1:5000` by default.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
cp env.local.example .env.local
npm run dev
```

The frontend runs at `http://localhost:3000` by default.

## API Endpoints

- `GET /` - backend status message.
- `GET /api/transit/health` - health check.
- `GET /api/transit/status` - combined subway and bus alert payload.

Example response shape:

```json
{
  "subway": [],
  "bus": [],
  "summary": {
    "subway_total": 24,
    "subway_alerts": 0,
    "bus_total": 13,
    "bus_alerts": 0
  },
  "meta": {
    "source": "MTA GTFS-RT Alerts",
    "generated_at": 1760000000
  }
}
```

## Demo Flow

1. Start the Flask backend and confirm `GET /api/transit/health` returns `{"status":"ok"}`.
2. Start the Next.js frontend and open `http://localhost:3000`.
3. Show the summary cards and last updated time.
4. Search for a route such as `A`, `1`, or `M15`.
5. Toggle a route favorite and refresh the page to show that it persists.
6. Expand the good-service sections and show the bus pagination control.

## Notes

- This MVP is a service-alert dashboard, not a trip planner or geographic map.
- The frontend reads data from `NEXT_PUBLIC_API_BASE_URL + /api/transit/status`.
- The backend does not store MTA data; it fetches and parses the GTFS-RT feed on request.
- Some MTA endpoints require an API key in the `x-api-key` request header. The backend sends this header automatically when `MTA_API_KEY` is configured.
