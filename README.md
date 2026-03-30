# Wellness Web Monitor

This repository contains two separate apps:

- `server/`: Flask + MySQL + ML backend
- `depression-app/`: React + Vite frontend

## Render Deployment

This repo is configured for Render with [render.yaml](E:/WellnessMonitor Web App/Souce code of WellnessMonitor/render.yaml).

Render should create two services:

- `wellness-monitor-api`: Python web service from `server/`
- `wellness-monitor-web`: Static site from `depression-app/`

### Required backend environment variables

Set these on the backend service in Render:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DB`
- `GEMINI_API_KEY`

### Important notes

- Do not deploy the whole repo as a single Python service.
- The backend uses `server/servercopy.py` as the Render start command.
- The backend must connect to an external MySQL database. `localhost` will not work on Render.
- Python is pinned in [server/.python-version](E:/WellnessMonitor Web App/Souce code of WellnessMonitor/server/.python-version).
- Node is pinned in [depression-app/.node-version](E:/WellnessMonitor Web App/Souce code of WellnessMonitor/depression-app/.node-version).
