# RS-Brain

Competitor research for RecruitSignals: who we compete with, how strong they are, and what the team knows about them. One static page (`index.html`) plus a data file (`rs-brain.json`), with a password gate on Vercel.

## What is inside
- **Home**: a plain summary of everything. Key numbers, where RecruitSignals stands on moats, closest rivals, a card for each section, who we track, what needs a check-up, this week's changes and team notes.
- **Landscape**: every company we track, grouped by what it does for agencies, with a yes/no workflow-coverage table (find jobs, hiring manager, win client, find candidates, match and reach, place and admin) and the headline insights. Click a row to edit it.
- **Compare**: up to four companies side by side (workflow, moat scores, data & tech, our work).
- **Moat analysis**: each product scored 0 to 10 on eight moats, with reasons, a ranking and a positioning map.
- **Product analysis**: our own deep write-up of a product, with demos, screenshots, notes and attached files. If a PDF is attached, a **Page view | Original PDF** switch shows the original file as uploaded.
- **Data & tech**: how each player collects and processes its data, with pricing and cadence.
- **Notes**: what the team hears from calls, demos and events, with name and time.
- **What's new**: every change, newest first, with "new since your last visit".
- **Search everything**: one box in the top bar (press `/` or `Ctrl+K`). Searches companies, moat reasons, data & tech, product pages, demos, notes and updates. Supports several words, `"exact phrases"` and `-exclusions`, forgives typos, shows where each result lives, and has filter chips. Use ↑ ↓ and Enter to jump to the result.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `rs-brain.json` | The data. Overrides the data built into `index.html` when it is served |
| `middleware.js` | Sign-in page and password check (Vercel) |
| `package.json` | Dependency for `middleware.js` |
| `vercel.json` | Stops the data file being cached |

## Updating the data
1. Open the site and edit (it saves as a draft in your browser).
2. Click **Download data file** to get `rs-brain.json`.
3. Replace `rs-brain.json` in this repo, commit and push.
4. When you change the data by hand, also change `publishedAt` at the top of the file. Browsers that have an older saved draft then drop it and load the new data.

## Deploying to Vercel
1. In Vercel, add an environment variable `SITE_PASSWORD` (Settings → Environment Variables), then redeploy. Without it the site shows "RS-Brain is locked".
2. Visitors see a simple sign-in page and stay signed in for 30 days. Changing `SITE_PASSWORD` signs everyone out. Sign out any time at `/logout`.
3. Deploy from GitHub (Vercel redeploys on every push to `main`, if the project is linked to this repo) or from your computer:
   ```
   npx vercel login
   npx vercel link
   npx vercel --prod
   ```

## Running locally
Open `index.html` through a local server (for example the VS Code Live Server extension). Opening the file directly works too, but the browser then blocks loading `rs-brain.json`, so you see the data built into `index.html` instead. The login page only runs on Vercel.
