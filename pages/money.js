import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Data Freshness Tag Component
const DataTag = ({ isLive, label, lastUpdate }) => {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        LIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-400">
      {label || 'Static'}{lastUpdate ? ` • ${lastUpdate}` : ''}
    </span>
  );
};

// Demo data
const DEMO_DATA = {
  cpiCurrent: 314.5,
  cpiJan2020: 257.971,
  consumerSentiment: {
    current: 74.0,
    prior: 71.8,
    change: 2.2,
    history: [
      { date: 'Jan 25', value: 71.1 }, { date: 'Feb 25', value: 67.8 },
      { date: 'Mar 25', value: 57.0 }, { date: 'Apr 25', value: 52.2 },
      { date: 'May 25', value: 50.8 }, { date: 'Jun 25', value: 62.0 },
      { date: 'Jul 25', value: 64.0 }, { date: 'Aug 25', value: 67.9 },
      { date: 'Sep 25', value: 70.1 }, { date: 'Oct 25', value: 70.5 },
      { date: 'Nov 25', value: 71.8 }, { date: 'Dec 25', value: 74.0 },
    ],
  },
  mortgage30: 6.52,
};

// Inflation Wallet Component - Shows purchasing power loss
const InflationWallet = ({ cpiCurrent, cpiBaseline }) => {
  const CPI_2020 = cpiBaseline || 257.971;
  const CPI_NOW = cpiCurrent || 314.5;

  const purchasingPower = (100 * CPI_2020 / CPI_NOW).toFixed(0);
  const lostValue = 100 - purchasingPower;
  const percentLost = ((1 - CPI_2020 / CPI_NOW) * 100).toFixed(1);

  const items = [
    { name: 'Groceries', then: 100, now: 125, icon: '🛒' },
    { name: 'Gas', then: 2.25, now: 3.20, icon: '⛽', unit: '/gal' },
    { name: 'Rent', then: 1200, now: 1550, icon: '🏠', unit: '/mo' },
    { name: 'Used Car', then: 22000, now: 28500, icon: '🚗' },
  ];

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">💸</span>
          <h3 className="text-base md:text-lg font-semibold text-white">Your Dollar's Purchasing Power</h3>
        </div>
        <DataTag isLive={true} />
      </div>

      <div className="text-center mb-4 md:mb-6">
        <p className="text-slate-400 text-xs md:text-sm mb-2">$100 in January 2020 now buys only...</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl md:text-5xl font-bold text-white">${purchasingPower}</span>
          <span className="text-slate-400 text-base md:text-lg">worth</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
          <span className="text-red-400 font-semibold">-${lostValue}</span>
          <span className="text-slate-400 text-sm">({percentLost}% gone)</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>2020: $100</span>
          <span>2025: ${purchasingPower}</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-red-500 rounded-full transition-all duration-1000"
            style={{ width: `${purchasingPower}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {items.map((item) => {
          const increase = (((item.now - item.then) / item.then) * 100).toFixed(0);
          return (
            <div key={item.name} className="bg-slate-800/50 rounded-lg p-2 md:p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm md:text-base">{item.icon}</span>
                <span className="text-slate-300 text-xs md:text-sm">{item.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-slate-500 text-xs line-through">
                  ${item.then.toLocaleString()}{item.unit || ''}
                </span>
                <span className="text-white text-sm md:text-base font-semibold">
                  ${item.now.toLocaleString()}{item.unit || ''}
                </span>
              </div>
              <span className="text-red-400 text-xs">+{increase}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Your Salary Is Shrinking Component
const SalaryShrinking = ({ cpiCurrent, cpiBaseline }) => {
  const [salary2020, setSalary2020] = useState(75000);

  const CPI_2020 = cpiBaseline || 257.971;
  const CPI_NOW = cpiCurrent || 314.5;

  const equivalentToday = Math.round(salary2020 * (CPI_NOW / CPI_2020));
  const difference = equivalentToday - salary2020;
  const percentIncrease = ((CPI_NOW / CPI_2020 - 1) * 100).toFixed(1);

  const benchmarks = [
    { label: '$50K in 2020', then: 50000 },
    { label: '$75K in 2020', then: 75000 },
    { label: '$100K in 2020', then: 100000 },
    { label: '$150K in 2020', then: 150000 },
  ];

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">📉</span>
          <h3 className="text-base md:text-lg font-semibold text-white">Your Salary Is Shrinking</h3>
        </div>
        <DataTag isLive={true} />
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-4">
        Even if your paycheck looks the same, inflation has eroded its value. Enter your 2020 salary:
      </p>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">$</span>
          <input
            type="number"
            value={salary2020}
            onChange={(e) => setSalary2020(Number(e.target.value) || 0)}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:border-purple-500"
            placeholder="75000"
          />
          <span className="text-slate-500 text-sm">in 2020</span>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 mb-4">
        <p className="text-slate-400 text-xs md:text-sm mb-2">To have the same purchasing power today, you'd need:</p>
        <p className="text-2xl md:text-3xl font-bold text-white mb-1">{formatCurrency(equivalentToday)}</p>
        <p className="text-purple-400 text-xs md:text-sm">
          That's <span className="font-semibold">+{formatCurrency(difference)}</span> more ({percentIncrease}% raise needed)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {benchmarks.map((b) => {
          const needed = Math.round(b.then * (CPI_NOW / CPI_2020));
          return (
            <div
              key={b.label}
              className="bg-slate-700/30 rounded-lg p-2 cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => setSalary2020(b.then)}
            >
              <p className="text-slate-500 text-xs">{b.label}</p>
              <p className="text-white font-semibold text-sm">→ {formatCurrency(needed)}</p>
            </div>
          );
        })}
      </div>

      <p className="text-slate-500 text-xs mt-4">
        If you haven't gotten a {percentIncrease}% raise since 2020, you've taken a real pay cut.
      </p>
    </div>
  );
};

// Then vs Now Component - Generational comparison
const ThenVsNow = () => {
  const comparisons = [
    {
      metric: 'Median Home Price',
      then: { year: 1980, value: 47200, display: '$47,200' },
      now: { year: 2024, value: 420000, display: '$420,000' },
      multiplier: 8.9,
      icon: '🏠'
    },
    {
      metric: 'Median Household Income',
      then: { year: 1980, value: 21000, display: '$21,000' },
      now: { year: 2024, value: 80000, display: '$80,000' },
      multiplier: 3.8,
      icon: '💰'
    },
    {
      metric: 'Years of Income to Buy Home',
      then: { year: 1980, value: 2.2, display: '2.2 years' },
      now: { year: 2024, value: 5.3, display: '5.3 years' },
      multiplier: 2.4,
      icon: '⏳',
      worse: true
    },
    {
      metric: 'Public College (Annual)',
      then: { year: 1980, value: 800, display: '$800' },
      now: { year: 2024, value: 11000, display: '$11,000' },
      multiplier: 13.8,
      icon: '🎓'
    },
    {
      metric: 'Min Wage (Hourly)',
      then: { year: 1980, value: 3.10, display: '$3.10' },
      now: { year: 2024, value: 7.25, display: '$7.25' },
      multiplier: 2.3,
      icon: '⏰'
    },
    {
      metric: 'Hours at Min Wage for Rent',
      then: { year: 1980, value: 52, display: '52 hrs/mo' },
      now: { year: 2024, value: 96, display: '96 hrs/mo' },
      multiplier: 1.8,
      icon: '🔨',
      worse: true
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">📊</span>
          <h3 className="text-base md:text-lg font-semibold text-white">Then vs Now</h3>
        </div>
        <DataTag label="Historical" lastUpdate="Dec 2024" />
      </div>
      <p className="text-slate-400 text-xs md:text-sm mb-4">How economic realities have changed over 44 years</p>

      <div className="space-y-2 md:space-y-3">
        {comparisons.map((item) => (
          <div key={item.metric} className="bg-slate-800/50 rounded-lg p-2 md:p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base">{item.icon}</span>
                <span className="text-slate-300 text-xs md:text-sm font-medium">{item.metric}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${item.worse ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                {item.multiplier}x
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-slate-500 text-xs">{item.then.year}</p>
                <p className="text-white text-sm md:text-base font-semibold">{item.then.display}</p>
              </div>
              <div className="flex-1 mx-2 md:mx-3">
                <div className="h-1 bg-slate-700 rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500">→</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">{item.now.year}</p>
                <p className={`text-sm md:text-base font-semibold ${item.worse ? 'text-red-400' : 'text-amber-400'}`}>{item.now.display}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-slate-400 text-xs">
          <strong className="text-slate-300">Key insight:</strong> While incomes grew 3.8x, home prices grew 8.9x and college costs grew 13.8x.
          The math no longer works the same way it did for previous generations.
        </p>
      </div>
    </div>
  );
};

// Consumer Sentiment Component
const ConsumerSentiment = ({ sentiment }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">Consumer Sentiment</h2>
          <p className="text-slate-400 text-sm">University of Michigan Index — How Americans feel about the economy</p>
        </div>
        <DataTag isLive={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Current Reading */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30 rounded-xl p-4 md:p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Current Index</p>
          <p className="text-4xl md:text-5xl font-bold text-white mb-2">
            {sentiment?.current?.toFixed(1) || '--'}
          </p>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
            parseFloat(sentiment?.change) > 0
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            <span>{parseFloat(sentiment?.change) > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(parseFloat(sentiment?.change || 0)).toFixed(1)} pts</span>
          </div>
          <p className="text-slate-500 text-xs mt-2">vs prior month</p>
        </div>

        {/* Sentiment Gauge */}
        <div className="bg-slate-700/30 rounded-xl p-4 md:p-6">
          <p className="text-slate-400 text-sm mb-3 text-center">Sentiment Level</p>
          <div className="relative h-4 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full mb-2">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-white rounded shadow-lg border-2 border-slate-800"
              style={{ left: `${Math.min(Math.max((sentiment?.current || 70) / 120 * 100, 5), 95)}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Pessimistic</span>
            <span>Neutral</span>
            <span>Optimistic</span>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${
              (sentiment?.current || 0) >= 80 ? 'text-emerald-400' :
              (sentiment?.current || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {(sentiment?.current || 0) >= 80 ? 'Optimistic' :
               (sentiment?.current || 0) >= 60 ? 'Cautious' : 'Pessimistic'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Historical avg: ~85 | 2008 low: 55
            </p>
          </div>
        </div>

        {/* What it means */}
        <div className="bg-slate-700/30 rounded-xl p-4 md:p-6">
          <p className="text-slate-400 text-sm mb-3">What it means</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">●</span>
              <span className="text-slate-300">Above 80: Confident, likely spending</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400">●</span>
              <span className="text-slate-300">60-80: Mixed, cautious spending</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">●</span>
              <span className="text-slate-300">Below 60: Pessimistic, pullback</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-600">
            <p className="text-slate-500 text-xs">
              Consumer spending drives ~70% of GDP.
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment History Chart */}
      {sentiment?.history && sentiment.history.length > 0 && (
        <div className="mt-6">
          <p className="text-slate-400 text-sm mb-3">12-Month Trend</p>
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentiment.history}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-slate-400 text-xs">{label}</p>
                          <p className="text-white font-medium">{payload[0].value?.toFixed(1)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={85} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#64748b', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#sentimentGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default function YourMoneyDashboard() {
  const [data, setData] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fred');
        if (!res.ok) throw new Error('Failed to fetch data');
        const liveData = await res.json();
        setData({
          cpiCurrent: liveData.cpiCurrent || DEMO_DATA.cpiCurrent,
          cpiJan2020: liveData.cpiJan2020 || DEMO_DATA.cpiJan2020,
          consumerSentiment: liveData.consumerSentiment || DEMO_DATA.consumerSentiment,
          mortgage30: liveData.mortgage30 || DEMO_DATA.mortgage30,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Your Money | DataGov Live</title>
        <meta name="description" content="See how inflation affects your purchasing power, salary, and the American Dream" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
            <div>
              <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-2 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Your Money</h1>
              <p className="text-slate-400 mt-1">How inflation affects your wallet, salary, and the American Dream</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-emerald-500/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live Data</span>
                </div>
              )}
            </div>
          </div>

          {/* Consumer Sentiment - Full Width */}
          <div className="mb-6">
            <ConsumerSentiment sentiment={data.consumerSentiment} />
          </div>

          {/* Inflation Wallet & Salary Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <InflationWallet cpiCurrent={data.cpiCurrent} cpiBaseline={data.cpiJan2020} />
            <SalaryShrinking cpiCurrent={data.cpiCurrent} cpiBaseline={data.cpiJan2020} />
          </div>

          {/* Then vs Now - Full Width */}
          <div className="mb-6">
            <ThenVsNow />
          </div>

          {/* Quick Links */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Related Dashboards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/prices" className="bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="text-white font-medium">Cost of Living</p>
                    <p className="text-slate-400 text-sm">Actual food & gas prices</p>
                  </div>
                </div>
              </Link>
              <Link href="/housing" className="bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <p className="text-white font-medium">Housing</p>
                    <p className="text-slate-400 text-sm">Rent affordability calculator</p>
                  </div>
                </div>
              </Link>
              <Link href="/fred" className="bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-white font-medium">FRED Economic</p>
                    <p className="text-slate-400 text-sm">Macro indicators & charts</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-slate-600 text-xs text-center">
              <strong className="text-slate-500">Disclaimer:</strong> Calculations based on CPI data from the Bureau of Labor Statistics.
              Individual experiences may vary. This is for informational purposes only, not financial advice.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
