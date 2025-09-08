# HeroFit Tracker (PWA)

A simple **offline-first fitness tracker** you can install on your **iPhone**. No PC needed after deployment.

## Features
- Quick-add for your actual foods (fried quail eggs, sisig, Bicol, tuna, chicken, rice)
- Log meals with calories & protein
- Log workouts (Push / Pull / Legs) and custom notes
- Track progress: weight & waist
- Works offline (PWA + service worker)
- Export/Import data (JSON backup)

## How to Use on iPhone
1. **Host the folder** (e.g., Netlify, GitHub Pages, or any static host).
2. Open the site in **Safari** on your iPhone.
3. Tap **Share ▸ Add to Home Screen** to install.
4. It will work offline after the first load.

## Local Setup (optional)
If you just want to preview on a computer:
- Serve the folder with any static server (or open `index.html` directly).
- The service worker requires `http://` or `https://` to cache properly.

## Customize Foods
Edit `app.js` → `FOODS` array. Example:
```js
{name:'Chicken Breast 200g', kcal:330, protein:62}
```

## Data & Privacy
All data is stored **locally on your device** using `localStorage`.
Use **Export** (Settings tab) to back up and **Import** to restore.

## Calories & Protein
All values are estimates. Adjust to your labels/recipes as needed.
