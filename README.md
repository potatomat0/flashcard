# How to run this project:

Make sure you have the latest version of NodeJS installed on your system.

change the `.example.env` file name to `.env` and enter your own mongoDB connection credential  

```bash
npm install
npm start
```
A listening daemon at port 5001 will be running 
more detailed documents can be found at `./document` within this repo

## Render Cron Job (keep service warm)

This repo includes a small ping to keep the Render free instance responsive between requests:

- Script: `scripts/ping.js` (HTTPS GET to your base URL)
- NPM script: `npm run ping:once`
- Blueprint: `render.yaml` defines a cron running every 14 minutes

Setup via Render Blueprints:

1) Push `render.yaml` to your default branch
2) In Render, New → Blueprint → select this repo and apply

Or manual Cron Job:

- Build Command: `npm ci` (or `npm install`)
- Command: `npm run ping:once`
- Schedule: `*/14 * * * *`
- Env vars (optional): `PING_URL=https://flashcard-rs95.onrender.com/`

The ping hits `GET /` which is served by Express in `index.js`.
