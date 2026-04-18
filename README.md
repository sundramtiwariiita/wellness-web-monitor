# Wellness Web Monitor


This repository contains two separate apps:

- `server/`: Flask + MySQL + ML backend
- `depression-app/`: React + Vite frontend

## Render Deployment



### Required backend environment variables

Set these on the backend service:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DB`
- `GEMINI_API_KEY`

### Important notes

- Do not deploy the whole repo as a single Python service.
- The backend uses `server/servercopy.py` as the start command.
- Python is pinned in [server/.python-version](E:/WellnessMonitor Web App/Souce code of WellnessMonitor/server/.python-version).
- Node is pinned in [depression-app/.node-version](E:/WellnessMonitor Web App/Souce code of WellnessMonitor/depression-app/.node-version).
