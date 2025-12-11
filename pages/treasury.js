import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

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

// US Population (2024 estimate)
const US_POPULATION = 335_000_000;
const AVG_HOUSEHOLD_SIZE = 2.5;

// Historical debt data for birth year calculator
const HISTORICAL_DEBT = {
  1950: 257e9, 1955: 274e9, 1960: 290e9, 1965: 322e9, 1970: 380e9,
  1975: 541e9, 1980: 908e9, 1985: 1.82e12, 1990: 3.23e12, 1995: 4.97e12,
  2000: 5.67e12, 2005: 7.93e12, 2010: 13.56e12, 2015: 18.15e12,
  2020: 27.75e12, 2021: 29.62e12, 2022: 31.42e12, 2023: 34.00e12,
  2024: 36.00e12, 2025: 36.40e12
};

// Federal budget data for tax dollar breakdown (FY2024 estimates in billions)
const BUDGET_DATA = {
  socialSecurity: 1460,
  medicare: 870,
  medicaid: 616,
  interest: 1100,
  defense: 874,
  other: 1580
};

const BUDGET_TOTAL = Object.values(BUDGET_DATA).reduce((a, b) => a + b, 0);

const SummaryCard = ({ title, value, subtitle, change, color = 'blue', icon }) => {
  const bgColors = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    yellow: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
  }

  return (
    <div className={`bg-gradient-to-br ${bgColors[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value || '—'}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {change && (
            <p className={`text-sm mt-2 ${parseFloat(change) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {parseFloat(change) >= 0 ? '↑' : '↓'} {change} from prior day
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

const ChartCard = ({ title, children, description }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
    </div>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-medium">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Live Interest Ticker Component
const InterestTicker = ({ annualInterest }) => {
  const [interestPaid, setInterestPaid] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const interestPerSecond = annualInterest ? annualInterest / (365 * 24 * 60 * 60) : 35000;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed(s => s + 1);
      setInterestPaid(p => p + interestPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [interestPerSecond]);

  const formatMoney = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-500/30 rounded-xl p-6">
      <div className="flex justify-end mb-2">
        <DataTag isLive={true} />
      </div>
      <div className="text-center">
        <p className="text-red-400 text-sm font-medium mb-2">Interest Paid Since You Opened This Page</p>
        <p className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">
          {formatMoney(interestPaid)}
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div>
            <p className="text-slate-500">Per Second</p>
            <p className="text-red-400 font-semibold">{formatMoney(interestPerSecond)}</p>
          </div>
          <div>
            <p className="text-slate-500">Time on Page</p>
            <p className="text-slate-300 font-semibold">{secondsElapsed}s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Your Share Component
const YourShareCard = ({ totalDebt }) => {
  const debtValue = totalDebt || 36.4e12;
  const perCapita = debtValue / US_POPULATION;
  const perHousehold = perCapita * AVG_HOUSEHOLD_SIZE;
  const familyOf4 = perCapita * 4;

  const formatMoney = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-orange-950/20 border border-amber-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-amber-400 text-sm font-medium">Your Share of the National Debt</h3>
        <DataTag isLive={true} />
      </div>
      <p className="text-5xl font-bold text-white mb-2">{formatMoney(perCapita)}</p>
      <p className="text-slate-400 text-sm mb-4">per U.S. citizen</p>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-slate-500 text-xs">Family of 4</p>
          <p className="text-amber-400 font-bold text-lg">{formatMoney(familyOf4)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Per Household</p>
          <p className="text-amber-400 font-bold text-lg">{formatMoney(perHousehold)}</p>
        </div>
      </div>
    </div>
  );
};

// Birth Year Calculator Component
const BirthYearCalculator = ({ currentDebt }) => {
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const year = parseInt(birthYear);
    if (year < 1950 || year > 2025) {
      setResult(null);
      return;
    }

    // Find closest historical year
    const years = Object.keys(HISTORICAL_DEBT).map(Number).sort((a, b) => a - b);
    let birthDebt = HISTORICAL_DEBT[year];
    if (!birthDebt) {
      // Interpolate
      const lower = years.filter(y => y <= year).pop() || years[0];
      const upper = years.filter(y => y >= year)[0] || years[years.length - 1];
      if (lower === upper) {
        birthDebt = HISTORICAL_DEBT[lower];
      } else {
        const ratio = (year - lower) / (upper - lower);
        birthDebt = HISTORICAL_DEBT[lower] + ratio * (HISTORICAL_DEBT[upper] - HISTORICAL_DEBT[lower]);
      }
    }

    const debtNow = currentDebt || 36.4e12;
    const percentIncrease = ((debtNow - birthDebt) / birthDebt) * 100;
    const birthPerCapita = birthDebt / 200_000_000; // Rough historical population
    const nowPerCapita = debtNow / US_POPULATION;

    setResult({
      birthDebt,
      debtNow,
      percentIncrease,
      birthPerCapita,
      nowPerCapita,
      birthYear: year
    });
  };

  const formatTrillions = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(0)}B`;
    return `$${(num / 1e6).toFixed(0)}M`;
  };

  const formatMoney = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-950/20 border border-indigo-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-indigo-400 text-sm font-medium">Debt in Your Lifetime</h3>
        <DataTag label="Historical" lastUpdate="Dec 2025" />
      </div>
      <div className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Enter birth year"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          min="1950"
          max="2025"
        />
        <button
          onClick={calculate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">When you were born ({result.birthYear})</span>
            <span className="text-white font-semibold">{formatTrillions(result.birthDebt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Today</span>
            <span className="text-white font-semibold">{formatTrillions(result.debtNow)}</span>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 mt-3">
            <p className="text-red-400 text-2xl font-bold">+{result.percentIncrease.toFixed(0)}%</p>
            <p className="text-slate-400 text-sm">increase in your lifetime</p>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Your share grew from {formatMoney(result.birthPerCapita)} to {formatMoney(result.nowPerCapita)}
          </div>
        </div>
      )}
    </div>
  );
};

// Interest vs Defense Callout
const InterestVsDefenseCallout = () => {
  return (
    <div className="bg-gradient-to-r from-red-900/40 via-red-900/20 to-slate-900/40 border border-red-500/40 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">HISTORIC</span>
              <span className="text-slate-500 text-xs">FY 2024</span>
            </div>
            <DataTag label="Annual" lastUpdate="FY 2024" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Interest Payments Now Exceed Defense Spending
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            For the first time in American history, the federal government spent more on interest ($1.1T) than on national defense ($874B).
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-red-400 text-2xl font-bold">$1.1T</p>
              <p className="text-slate-500 text-xs">Interest</p>
            </div>
            <div className="text-slate-600 text-2xl">&gt;</div>
            <div>
              <p className="text-slate-300 text-2xl font-bold">$874B</p>
              <p className="text-slate-500 text-xs">Defense</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tax Dollar Breakdown Component
const TaxDollarBreakdown = () => {
  const items = [
    { name: 'Social Security', amount: BUDGET_DATA.socialSecurity, color: '#3b82f6' },
    { name: 'Medicare', amount: BUDGET_DATA.medicare, color: '#10b981' },
    { name: 'Interest', amount: BUDGET_DATA.interest, color: '#ef4444', highlight: true },
    { name: 'Defense', amount: BUDGET_DATA.defense, color: '#8b5cf6' },
    { name: 'Medicaid', amount: BUDGET_DATA.medicaid, color: '#f59e0b' },
    { name: 'Other', amount: BUDGET_DATA.other, color: '#64748b' },
  ].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Where Your Tax Dollar Goes</h3>
        <DataTag label="Annual" lastUpdate="FY 2024" />
      </div>
      <p className="text-slate-500 text-sm mb-4">FY 2024 Federal Spending Breakdown</p>
      <div className="space-y-3">
        {items.map((item) => {
          const percent = (item.amount / BUDGET_TOTAL) * 100;
          const cents = Math.round(percent);
          return (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className={item.highlight ? 'text-red-400 font-medium' : 'text-slate-300'}>
                  {item.name} {item.highlight && <span className="text-xs">(Growing fastest)</span>}
                </span>
                <span className="text-slate-400">{cents}¢</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// What Interest Could Buy Component - Opportunity cost visualization
const WhatInterestCouldBuy = ({ annualInterest }) => {
  const interest = annualInterest || 1.1e12; // $1.1 trillion default

  // What $1.1 trillion could fund (approximate costs)
  const alternatives = [
    {
      icon: '👩‍🏫',
      label: 'Public School Teachers',
      count: Math.floor(interest / 65000), // $65K avg salary
      unit: 'teachers',
      description: 'at $65K average salary'
    },
    {
      icon: '🎓',
      label: 'Free Public College',
      count: Math.floor(interest / 10000), // ~$10K avg tuition
      unit: 'students',
      description: 'full tuition for a year'
    },
    {
      icon: '🏥',
      label: 'Medicare for All (partial)',
      count: Math.floor((interest / 4e12) * 100), // ~$4T total cost
      unit: '% of cost',
      description: 'of estimated annual cost'
    },
    {
      icon: '🏠',
      label: 'Affordable Housing Units',
      count: Math.floor(interest / 250000), // $250K per unit
      unit: 'homes',
      description: 'at $250K per unit'
    },
    {
      icon: '🛣️',
      label: 'Infrastructure Projects',
      count: Math.floor(interest / 1.2e12 * 100), // Infrastructure bill was $1.2T
      unit: '% of 2021 bill',
      description: 'of the Infrastructure Investment Act'
    },
    {
      icon: '💵',
      label: 'Direct Payment to Every American',
      count: Math.floor(interest / US_POPULATION),
      unit: 'per person',
      description: 'one-time payment',
      isCurrency: true
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <h3 className="text-lg font-semibold text-white">What $1.1T Interest Could Buy</h3>
        </div>
        <DataTag label="Annual" lastUpdate="FY 2024" />
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Every year, we pay $1.1 trillion in interest — money that buys nothing. Here's what it could fund instead:
      </p>

      <div className="grid grid-cols-2 gap-3">
        {alternatives.map((alt) => (
          <div key={alt.label} className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{alt.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{alt.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-amber-400 text-xl font-bold">
                {alt.isCurrency ? '$' : ''}{formatNumber(alt.count)}
              </span>
              <span className="text-slate-500 text-xs">{alt.unit}</span>
            </div>
            <p className="text-slate-600 text-xs mt-1">{alt.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-sm">
          <strong>The catch:</strong> We can't redirect this money — it's already owed to bondholders.
          This is the opportunity cost of past borrowing.
        </p>
      </div>
    </div>
  );
};

// Error Banner Component
const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-red-400 font-medium">Unable to load live data</p>
          <p className="text-slate-500 text-sm">{message || 'Showing cached data. Some information may be outdated.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Data Disclaimer Component
const DataDisclaimer = () => (
  <div className="mt-8 pt-6 border-t border-slate-700/50">
    <p className="text-slate-600 text-xs text-center">
      <strong className="text-slate-500">Disclaimer:</strong> Data is provided for informational purposes only and should not be considered financial advice.
      While we strive for accuracy, data may be delayed or contain errors. Always verify with official sources before making financial decisions.
    </p>
  </div>
);

// Demo data for fallback
const DEMO_DATA = {
  summary: {
    totalDebt: { formatted: '$36.2T', change: '+$12B', date: '2025-12-09' },
    debtToGDP: { formatted: '123.5%' },
    annualInterest: { formatted: '$1.1T' },
    avgInterestRate: { formatted: '3.2%' }
  },
  debtHistory: [
    { date: '2025-11-10', value: 35.8 },
    { date: '2025-11-15', value: 35.9 },
    { date: '2025-11-20', value: 36.0 },
    { date: '2025-11-25', value: 36.0 },
    { date: '2025-12-01', value: 36.1 },
    { date: '2025-12-05', value: 36.1 },
    { date: '2025-12-09', value: 36.2 },
  ],
  debtByType: [
    { type: 'Debt Held by Public', amount: 28.5e12, formatted: '28.5T' },
    { type: 'Intragovernmental', amount: 7.7e12, formatted: '7.7T' },
  ],
  interestRates: [
    { type: 'Treasury Bills', rate: 5.2 },
    { type: 'Treasury Notes', rate: 4.1 },
    { type: 'Treasury Bonds', rate: 4.5 },
    { type: 'TIPS', rate: 2.1 },
    { type: 'Floating Rate Notes', rate: 5.3 },
  ],
  upcomingAuctions: [
    { date: '2025-12-11', type: '4-Week Bill', term: '4-Week', amount: '$80B' },
    { date: '2025-12-11', type: '8-Week Bill', term: '8-Week', amount: '$70B' },
    { date: '2025-12-12', type: '10-Year Note', term: '10-Year', amount: '$39B' },
    { date: '2025-12-16', type: '20-Year Bond', term: '20-Year', amount: '$16B' },
  ]
}

export default function TreasuryDashboard() {
  const [data, setData] = useState(DEMO_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/treasury')
      if (!res.ok) throw new Error('Failed to fetch Treasury data')
      const liveData = await res.json()

      if (liveData.summary) {
        setData(liveData)
        setLastUpdated(new Date(liveData.timestamp))
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching Treasury data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Head>
        <title>Treasury Debt Dashboard</title>
        <meta name="description" content="U.S. Treasury debt monitoring - total debt, interest expense, and upcoming auctions" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-2 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="text-3xl font-bold text-white">Treasury Debt Monitor</h1>
              <p className="text-slate-400 mt-1">U.S. Department of the Treasury • FiscalData API</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-red-500/50">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-slate-400 text-sm">Using demo data</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-emerald-500/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live Data</span>
                </div>
              )}
              <span className="text-slate-500 text-sm">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onRetry={fetchData} />}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              title="Total Public Debt"
              value={data.summary.totalDebt.formatted}
              subtitle={data.summary.totalDebt.date ? `As of ${formatDate(data.summary.totalDebt.date)}` : null}
              change={data.summary.totalDebt.changeFormatted}
              color="red"
              icon={
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <SummaryCard
              title="Debt to GDP"
              value={data.summary.debtToGDP.formatted}
              subtitle="Total debt ÷ GDP"
              color="yellow"
              icon={
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <SummaryCard
              title="Est. Annual Interest"
              value={data.summary.annualInterest.formatted}
              subtitle="Debt × avg rate"
              color="purple"
              icon={
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <SummaryCard
              title="Avg Interest Rate"
              value={data.summary.avgInterestRate.formatted}
              subtitle="Across all securities"
              color="blue"
              icon={
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
            />
          </div>

          {/* Hero Section: Your Share - Personal Hook */}
          <div className="mb-6">
            <YourShareCard totalDebt={data.summary.totalDebt?.value} />
          </div>

          {/* Urgency: Live Interest Ticker */}
          <div className="mb-6">
            <InterestTicker annualInterest={data.summary.annualInterest?.value} />
          </div>

          {/* Context: Interest Alert + Opportunity Cost (side by side) */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <InterestVsDefenseCallout />
            <WhatInterestCouldBuy annualInterest={data.summary.annualInterest?.value} />
          </div>

          {/* Personal History + Budget Context */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <BirthYearCalculator currentDebt={data.summary.totalDebt?.value} />
            <TaxDollarBreakdown />
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Debt Over Time */}
            <ChartCard title="Total Debt Over Time" description="Daily debt to the penny ($ Trillions)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.debtHistory}>
                    <defs>
                      <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}T`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#debtGradient)"
                      name="Total Debt ($T)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Debt Composition */}
            <ChartCard title="Debt Holders" description="Public vs Intragovernmental holdings">
              <div className="h-64 flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.debtByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="type"
                      >
                        {data.debtByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `$${(value / 1e12).toFixed(1)}T`}
                        contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4">
                  {data.debtByType.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: i === 0 ? '#ef4444' : '#3b82f6' }}></div>
                      <div>
                        <p className="text-white text-sm font-medium">${item.formatted}</p>
                        <p className="text-slate-400 text-xs">{item.type}</p>
                      </div>
                    </div>
                  ))}
                  {data.debtByType.length === 0 && (
                    <p className="text-slate-500 text-sm">No data available</p>
                  )}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Interest Rates by Security */}
            <ChartCard title="Average Interest Rates" description="By security type (%)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.interestRates.slice(0, 6)} layout="vertical">
                    <XAxis
                      type="number"
                      domain={[0, 'auto']}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Recent Auctions */}
            <ChartCard title="Recent Treasury Auctions" description="Latest debt issuances">
              <div className="h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Security</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingAuctions.length > 0 ? (
                      data.upcomingAuctions.map((auction, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          <td className="py-2 text-slate-300">{formatDate(auction.date)}</td>
                          <td className="py-2 text-white">{auction.term || auction.type}</td>
                          <td className="py-2 text-right text-emerald-400 font-medium">{auction.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-500">
                          No auction data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          {/* Context Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Why This Matters</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Debt Sustainability</h3>
                <p className="text-slate-500">
                  Debt-to-GDP above 100% means the government owes more than the economy produces in a year.
                  Japan operates at 260%, while the EU targets 60%.
                </p>
              </div>
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Interest Burden</h3>
                <p className="text-slate-500">
                  Interest payments now exceed $1 trillion annually — more than defense spending.
                  Rising rates increase this burden significantly.
                </p>
              </div>
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Auction Watch</h3>
                <p className="text-slate-500">
                  Treasury auctions determine borrowing costs. Weak demand (low bid-to-cover)
                  can signal investor concerns about U.S. fiscal health.
                </p>
              </div>
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-2">Treasury FiscalData API</p>
                <code className="text-slate-500">api.fiscaldata.treasury.gov</code>
                <p className="text-slate-600 text-xs mt-1">Debt to the Penny, Debt Outstanding, Interest Rates, Auctions</p>
              </div>
              <div>
                <p className="text-slate-400 mb-2">FRED API</p>
                <code className="text-slate-500">GDP for Debt-to-GDP ratio</code>
                <p className="text-slate-600 text-xs mt-1">Federal Reserve Bank of St. Louis</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              {error ? 'Demo data shown due to API error. ' : 'Live data from Treasury FiscalData. '}
              No API key required for Treasury data.
            </p>
          </div>

          {/* Data Disclaimer */}
          <DataDisclaimer />
        </div>
      </main>
    </>
  )
}
