# Astrology & Tarot Web App

An interactive astrology chart calculator and tarot reading web application.

## Features
- **Natal Chart**: Full birth chart with deep interpretation — element/mode analysis, stellium detection, aspect patterns, 7-planet deep reading
- **5-Year Forecast**: Outer planet transit projections, 6-month interval timeline, wealth/career/romance topical synthesis
- **Synastry**: Compare two birth charts for relationship compatibility
- **Daily Guidance**: Today's transits and personalized guidance
- **Tarot**: Full 78-card deck with deep interpretations (love/career/advice for all cards), 1-card and 3-card spreads, keyword-based question analysis, element/suit/number cross-card synthesis

## Local Testing
```
cd astro-website
python -m http.server 8080
```
Then open http://localhost:8080

## Deploy to GitHub Pages
1. Create a new repository on GitHub (e.g. `astro-app`)
2. Push this directory:
```
git remote add origin https://github.com/YOUR_USERNAME/astro-app.git
git branch -M main
git push -u origin main
```
3. Go to Settings → Pages → Source: "Deploy from a branch" → branch: `main` → Save
4. Your site will be at `https://YOUR_USERNAME.github.io/astro-app/`

## Deploy to Gitee (码云)
1. Create a new repository on Gitee
2. Push this directory:
```
git remote add gitee https://gitee.com/YOUR_USERNAME/astro-app.git
git push -u gitee master
```
3. Go to Services → Gitee Pages → Deploy

## Deploy to Netlify
1. Drag and drop the `index.html` file to https://app.netlify.com/drop
2. Done — you'll get a URL immediately

## Tech
- Single-file HTML with inline CSS + JS
- Planetary positions via Keplerian orbital elements
- Placidus house system (bisection scan)
- No external dependencies or API calls required
