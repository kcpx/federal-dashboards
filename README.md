# Federal Economic Dashboards

Two production-ready dashboards with **live FRED + HUD data**:

1. **FRED Economic Dashboard** — Macro indicators, yield curves, inflation, labor market
2. **Housing Affordability Calculator** — Live FMR by ZIP code, rent vs buy, cost burden

## 🟢 Live Data Enabled

### FRED API (Economic Dashboard)
- GDP, Unemployment, CPI, Fed Funds Rate
- Treasury yield curve (1M to 30Y)
- 2Y-10Y spread (recession indicator)
- Housing starts, 30Y mortgage rates
- JOLTS data (job openings, quits, hires)
- Labor force participation

### HUD API (Housing Calculator)
- Fair Market Rents by ZIP code
- Area Median Income limits
- FY 2025 data
- Small Area FMR support

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: CLI (fastest)
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub
1. Push to GitHub
2. Import at vercel.com/new
3. Add environment variables (see below)
4. Deploy

### Environment Variables

For Vercel deployment, add these in your project settings:

| Variable | Value |
|----------|-------|
| `FRED_API_KEY` | Your FRED API key |
| `HUD_API_KEY` | Your HUD API key |

The app includes fallback keys for development, but you should use your own for production.

## Project Structure

```
federal-dashboards/
├── pages/
│   ├── index.js        # Homepage with navigation
│   ├── fred.js         # FRED Economic Dashboard
│   ├── housing.js      # Housing Affordability Calculator
│   └── _app.js         # App wrapper
├── styles/
│   └── globals.css     # Tailwind + custom styles
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

### FRED Economic Dashboard
- **Summary Cards**: GDP, Unemployment, CPI, Fed Funds
- **GDP Growth Chart**: Quarterly real GDP
- **Unemployment Tracker**: Monthly rate with trendline
- **Inflation Comparison**: CPI vs PCE with 2% target
- **Yield Curve**: Current term structure
- **2Y-10Y Spread**: Inversion indicator
- **Fed Funds Rate**: FOMC decision history
- **Housing Market**: Starts + mortgage rates
- **Labor Market**: JOLTS, quits, participation
- **Recession Indicators**: Sahm Rule, LEI, yield inversion

### Housing Affordability Calculator
- **Metro Selection**: 20 major US metros
- **Affordability Gauges**: Rent-to-income ratios
- **Budget Breakdown**: Pie chart of monthly expenses
- **Income Required**: What salary you need for 25%/30% ratio
- **FMR by Bedroom**: Compare Studio through 4BR
- **Rent vs Buy**: Full PITI calculation with PMI

## Data Sources

| Source | Data | Auth |
|--------|------|------|
| FRED API | Economic indicators | Free key |
| HUD API | Fair Market Rents | Free key |
| Census ACS | Median income | Free key |

### Getting API Keys

**FRED**: https://fred.stlouisfed.org/docs/api/api_key.html (instant, free)

**HUD**: https://www.huduser.gov/portal/dataset/fmr-api.html (instant, free)

## Enabling Live Data

The dashboards use curated demo data by default. To enable live API calls:

1. Get API keys (see above)
2. Create `.env.local`:
```
FRED_API_KEY=your_key_here
HUD_API_KEY=your_key_here
```
3. Create API routes in `pages/api/` to proxy requests
4. Update frontend to fetch from your API routes

## Federal Relevance

These dashboards demonstrate skills for:

- **Treasury**: Economic monitoring, T-bill demand analysis
- **Federal Reserve**: Inflation tracking, yield curve analysis
- **HUD/CFPB**: Housing affordability, cost burden metrics
- **OMB**: Budget and economic forecasting
- **GAO**: Data visualization for audits

## Deploy to Vercel

### Option 1: CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub
1. Push to GitHub
2. Import at vercel.com/new
3. Auto-deploys on every push

### Option 3: One-Click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/federal-dashboards)

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel

---

Built as a portfolio project for federal fintech roles • December 2025
