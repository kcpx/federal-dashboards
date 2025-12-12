// lib/fred.js
// Shared FRED data fetching logic

const FRED_API_KEY = process.env.FRED_API_KEY || 'd9ae3ee03b6f5e1e259a6d04f7ff1eb8';
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// Series IDs for all our indicators
const SERIES = {
  gdp: 'GDPC1',           // Real GDP (Quarterly, Billions)
  unemployment: 'UNRATE', // Unemployment Rate (Monthly)
  cpi: 'CPIAUCSL',        // CPI All Urban (Monthly, for YoY calc)
  pce: 'PCEPI',           // PCE Price Index (Monthly)
  fedFunds: 'FEDFUNDS',   // Federal Funds Rate (Monthly)
  dgs10: 'DGS10',         // 10-Year Treasury (Daily)
  dgs2: 'DGS2',           // 2-Year Treasury (Daily)
  dgs1mo: 'DGS1MO',       // 1-Month Treasury
  dgs3mo: 'DGS3MO',       // 3-Month Treasury
  dgs6mo: 'DGS6MO',       // 6-Month Treasury
  dgs1: 'DGS1',           // 1-Year Treasury
  dgs3: 'DGS3',           // 3-Year Treasury
  dgs5: 'DGS5',           // 5-Year Treasury
  dgs7: 'DGS7',           // 7-Year Treasury
  dgs20: 'DGS20',         // 20-Year Treasury
  dgs30: 'DGS30',         // 30-Year Treasury
  mortgage30: 'MORTGAGE30US', // 30-Year Mortgage (Weekly)
  housingStarts: 'HOUST',     // Housing Starts (Monthly, Thousands)
  jolts: 'JTSJOL',            // Job Openings (Monthly, Thousands)
  quits: 'JTSQUR',            // Quits Rate (Monthly)
  hires: 'JTSHIR',            // Hires (Monthly, Thousands)
  participation: 'CIVPART',   // Labor Force Participation (Monthly)
  consumerSentiment: 'UMCSENT', // U of Michigan Consumer Sentiment (Monthly)
};

async function fetchSeries(seriesId, limit = 24) {
  // Use realtime_end=9999-12-31 to always get the most current data vintage
  // This ensures we get the latest available data regardless of timezone
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

function getLatestValue(observations) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > 0 ? parseFloat(valid[0].value) : null;
}

function getPriorValue(observations, index = 1) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  return valid.length > index ? parseFloat(valid[index].value) : null;
}

function calculateYoY(observations) {
  const valid = observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
  if (valid.length < 13) return null;

  const current = parseFloat(valid[0].value);
  const yearAgo = parseFloat(valid[12].value);
  return ((current - yearAgo) / yearAgo) * 100;
}

function formatHistory(observations, valueKey = 'value') {
  return observations
    .filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)))
    .map(o => ({
      date: formatDate(o.date),
      [valueKey]: parseFloat(o.value)
    }))
    .reverse();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
}

function formatQuarter(dateStr) {
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export async function getFredData() {
  // Fetch all series in parallel
  const [
    gdpObs,
    unemploymentObs,
    cpiObs,
    pceObs,
    fedFundsObs,
    dgs10Obs,
    dgs2Obs,
    dgs1moObs,
    dgs3moObs,
    dgs6moObs,
    dgs1Obs,
    dgs3Obs,
    dgs5Obs,
    dgs7Obs,
    dgs20Obs,
    dgs30Obs,
    mortgage30Obs,
    housingStartsObs,
    joltsObs,
    quitsObs,
    hiresObs,
    participationObs,
    consumerSentimentObs,
  ] = await Promise.all([
    fetchSeries(SERIES.gdp, 12),
    fetchSeries(SERIES.unemployment, 24),
    fetchSeries(SERIES.cpi, 24),
    fetchSeries(SERIES.pce, 24),
    fetchSeries(SERIES.fedFunds, 24),
    fetchSeries(SERIES.dgs10, 30),
    fetchSeries(SERIES.dgs2, 30),
    fetchSeries(SERIES.dgs1mo, 5),
    fetchSeries(SERIES.dgs3mo, 5),
    fetchSeries(SERIES.dgs6mo, 5),
    fetchSeries(SERIES.dgs1, 5),
    fetchSeries(SERIES.dgs3, 5),
    fetchSeries(SERIES.dgs5, 5),
    fetchSeries(SERIES.dgs7, 5),
    fetchSeries(SERIES.dgs20, 5),
    fetchSeries(SERIES.dgs30, 5),
    fetchSeries(SERIES.mortgage30, 52),
    fetchSeries(SERIES.housingStarts, 24),
    fetchSeries(SERIES.jolts, 3),
    fetchSeries(SERIES.quits, 3),
    fetchSeries(SERIES.hires, 3),
    fetchSeries(SERIES.participation, 3),
    fetchSeries(SERIES.consumerSentiment, 24),
  ]);

  // Build summary data
  const gdpValue = getLatestValue(gdpObs);
  const gdpPrior = getPriorValue(gdpObs);
  const gdpChange = gdpValue && gdpPrior ? ((gdpValue - gdpPrior) / gdpPrior) * 100 * 4 : null;

  const unemploymentValue = getLatestValue(unemploymentObs);
  const unemploymentPrior = getPriorValue(unemploymentObs);

  const cpiYoY = calculateYoY(cpiObs);
  const cpiPriorYoY = cpiObs.length >= 14 ? (
    (parseFloat(cpiObs.filter(o => o.value !== '.')[1]?.value) - parseFloat(cpiObs.filter(o => o.value !== '.')[13]?.value)) /
    parseFloat(cpiObs.filter(o => o.value !== '.')[13]?.value) * 100
  ) : null;

  const fedFundsValue = getLatestValue(fedFundsObs);
  const fedFundsPrior = getPriorValue(fedFundsObs, 3);

  // Build yield curve from latest values
  const yieldCurve = [
    { maturity: '1M', yield: getLatestValue(dgs1moObs) },
    { maturity: '3M', yield: getLatestValue(dgs3moObs) },
    { maturity: '6M', yield: getLatestValue(dgs6moObs) },
    { maturity: '1Y', yield: getLatestValue(dgs1Obs) },
    { maturity: '2Y', yield: getLatestValue(dgs2Obs) },
    { maturity: '3Y', yield: getLatestValue(dgs3Obs) },
    { maturity: '5Y', yield: getLatestValue(dgs5Obs) },
    { maturity: '7Y', yield: getLatestValue(dgs7Obs) },
    { maturity: '10Y', yield: getLatestValue(dgs10Obs) },
    { maturity: '20Y', yield: getLatestValue(dgs20Obs) },
    { maturity: '30Y', yield: getLatestValue(dgs30Obs) },
  ].filter(d => d.yield !== null);

  // Calculate 2Y-10Y spread history
  const dgs10Valid = dgs10Obs.filter(o => o.value !== '.');
  const dgs2Valid = dgs2Obs.filter(o => o.value !== '.');
  const yieldSpreadHistory = [];

  for (let i = 0; i < Math.min(dgs10Valid.length, 12); i++) {
    const d10 = dgs10Valid[i];
    const d2 = dgs2Valid.find(d => d.date === d10.date);
    if (d2) {
      yieldSpreadHistory.push({
        date: formatDate(d10.date),
        spread: parseFloat(d10.value) - parseFloat(d2.value)
      });
    }
  }

  // Build GDP history (quarterly)
  const gdpHistory = gdpObs
    .filter(o => o.value !== '.')
    .map(o => ({
      date: formatQuarter(o.date),
      value: parseFloat(o.value) / 1000
    }))
    .reverse();

  // Build unemployment history
  const unemploymentHistory = formatHistory(unemploymentObs.slice(0, 12), 'value');

  // Build inflation history (CPI and PCE YoY)
  const inflationHistory = [];
  const cpiValid = cpiObs.filter(o => o.value !== '.');
  const pceValid = pceObs.filter(o => o.value !== '.');

  for (let i = 0; i < Math.min(12, cpiValid.length - 12); i++) {
    const cpiCurrent = parseFloat(cpiValid[i].value);
    const cpiYearAgo = parseFloat(cpiValid[i + 12]?.value);
    const pceCurrent = parseFloat(pceValid[i]?.value);
    const pceYearAgo = parseFloat(pceValid[i + 12]?.value);

    if (cpiYearAgo && pceYearAgo) {
      inflationHistory.push({
        date: formatDate(cpiValid[i].date),
        cpi: ((cpiCurrent - cpiYearAgo) / cpiYearAgo) * 100,
        pce: ((pceCurrent - pceYearAgo) / pceYearAgo) * 100
      });
    }
  }

  // Build housing data (starts + mortgage rates)
  const housingData = [];
  const startsValid = housingStartsObs.filter(o => o.value !== '.');
  const mortgageValid = mortgage30Obs.filter(o => o.value !== '.');

  for (let i = 0; i < Math.min(12, startsValid.length); i++) {
    const startDate = new Date(startsValid[i].date);
    const mortgage = mortgageValid.find(m => {
      const mDate = new Date(m.date);
      return Math.abs(mDate - startDate) < 45 * 24 * 60 * 60 * 1000;
    });

    housingData.push({
      date: formatDate(startsValid[i].date),
      starts: parseFloat(startsValid[i].value) / 1000,
      mortgage: mortgage ? parseFloat(mortgage.value) : null
    });
  }

  // Current 2Y-10Y spread
  const current10Y = getLatestValue(dgs10Obs);
  const current2Y = getLatestValue(dgs2Obs);
  const currentSpread = current10Y && current2Y ? current10Y - current2Y : null;

  // Sahm Rule approximation
  const recentUnemployment = unemploymentObs.filter(o => o.value !== '.').slice(0, 3).map(o => parseFloat(o.value));
  const last12Unemployment = unemploymentObs.filter(o => o.value !== '.').slice(0, 12).map(o => parseFloat(o.value));
  const avg3mo = recentUnemployment.reduce((a, b) => a + b, 0) / recentUnemployment.length;
  const min12mo = Math.min(...last12Unemployment);
  const sahmRule = avg3mo - min12mo;

  return {
    timestamp: new Date().toISOString(),
    summary: {
      gdp: {
        value: gdpValue ? (gdpValue / 1000).toFixed(2) : null,
        change: gdpChange ? gdpChange.toFixed(1) : null,
        unit: 'T',
        name: `Real GDP (${gdpObs[0]?.date ? formatQuarter(gdpObs[0].date) : 'Latest'})`
      },
      unemployment: {
        value: unemploymentValue,
        change: unemploymentValue && unemploymentPrior ? (unemploymentValue - unemploymentPrior).toFixed(1) : null,
        unit: '%',
        name: 'Unemployment Rate'
      },
      inflation: {
        value: cpiYoY ? cpiYoY.toFixed(1) : null,
        change: cpiYoY && cpiPriorYoY ? (cpiYoY - cpiPriorYoY).toFixed(1) : null,
        unit: '%',
        name: 'CPI (YoY)'
      },
      fedFunds: {
        value: fedFundsValue,
        change: fedFundsValue && fedFundsPrior ? (fedFundsValue - fedFundsPrior).toFixed(2) : null,
        unit: '%',
        name: 'Fed Funds Rate'
      },
    },
    gdpHistory,
    unemploymentHistory: unemploymentHistory.reverse(),
    inflationHistory: inflationHistory.reverse(),
    yieldCurve,
    yieldSpreadHistory: yieldSpreadHistory.reverse(),
    housingData: housingData.reverse().filter(d => d.mortgage !== null),
    laborMarket: {
      jolts: getLatestValue(joltsObs) ? (getLatestValue(joltsObs) / 1000).toFixed(2) : null,
      quits: getLatestValue(quitsObs),
      hires: getLatestValue(hiresObs) ? (getLatestValue(hiresObs) / 1000).toFixed(1) : null,
      participation: getLatestValue(participationObs),
    },
    recessionIndicators: {
      sahmRule: sahmRule ? sahmRule.toFixed(2) : null,
      yieldInversion: currentSpread !== null ? currentSpread < 0 : null,
      currentSpread: currentSpread ? currentSpread.toFixed(2) : null,
      unemploymentTrend: recentUnemployment[0] > recentUnemployment[2] ? 'rising' :
                        recentUnemployment[0] < recentUnemployment[2] ? 'falling' : 'stable'
    },
    mortgage30: getLatestValue(mortgageValid),
    // Raw CPI for Inflation Wallet
    cpiCurrent: getLatestValue(cpiObs),
    cpiJan2020: 257.971, // Fixed baseline: Jan 2020 CPI
    // Consumer Sentiment
    consumerSentiment: {
      current: getLatestValue(consumerSentimentObs),
      prior: getPriorValue(consumerSentimentObs),
      change: getLatestValue(consumerSentimentObs) && getPriorValue(consumerSentimentObs)
        ? (getLatestValue(consumerSentimentObs) - getPriorValue(consumerSentimentObs)).toFixed(1)
        : null,
      history: formatHistory(consumerSentimentObs.slice(0, 12), 'value').reverse(),
    },
  };
}
