// pages/api/prices.js
// Fetches food prices from FRED (BLS Average Price series) and gas prices from EIA

const FRED_API_KEY = process.env.FRED_API_KEY || 'd9ae3ee03b6f5e1e259a6d04f7ff1eb8';
const EIA_API_KEY = process.env.EIA_API_KEY; // Optional - for gas prices
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// BLS Average Price Series (via FRED)
// These are actual dollar prices, not indexes
const FOOD_SERIES = {
  eggs: { id: 'APU0000708111', name: 'Eggs (Grade A, dozen)', icon: '🥚', unit: 'dozen' },
  milk: { id: 'APU0000709112', name: 'Milk (whole, gallon)', icon: '🥛', unit: 'gallon' },
  bread: { id: 'APU0000702111', name: 'Bread (white, lb)', icon: '🍞', unit: 'lb' },
  chicken: { id: 'APU0000706111', name: 'Chicken (whole, lb)', icon: '🍗', unit: 'lb' },
  ground_beef: { id: 'APU0000703112', name: 'Ground Beef (lb)', icon: '🥩', unit: 'lb' },
  bacon: { id: 'APU0000704111', name: 'Bacon (lb)', icon: '🥓', unit: 'lb' },
  orange_juice: { id: 'APU0000713111', name: 'Orange Juice (12oz frozen)', icon: '🍊', unit: '12oz' },
  coffee: { id: 'APU0000717311', name: 'Coffee (lb)', icon: '☕', unit: 'lb' },
  butter: { id: 'APU0000FS1101', name: 'Butter (lb)', icon: '🧈', unit: 'lb' },
  cheese: { id: 'APU0000710211', name: 'Cheese (American, lb)', icon: '🧀', unit: 'lb' },
};

async function fetchFredSeries(seriesId, limit = 24) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;

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

function getLatestValue(observations) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > 0 ? { value: parseFloat(valid[0].value), date: valid[0].date } : null;
}

function getYearAgoValue(observations) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  // Monthly data, so 12 months ago
  return valid.length >= 12 ? parseFloat(valid[11].value) : null;
}

function calculateYoYChange(current, yearAgo) {
  if (!current || !yearAgo) return null;
  return ((current - yearAgo) / yearAgo) * 100;
}

function formatHistory(observations) {
  return observations
    .filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)))
    .slice(0, 12) // Last 12 months
    .map(o => {
      const d = new Date(o.date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        date: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        value: parseFloat(o.value),
      };
    })
    .reverse();
}

// EIA Gas Prices (requires API key)
async function fetchGasPrices() {
  if (!EIA_API_KEY) {
    return null; // No key configured
  }

  try {
    // Weekly retail gas prices - national average
    // EPMR = Regular Gasoline, EPD2D = No 2 Diesel, NUS = U.S. National
    const regularUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]=EPMR&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=52`;
    const dieselUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]=EPD2D&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=52`;

    const [regularRes, dieselRes] = await Promise.all([
      fetch(regularUrl),
      fetch(dieselUrl),
    ]);

    if (!regularRes.ok || !dieselRes.ok) {
      throw new Error('EIA API error');
    }

    const regularData = await regularRes.json();
    const dieselData = await dieselRes.json();

    const regular = regularData.response?.data || [];
    const diesel = dieselData.response?.data || [];

    return {
      regular: {
        name: 'Regular Gas (gallon)',
        icon: '⛽',
        unit: 'gallon',
        current: regular[0]?.value ? parseFloat(regular[0].value) : null,
        date: regular[0]?.period || null,
        yearAgo: regular[51]?.value ? parseFloat(regular[51].value) : null,
        yoyChange: regular[0]?.value && regular[51]?.value
          ? ((parseFloat(regular[0].value) - parseFloat(regular[51].value)) / parseFloat(regular[51].value)) * 100
          : null,
        history: regular.slice(0, 12).map(d => ({
          date: d.period,
          value: parseFloat(d.value),
        })).reverse(),
      },
      diesel: {
        name: 'Diesel (gallon)',
        icon: '🛢️',
        unit: 'gallon',
        current: diesel[0]?.value ? parseFloat(diesel[0].value) : null,
        date: diesel[0]?.period || null,
        yearAgo: diesel[51]?.value ? parseFloat(diesel[51].value) : null,
        yoyChange: diesel[0]?.value && diesel[51]?.value
          ? ((parseFloat(diesel[0].value) - parseFloat(diesel[51].value)) / parseFloat(diesel[51].value)) * 100
          : null,
        history: diesel.slice(0, 12).map(d => ({
          date: d.period,
          value: parseFloat(d.value),
        })).reverse(),
      },
    };
  } catch (err) {
    console.error('Error fetching EIA gas prices:', err);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    // Fetch all food series in parallel
    const seriesKeys = Object.keys(FOOD_SERIES);
    const observations = await Promise.all(
      seriesKeys.map(key => fetchFredSeries(FOOD_SERIES[key].id, 24))
    );

    // Process food data
    const food = {};
    seriesKeys.forEach((key, i) => {
      const obs = observations[i];
      const latest = getLatestValue(obs);
      const yearAgo = getYearAgoValue(obs);
      const yoyChange = calculateYoYChange(latest?.value, yearAgo);

      food[key] = {
        ...FOOD_SERIES[key],
        current: latest?.value || null,
        date: latest?.date || null,
        yearAgo,
        yoyChange,
        history: formatHistory(obs),
      };
    });

    // Fetch gas prices (if EIA key available)
    const gas = await fetchGasPrices();

    // Calculate average food price change
    const foodChanges = Object.values(food)
      .map(f => f.yoyChange)
      .filter(c => c !== null);
    const avgFoodChange = foodChanges.length > 0
      ? foodChanges.reduce((a, b) => a + b, 0) / foodChanges.length
      : null;

    // Set cache headers (cache for 1 hour, stale-while-revalidate for 2 hours)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    res.status(200).json({
      timestamp: new Date().toISOString(),
      food,
      gas,
      summary: {
        avgFoodChange,
        gasAvailable: !!gas,
      },
    });
  } catch (error) {
    console.error('Prices API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch price data', details: error.message });
  }
}
