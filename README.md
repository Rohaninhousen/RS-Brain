# RS-Brain v4

Everything from v1, v2 and v3, plus:
- **Home dashboard** (opens first): this week in one line, quick actions, key numbers, closest rivals ranked by threat and overlap with RecruitSignals, biggest feature gaps vs direct rivals, where we stand out, what changed this week, what needs a check-up, and companies with the most notes.

From v3:
- **Search everything**: one box in the top bar (press / or Ctrl+K). Searches companies, moat reasons, data & tech, company pages, files, demos, battlecards, notes and feature gaps. Use ↑ ↓ and Enter to jump straight to the result.
- **Notes**: quick notes on any company with your name and the time. Shown in the Notes section, on each company page and on its moat card.

From v2:
- **Compare**: up to 4 companies side by side (workflow, moat scores, features, data & tech, our work).
- **Feature gaps**: who has which feature; click a cell to change it. Shows where rivals are ahead of RecruitSignals and where we are unique. Some cells are pre-filled from research, so check them.
- **Battlecards**: where they win, where we win, objections and answers, questions to ask, proof points.
- **What's new**: every change, newest first, with "new since your last visit".
- **Research status and owner** for each company (To research, In progress, Deep-dived, Watching).
- **Positioning map** in Moat analysis: pick any two moats as axes.

## Files
index.html, rs-brain.json (data), vercel.json, middleware.js + package.json (login).

## Deploy (same GitHub repo or a new one)
Upload all files to GitHub (Add file → Upload files → Commit). Vercel redeploys in about 30 seconds.
Login still uses SITE_USER and SITE_PASSWORD from Vercel → Settings → Environment Variables.

If you changed data on the Vercel site after the last kit, keep YOUR rs-brain.json and upload only index.html.
v4 works with older data files; only the pre-filled feature ticks come from the new rs-brain.json.

## Updating data
Edit on the site → Download data file → upload rs-brain.json to GitHub → commit.
