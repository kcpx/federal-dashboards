// pages/api/summary.js
// Aggregates key data points for homepage "At a Glance" sections

const FRED_API_KEY = process.env.FRED_API_KEY || 'd9ae3ee03b6f5e1e259a6d04f7ff1eb8';
const EIA_API_KEY = process.env.EIA_API_KEY;
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// FRED Series
const SERIES = {
  gdp: 'GDPC1',              // Real GDP (Quarterly)
  unemployment: 'UNRATE',     // Unemployment Rate (Monthly)
  cpi: 'CPIAUCSL',           // CPI All Urban (Monthly)
  fedFunds: 'FEDFUNDS',      // Federal Funds Rate (Monthly)
  consumerSentiment: 'UMCSENT', // U of Michigan Consumer Sentiment
  foodCpi: 'CPIUFDNS',       // CPI Food Index (Monthly)
  mortgage30: 'MORTGAGE30US', // 30-Year Mortgage Rate (Weekly)
};

async function fetchFredSeries(seriesId, limit = 13) {
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

function getLatest(obs) {
  const valid = obs.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > 0 ? { value: parseFloat(valid[0].value), date: valid[0].date } : null;
}

function getPrior(obs, index = 1) {
  const valid = obs.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > index ? parseFloat(valid[index].value) : null;
}

function calcYoY(obs) {
  const valid = obs.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  if (valid.length < 13) return null;
  const current = parseFloat(valid[0].value);
  const yearAgo = parseFloat(valid[12].value);
  return ((current - yearAgo) / yearAgo) * 100;
}

function formatQuarter(dateStr) {
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

function formatMonth(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function fetchGasPrice() {
  if (!EIA_API_KEY) return null;

  try {
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]=EPMR&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=52`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('EIA API error');
    const data = await res.json();
    const prices = data.response?.data || [];

    if (prices.length === 0) return null;

    const current = parseFloat(prices[0].value);
    const yearAgo = prices[51] ? parseFloat(prices[51].value) : null;
    const yoyChange = yearAgo ? ((current - yearAgo) / yearAgo) * 100 : null;

    return {
      value: current,
      date: prices[0].period,
      yoyChange,
    };
  } catch (err) {
    console.error('Error fetching gas price:', err);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    // Fetch all FRED series in parallel
    const [
      gdpObs,
      unemploymentObs,
      cpiObs,
      fedFundsObs,
      sentimentObs,
      foodCpiObs,
      mortgageObs,
    ] = await Promise.all([
      fetchFredSeries(SERIES.gdp, 5),
      fetchFredSeries(SERIES.unemployment, 3),
      fetchFredSeries(SERIES.cpi, 13),
      fetchFredSeries(SERIES.fedFunds, 3),
      fetchFredSeries(SERIES.consumerSentiment, 3),
      fetchFredSeries(SERIES.foodCpi, 13),
      fetchFredSeries(SERIES.mortgage30, 5),
    ]);

    // Fetch gas price
    const gasData = await fetchGasPrice();

    // Process GDP
    const gdpLatest = getLatest(gdpObs);
    const gdpPrior = getPrior(gdpObs);
    const gdpGrowth = gdpLatest && gdpPrior
      ? ((gdpLatest.value - gdpPrior) / gdpPrior) * 100 * 4 // Annualized
      : null;

    // Process Unemployment
    const unemploymentLatest = getLatest(unemploymentObs);
    const unemploymentPrior = getPrior(unemploymentObs);

    // Process CPI (YoY inflation)
    const cpiYoY = calcYoY(cpiObs);
    const cpiLatest = getLatest(cpiObs);

    // Process Fed Funds
    const fedFundsLatest = getLatest(fedFundsObs);

    // Process Consumer Sentiment
    const sentimentLatest = getLatest(sentimentObs);
    const sentimentPrior = getPrior(sentimentObs);

    // Process Food CPI (YoY)
    const foodYoY = calcYoY(foodCpiObs);
    const foodLatest = getLatest(foodCpiObs);

    // Process Mortgage
    const mortgageLatest = getLatest(mortgageObs);
    const mortgagePrior = getPrior(mortgageObs);

    // Set cache headers (5 min cache, 10 min stale-while-revalidate)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    res.status(200).json({
      timestamp: new Date().toISOString(),
      economy: {
        gdp: {
          value: gdpLatest ? (gdpLatest.value / 1000).toFixed(2) : null,
          change: gdpGrowth ? gdpGrowth.toFixed(1) : null,
          unit: 'T',
          period: gdpLatest ? formatQuarter(gdpLatest.date) : null,
        },
        unemployment: {
          value: unemploymentLatest?.value || null,
          change: unemploymentLatest && unemploymentPrior
            ? (unemploymentLatest.value - unemploymentPrior).toFixed(1)
            : null,
          unit: '%',
          period: unemploymentLatest ? formatMonth(unemploymentLatest.date) : null,
        },
        inflation: {
          value: cpiYoY ? cpiYoY.toFixed(1) : null,
          unit: '%',
          label: 'YoY',
          period: cpiLatest ? formatMonth(cpiLatest.date) : null,
        },
        fedRate: {
          value: fedFundsLatest?.value || null,
          unit: '%',
          period: fedFundsLatest ? formatMonth(fedFundsLatest.date) : null,
        },
      },
      consumer: {
        sentiment: {
          value: sentimentLatest?.value ? sentimentLatest.value.toFixed(1) : null,
          change: sentimentLatest && sentimentPrior
            ? (sentimentLatest.value - sentimentPrior).toFixed(1)
            : null,
          period: sentimentLatest ? formatMonth(sentimentLatest.date) : null,
        },
        gas: gasData ? {
          value: gasData.value.toFixed(2),
          change: gasData.yoyChange ? gasData.yoyChange.toFixed(1) : null,
          unit: '/gal',
          period: gasData.date,
        } : null,
        food: {
          value: foodYoY ? foodYoY.toFixed(1) : null,
          unit: '%',
          label: 'YoY',
          period: foodLatest ? formatMonth(foodLatest.date) : null,
        },
        mortgage: {
          value: mortgageLatest?.value ? mortgageLatest.value.toFixed(2) : null,
          change: mortgageLatest && mortgagePrior
            ? (mortgageLatest.value - mortgagePrior).toFixed(2)
            : null,
          unit: '%',
          period: mortgageLatest ? formatMonth(mortgageLatest.date) : null,
        },
      },
    });
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ error: 'Failed to fetch summary data', details: error.message });
  }
}
