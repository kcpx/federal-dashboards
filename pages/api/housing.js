// pages/api/housing.js
// Fetches live mortgage rates from FRED and FMR data from HUD

const FRED_API_KEY = process.env.FRED_API_KEY || 'd9ae3ee03b6f5e1e259a6d04f7ff1eb8';
const HUD_API_KEY = process.env.HUD_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2IiwianRpIjoiYjllZDZiMmZlYmNhMWQzMzA5MDM1M2I3Y2VmMzBhYTlhMWM1NzFiNTQxMmY2NjAwMTc1N2Y3YjliMzdlYjQ3NGViMDYwODM2NWEyMDkxNzUiLCJpYXQiOjE3NjUzOTI4OTIuMzM5NjIsIm5iZiI6MTc2NTM5Mjg5Mi4zMzk2MjIsImV4cCI6MjA4MDkyNTY5Mi4zMzU0NTcsInN1YiI6IjExNDgyMyIsInNjb3BlcyI6W119.lpfb-cdUrRlx_HT3ukdE0gZUPLZjLZgbcLzFptUkkPYwSkK_5vvGFv8UpQExwzcqlB8HfgburjUrzBkBoHRiIQ';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const HUD_FMR_BASE = 'https://www.huduser.gov/hudapi/public/fmr/data';
const HUD_IL_BASE = 'https://www.huduser.gov/hudapi/public/il/data'; // Income limits

async function fetchFredSeries(seriesId, limit = 5) {
  // Use realtime_end=9999-12-31 to always get the most current data vintage
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}&realtime_start=1776-07-04&realtime_end=9999-12-31`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
    const data = await res.json();
    return data.observations || [];
  } catch (err) {
    console.error(`Error fetching ${seriesId}:`, err);
    return [];
  }
}

async function fetchHudFmr(entityId, entityType = 'zip') {
  // entityType can be 'zip', 'county' (FIPS), or 'cbsa' (metro code)
  const url = `${HUD_FMR_BASE}/${entityId}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${HUD_API_KEY}`,
      }
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error(`HUD API error ${res.status}:`, text);
      throw new Error(`HUD API error: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching HUD FMR for ${entityId}:`, err);
    return null;
  }
}

async function fetchHudIncomeLimit(entityId) {
  const url = `${HUD_IL_BASE}/${entityId}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${HUD_API_KEY}`,
      }
    });
    
    if (!res.ok) throw new Error(`HUD IL API error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching HUD Income Limits for ${entityId}:`, err);
    return null;
  }
}

function getLatestValue(observations) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > 0 ? parseFloat(valid[0].value) : null;
}

export default async function handler(req, res) {
  const { zip, stateCode } = req.query;
  
  try {
    // Always fetch mortgage rates
    const [mortgage30Obs, mortgage15Obs] = await Promise.all([
      fetchFredSeries('MORTGAGE30US', 5),
      fetchFredSeries('MORTGAGE15US', 5),
    ]);

    const mortgage30 = getLatestValue(mortgage30Obs);
    const mortgage15 = getLatestValue(mortgage15Obs);
    const mortgageDate = mortgage30Obs[0]?.date || null;

    // If ZIP code provided, fetch HUD data
    let fmrData = null;
    let incomeData = null;
    
    if (zip) {
      const [fmrResult, ilResult] = await Promise.all([
        fetchHudFmr(zip),
        fetchHudIncomeLimit(zip),
      ]);
      
      if (fmrResult && fmrResult.data) {
        const d = fmrResult.data;
        fmrData = {
          zip: zip,
          countyName: d.county_name || d.areaname,
          metroName: d.metro_name || d.areaname,
          year: d.year,
          // basicdata contains the FMRs by bedroom
          fmr: [
            d.basicdata?.Efficiency || d.Efficiency,
            d.basicdata?.['One-Bedroom'] || d['One-Bedroom'],
            d.basicdata?.['Two-Bedroom'] || d['Two-Bedroom'],
            d.basicdata?.['Three-Bedroom'] || d['Three-Bedroom'],
            d.basicdata?.['Four-Bedroom'] || d['Four-Bedroom'],
          ],
          smallAreaFmr: d.smallarea_status === '1',
        };
      }
      
      if (ilResult && ilResult.data) {
        const d = ilResult.data;
        incomeData = {
          medianIncome: d.median_income || d.median,
          // Income limits by household size (1-8 persons)
          veryLow: d.very_low,
          extremelyLow: d.extremely_low,
          low: d.low,
        };
      }
    }

    // Set cache headers (cache for 5 minutes, stale-while-revalidate for 10 min)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    res.status(200).json({
      timestamp: new Date().toISOString(),
      mortgage30,
      mortgage15,
      mortgageDate,
      fmr: fmrData,
      incomeLimit: incomeData,
    });
  } catch (error) {
    console.error('Housing API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch housing data', details: error.message });
  }
}
