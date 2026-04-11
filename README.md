# ⚾ ParkEats — PWA

Browse and track food at all 30 MLB ballparks. Works as a Progressive Web App — install it on your phone's home screen directly from the browser. No app store, no cost.

## 🚀 Deploy to Vercel (Free — 5 minutes)

### Step 1 — Get the code on GitHub

1. Go to **github.com** and sign up for a free account (if you don't have one).
2. Click **New repository** → name it `parkeats` → click **Create repository**.
3. Upload this entire folder's contents to the repo (drag and drop the files onto the GitHub page, or use the GitHub Desktop app).

### Step 2 — Deploy on Vercel

1. Go to **vercel.com** and sign up with your GitHub account (free).
2. Click **Add New Project**.
3. Select your `parkeats` repository.
4. Vercel auto-detects Vite — just click **Deploy**.
5. Done! Your app is live at `https://parkeats.vercel.app` (or similar).

Every time you push a change to GitHub, Vercel redeploys automatically.

---

## 💻 Run Locally (for development)

Make sure you have **Node.js 18+** installed (nodejs.org).

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Installing on a Phone

**iPhone (Safari):**
1. Open your Vercel URL in Safari.
2. Tap the Share button (box with arrow).
3. Tap **Add to Home Screen**.
4. Tap **Add**.

**Android (Chrome):**
1. Open your Vercel URL in Chrome.
2. A banner appears automatically after a few seconds — tap **Install**.
3. Or tap the three-dot menu → **Add to Home Screen**.

---

## 📁 Project Structure

```
parkeats-pwa/
├── src/
│   ├── App.jsx           # Main app + all 30 parks food data
│   ├── useTracker.js     # Saves logged items to localStorage
│   ├── useInstallPrompt.js  # PWA install banner logic
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles + install banner
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js        # Vite + PWA plugin config
├── vercel.json           # Vercel routing config
└── package.json
```

---

## 🔧 Customising

**Adding new food items:** Open `src/App.jsx` and find the `FOOD_DATA` object. Each park has an array of items — just add new objects following the same pattern:

```js
{ id: 999, name: "Your Item", section: "Section 101", price: "$12",
  category: "Classic", description: "Description here.", isNew: true }
```

**Changing the app name/colours:** Edit `vite.config.js` (manifest) and `src/index.css`.

---

## 🌐 Custom Domain (Optional, Free)

In Vercel → your project → Settings → Domains, you can add a custom domain like `parkeats.com`. Domain registration costs ~$10–15/year through Namecheap or Cloudflare Registrar.

---

Built with React + Vite + vite-plugin-pwa. Deployed free on Vercel.
