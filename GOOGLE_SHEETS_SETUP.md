# 📊 Google Sheets Setup Guide for ParkEats

This guide connects ParkEats to a Google Sheet so you can add new food items 
from any device — no code changes needed.

---

## Step 1 — Create the Google Sheet

1. Go to **sheets.google.com** (sign in with your Google account).
2. Click **Blank spreadsheet**.
3. Name it **ParkEats Food Data** (top left where it says "Untitled spreadsheet").

---

## Step 2 — Import the template data

1. In Google Sheets, go to **File → Import**.
2. Click **Upload**, then drag in the file:
   `src/data/parkeats-sheet-template.csv`
3. In the import dialog:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Click **Import data**

You now have all 270+ food items pre-loaded, one row per item.

---

## Step 3 — Publish the sheet to the web

This makes the data publicly readable (like a website) without requiring login.

1. Go to **File → Share → Publish to web**.
2. In the first dropdown, select **Sheet1** (or whatever your sheet tab is named).
3. In the second dropdown, select **Comma-separated values (.csv)**.
4. Click **Publish**.
5. Click **OK** when it asks you to confirm.
6. **Copy the URL** that appears — it looks like:
   ```
   https://docs.google.com/spreadsheets/d/LONG_ID_HERE/pub?gid=0&single=true&output=csv
   ```

---

## Step 4 — Add the URL to ParkEats

1. Open `src/App.jsx` in a text editor.
2. Find this line near the top:
   ```js
   const SHEET_URL = ''
   ```
3. Paste your URL inside the quotes:
   ```js
   const SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_ID/pub?gid=0&single=true&output=csv'
   ```
4. Save the file.

---

## Step 5 — Deploy the update

```bash
git add .
git commit -m "connect Google Sheets"
git push
```

Vercel redeploys automatically. Done!

---

## ✏️ Adding a New Food Item (the whole point!)

1. Open your Google Sheet.
2. Scroll to the bottom.
3. Add a new row. Fill in all columns:

| Column | Example |
|--------|---------|
| park_id | `yankees` |
| food_id | `999` (any unique number) |
| name | `Lobster Dog` |
| section | `Section 132` |
| price | `$18` |
| category | `Classic` |
| description | `A hot dog topped with fresh Maine lobster.` |
| is_new | `true` |
| team | `New York Yankees` |
| park | `Yankee Stadium` |
| city | `New York, NY` |

4. Save the sheet (it auto-saves).
5. **That's it.** ParkEats refreshes its data every 6 hours, so all users 
   see the new item the next time they open the app.

---

## 🔄 How the caching works

- App opens → checks if cached data is less than 6 hours old
- If fresh: uses cache instantly (fast, works offline)
- If stale: fetches new data from your Google Sheet in the background
- If Sheet is unreachable: uses the last cached data (or the built-in fallback)

This means the app always loads quickly and always works offline, even on 
bad stadium WiFi.

---

## 📋 Column Reference

| Column | Required | Notes |
|--------|----------|-------|
| park_id | ✅ | Must match the IDs in DIVISION_IDS in App.jsx |
| food_id | ✅ | Any unique integer — don't reuse IDs |
| name | ✅ | Food item name |
| section | ✅ | Where to find it in the park |
| price | ✅ | Include the $ sign, e.g. `$14` |
| category | ✅ | Must be one of: Classic, Seafood, Sandwiches, Sides, Snacks, Dessert, BBQ, Mexican, Pizza, Healthy, Asian, Burgers, Drinks |
| description | ✅ | 1-2 sentence description |
| is_new | ✅ | `true` or `false` — shows the 🆕 2026 badge |
| team | ✅ | Full team name, e.g. `New York Yankees` |
| park | ✅ | Full park name, e.g. `Yankee Stadium` |
| city | ✅ | City and state, e.g. `New York, NY` |

---

## 🆕 Marking items as new

Set `is_new` to `true` to show the green 🆕 2026 badge on a food card.
Set it to `false` (or leave blank) for regular items.

---

## ❓ Troubleshooting

**App shows "offline mode":**
The sheet URL might be wrong, or the sheet isn't published publicly.
Re-check Step 3 — make sure you published as CSV, not as a webpage.

**New item not showing up:**
The app caches data for 6 hours. Either wait, or clear your browser's 
local storage (DevTools → Application → Local Storage → Delete) and reload.

**"live" indicator not showing:**
The sheet fetch might be blocked by CORS on some browsers. This is a known 
limitation of the free CSV approach — it works fine on most devices but 
occasionally Safari blocks it. The cached or fallback data still works.
