# Hydropower Plant Simulator

This repository contains a full-stack hydropower plant simulator with:
- Backend: Node.js + Express API
- Frontend: React + Vite UI
- FDC visualization using Recharts

## Run Instructions

### 1. Start the backend

Open a terminal in `c:\Users\Lenovo\Desktop\Dam`

```bash
npm install
npm start
```

The backend server will run on `http://localhost:5000`.

### 2. Start the frontend

Open another terminal in `c:\Users\Lenovo\Desktop\Dam\client`

```bash
npm install
npm run dev
```

Then open the local dev URL shown in the terminal (usually `http://localhost:5173`).

### 3. Connect frontend to backend

The frontend reads the backend API base URL from Vite environment variables.
Create a file at `client/.env` with:

```bash
VITE_API_BASE=http://localhost:5000
```

If your backend is deployed, set `VITE_API_BASE` to the deployed backend URL.

## API Endpoints

- `POST /calculate-power`
- `POST /recommend-turbine`
- `POST /fdc`

## Notes

- Use numeric inputs for flow, head, efficiency.
- Flow data must be a comma-separated list of values for the FDC graph.
- The frontend handles API errors and input validation gracefully.
