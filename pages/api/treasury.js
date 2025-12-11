// pages/api/treasury.js
// Fetches Treasury debt data from FiscalData API (free, no key required)

const FISCAL_BASE = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service';

async function fetchFiscalData(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${FISCAL_BASE}${endpoint}?${queryString}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FiscalData API error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return [];
  }
}

function formatCurrency(value, decimals = 2) {
  const num = parseFloat(value);
  if (num >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  return num.toFixed(decimals);
}

export default async function handler(req, res) {
  try {
    // Fetch all data in parallel
    const [
      debtToPenny,
      debtOutstanding,
      avgInterestRates,
      upcomingAuctions,
    ] = await Promise.all([
      // Total debt (debt to the penny) - last 30 records for history
      fetchFiscalData('/v2/accounting/od/debt_to_penny', {
        sort: '-record_date',
        limit: 30,
        fields: 'record_date,tot_pub_debt_out_amt,debt_held_public_amt,intragov_hold_amt'
      }),
      // Debt by type (marketable vs non-marketable breakdown)
      fetchFiscalData('/v2/accounting/od/debt_outstanding', {
        sort: '-record_date',
        limit: 12,
        fields: 'record_date,security_type_desc,debt_outstanding_amt'
      }),
      // Average interest rates by security type
      fetchFiscalData('/v2/accounting/od/avg_interest_rates', {
        sort: '-record_date',
        limit: 50,
        fields: 'record_date,security_desc,avg_interest_rate_amt'
      }),
      // Treasury auctions (sorted by most recent)
      fetchFiscalData('/v1/accounting/od/upcoming_auctions', {
        sort: '-auction_date',
        limit: 10,
        fields: 'auction_date,security_type,security_term,offering_amt'
      }),
    ]);

    // Process total debt
    const latestDebt = debtToPenny[0];
    const priorDebt = debtToPenny[1];
    const totalDebt = latestDebt ? parseFloat(latestDebt.tot_pub_debt_out_amt) : null;
    const debtChange = totalDebt && priorDebt
      ? totalDebt - parseFloat(priorDebt.tot_pub_debt_out_amt)
      : null;

    // Debt history for chart (last 30 days, reversed for chronological order)
    const debtHistory = debtToPenny
      .filter(d => d.tot_pub_debt_out_amt)
      .map(d => ({
        date: d.record_date,
        value: parseFloat(d.tot_pub_debt_out_amt) / 1e12 // In trillions
      }))
      .reverse();

    // Process debt composition (Public vs Intragovernmental)
    const debtByType = [];
    if (latestDebt?.debt_held_public_amt && latestDebt?.intragov_hold_amt) {
      const publicDebt = parseFloat(latestDebt.debt_held_public_amt);
      const intragovDebt = parseFloat(latestDebt.intragov_hold_amt);
      debtByType.push(
        { type: 'Debt Held by Public', amount: publicDebt, formatted: formatCurrency(publicDebt, 2) },
        { type: 'Intragovernmental', amount: intragovDebt, formatted: formatCurrency(intragovDebt, 2) }
      );
    }

    // Process average interest rates
    const latestRateDate = avgInterestRates[0]?.record_date;
    const interestRates = avgInterestRates
      .filter(d => d.record_date === latestRateDate && d.avg_interest_rate_amt)
      .map(d => ({
        type: d.security_desc,
        rate: parseFloat(d.avg_interest_rate_amt)
      }))
      .filter(d => d.rate > 0)
      .sort((a, b) => b.rate - a.rate);

    // Calculate weighted average interest rate
    const totalRate = interestRates.reduce((sum, r) => sum + r.rate, 0);
    const avgRate = interestRates.length > 0 ? totalRate / interestRates.length : null;

    // Process auctions (show recent auctions since API data may be stale)
    const auctions = upcomingAuctions
      .filter(a => a.auction_date)
      .map(a => {
        const amt = a.offering_amt && a.offering_amt !== 'null' ? parseFloat(a.offering_amt) : null;
        return {
          date: a.auction_date,
          type: a.security_type,
          term: a.security_term,
          amount: amt ? formatCurrency(amt, 1) : 'TBD',
          rawAmount: amt || 0
        };
      });

    // Estimate annual interest expense (rough: total debt * avg rate)
    const annualInterest = totalDebt && avgRate
      ? (totalDebt * (avgRate / 100))
      : null;

    // Get GDP for debt-to-GDP ratio (use FRED data)
    let debtToGDP = null;
    try {
      const gdpRes = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${process.env.FRED_API_KEY || 'd9ae3ee03b6f5e1e259a6d04f7ff1eb8'}&file_type=json&sort_order=desc&limit=1`
      );
      const gdpData = await gdpRes.json();
      if (gdpData.observations?.[0]) {
        const gdp = parseFloat(gdpData.observations[0].value) * 1e9; // GDP is in billions
        debtToGDP = totalDebt ? (totalDebt / gdp) * 100 : null;
      }
    } catch (err) {
      console.error('Error fetching GDP:', err);
    }

    // Set cache headers (cache for 5 minutes, stale-while-revalidate for 10 min)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    // Build response
    const responseData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDebt: {
          value: totalDebt,
          formatted: totalDebt ? formatCurrency(totalDebt, 2) : null,
          change: debtChange,
          changeFormatted: debtChange ? formatCurrency(Math.abs(debtChange), 1) : null,
          date: latestDebt?.record_date
        },
        debtToGDP: {
          value: debtToGDP,
          formatted: debtToGDP ? debtToGDP.toFixed(1) + '%' : null
        },
        annualInterest: {
          value: annualInterest,
          formatted: annualInterest ? formatCurrency(annualInterest, 2) : null
        },
        avgInterestRate: {
          value: avgRate,
          formatted: avgRate ? avgRate.toFixed(2) + '%' : null
        }
      },
      debtHistory,
      debtByType,
      interestRates: interestRates.slice(0, 10), // Top 10 security types
      upcomingAuctions: auctions,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Treasury API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch Treasury data', details: error.message });
  }
}
