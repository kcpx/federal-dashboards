import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

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
      <strong className="text-slate-500">Disclaimer:</strong> Prices are U.S. city averages from the Bureau of Labor Statistics.
      Actual prices vary by location and store. Data is for informational purposes only.
    </p>
  </div>
);

// Demo data for when API fails
const DEMO_DATA = {
  food: {
    eggs: { name: 'Eggs (Grade A, dozen)', icon: '🥚', unit: 'dozen', current: 4.52, yearAgo: 3.63, yoyChange: 24.5, history: [] },
    milk: { name: 'Milk (whole, gallon)', icon: '🥛', unit: 'gallon', current: 4.15, yearAgo: 4.03, yoyChange: 2.9, history: [] },
    bread: { name: 'Bread (white, lb)', icon: '🍞', unit: 'lb', current: 1.95, yearAgo: 1.81, yoyChange: 7.7, history: [] },
    chicken: { name: 'Chicken (whole, lb)', icon: '🍗', unit: 'lb', current: 2.10, yearAgo: 2.00, yoyChange: 5.0, history: [] },
    ground_beef: { name: 'Ground Beef (lb)', icon: '🥩', unit: 'lb', current: 5.45, yearAgo: 4.98, yoyChange: 9.4, history: [] },
    bacon: { name: 'Bacon (lb)', icon: '🥓', unit: 'lb', current: 7.25, yearAgo: 6.80, yoyChange: 6.6, history: [] },
    orange_juice: { name: 'Orange Juice (12oz frozen)', icon: '🍊', unit: '12oz', current: 3.85, yearAgo: 3.15, yoyChange: 22.2, history: [] },
    coffee: { name: 'Coffee (lb)', icon: '☕', unit: 'lb', current: 6.95, yearAgo: 5.80, yoyChange: 19.8, history: [] },
    butter: { name: 'Butter (lb)', icon: '🧈', unit: 'lb', current: 5.10, yearAgo: 4.75, yoyChange: 7.4, history: [] },
    cheese: { name: 'Cheese (American, lb)', icon: '🧀', unit: 'lb', current: 4.85, yearAgo: 4.55, yoyChange: 6.6, history: [] },
  },
  gas: null,
  summary: { avgFoodChange: 11.2, gasAvailable: false },
};

// Price Card Component
const PriceCard = ({ item, isHighlight }) => {
  const changeColor = item.yoyChange > 0 ? 'text-red-400' : 'text-emerald-400';
  const changeBg = item.yoyChange > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10';
  const changeArrow = item.yoyChange > 0 ? '↑' : '↓';

  return (
    <div className={`bg-slate-800/50 border ${isHighlight ? 'border-amber-500/40' : 'border-slate-700'} rounded-xl p-4 hover:border-slate-600 transition-colors`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <p className="text-white font-medium text-sm">{item.name}</p>
            <p className="text-slate-500 text-xs">per {item.unit}</p>
          </div>
        </div>
        {isHighlight && (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Notable</span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            ${item.current?.toFixed(2) || '--'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            was ${item.yearAgo?.toFixed(2) || '--'} last year
          </p>
        </div>
        <div className={`${changeBg} px-2 py-1 rounded`}>
          <p className={`${changeColor} text-sm font-semibold`}>
            {changeArrow} {Math.abs(item.yoyChange || 0).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

// Grocery Receipt Component - Visual shopping list
const GroceryReceipt = ({ food }) => {
  const items = Object.values(food).filter(f => f.current);
  const total2024 = items.reduce((sum, f) => sum + (f.yearAgo || 0), 0);
  const total2025 = items.reduce((sum, f) => sum + (f.current || 0), 0);
  const difference = total2025 - total2024;
  const percentChange = total2024 > 0 ? ((difference / total2024) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 font-mono">
      <div className="text-center border-b border-dashed border-slate-600 pb-4 mb-4">
        <p className="text-slate-400 text-xs">U.S. CITY AVERAGE</p>
        <h3 className="text-white text-lg font-bold">GROCERY RECEIPT</h3>
        <p className="text-slate-500 text-xs">Sample basket comparison</p>
      </div>

      <div className="space-y-2 mb-4">
        {items.slice(0, 6).map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-slate-400">{item.icon} {item.name.split('(')[0].trim()}</span>
            <span className="text-white">${item.current?.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-600 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Last Year Total</span>
          <span className="text-slate-400 line-through">${total2024.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span className="text-white">TODAY'S TOTAL</span>
          <span className="text-white">${total2025.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">You're paying</span>
          <span className="text-red-400 font-semibold">
            +${difference.toFixed(2)} more ({percentChange.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-slate-600 text-center">
        <p className="text-slate-600 text-xs">* Prices are national averages</p>
        <p className="text-slate-600 text-xs">Your local prices may vary</p>
      </div>
    </div>
  );
};

// Year-over-Year Comparison Bar Chart
const YoYComparisonChart = ({ food }) => {
  const data = Object.values(food)
    .filter(f => f.yoyChange !== null)
    .map(f => ({
      name: f.icon,
      fullName: f.name,
      change: f.yoyChange,
    }))
    .sort((a, b) => b.change - a.change);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Price Changes (Year-over-Year)</h3>
          <p className="text-slate-500 text-sm">Which items are up the most?</p>
        </div>
        <DataTag isLive={true} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 16 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-white text-sm font-medium">{item.fullName}</p>
                      <p className={`text-sm ${item.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}% YoY
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="change" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.change > 15 ? '#ef4444' : entry.change > 5 ? '#f59e0b' : entry.change > 0 ? '#84cc16' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-slate-400">{'>'}15%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className="text-slate-400">5-15%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-lime-500"></div>
          <span className="text-slate-400">0-5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-slate-400">Cheaper</span>
        </div>
      </div>
    </div>
  );
};

// Price History Chart
const PriceHistoryChart = ({ item }) => {
  if (!item.history || item.history.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
        No history available
      </div>
    );
  }

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={item.history}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            width={45}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="text-white font-medium">${payload[0].value.toFixed(2)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gas Prices Section (placeholder until EIA key is configured)
const GasPricesSection = ({ gas }) => {
  if (!gas) {
    return (
      <div className="bg-slate-800/30 border border-dashed border-slate-600 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⛽</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Gas Prices</h3>
            <p className="text-slate-500 text-sm">Coming soon</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Gas price data requires an EIA API key. Register for free at{' '}
          <a
            href="https://www.eia.gov/opendata/register.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            eia.gov/opendata
          </a>
        </p>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-500 text-xs font-mono">
            # Add to .env.local:<br />
            EIA_API_KEY=your_key_here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <h3 className="text-lg font-semibold text-white">Gas Prices</h3>
        </div>
        <DataTag isLive={true} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⛽</span>
            <span className="text-slate-300 text-sm">{gas.regular.name}</span>
          </div>
          <p className="text-2xl font-bold text-white">${gas.regular.current?.toFixed(2)}</p>
          <p className={`text-sm ${gas.regular.yoyChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {gas.regular.yoyChange > 0 ? '↑' : '↓'} {Math.abs(gas.regular.yoyChange || 0).toFixed(1)}% YoY
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🛢️</span>
            <span className="text-slate-300 text-sm">{gas.diesel.name}</span>
          </div>
          <p className="text-2xl font-bold text-white">${gas.diesel.current?.toFixed(2)}</p>
          <p className={`text-sm ${gas.diesel.yoyChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {gas.diesel.yoyChange > 0 ? '↑' : '↓'} {Math.abs(gas.diesel.yoyChange || 0).toFixed(1)}% YoY
          </p>
        </div>
      </div>
    </div>
  );
};

// Featured Item Spotlight
const FeaturedItem = ({ item }) => {
  if (!item) return null;

  return (
    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{item.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Price Spotlight</h3>
            <p className="text-amber-400 text-sm">Biggest mover this month</p>
          </div>
        </div>
        <DataTag isLive={true} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">Current Price</p>
          <p className="text-3xl font-bold text-white">${item.current?.toFixed(2)}</p>
          <p className="text-slate-500 text-sm">per {item.unit}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Year-over-Year</p>
          <p className={`text-3xl font-bold ${item.yoyChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {item.yoyChange > 0 ? '+' : ''}{item.yoyChange?.toFixed(1)}%
          </p>
          <p className="text-slate-500 text-sm">vs last year</p>
        </div>
      </div>

      <PriceHistoryChart item={item} />

      <div className="mt-4 pt-4 border-t border-amber-500/20">
        <p className="text-slate-400 text-sm">
          {item.name} prices have {item.yoyChange > 0 ? 'increased' : 'decreased'} significantly
          {item.yoyChange > 20 && ' due to supply chain pressures and seasonal factors'}.
        </p>
      </div>
    </div>
  );
};

// Annual Cost Calculator
const AnnualCostCalculator = ({ food }) => {
  const [quantities, setQuantities] = useState({
    eggs: 2,      // dozens per month
    milk: 4,      // gallons per month
    bread: 4,     // loaves per month
    chicken: 4,   // lbs per month
    ground_beef: 3, // lbs per month
    bacon: 2,     // lbs per month
  });

  const items = ['eggs', 'milk', 'bread', 'chicken', 'ground_beef', 'bacon'];

  const monthlyCost = items.reduce((sum, key) => {
    return sum + (food[key]?.current || 0) * (quantities[key] || 0);
  }, 0);

  const monthlyLastYear = items.reduce((sum, key) => {
    return sum + (food[key]?.yearAgo || 0) * (quantities[key] || 0);
  }, 0);

  const annualCost = monthlyCost * 12;
  const annualLastYear = monthlyLastYear * 12;
  const annualDiff = annualCost - annualLastYear;

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <h3 className="text-lg font-semibold text-white">Your Annual Grocery Cost</h3>
        </div>
        <DataTag label="Calculator" />
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Adjust quantities to match your household's monthly consumption:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {items.map(key => {
          const item = food[key];
          if (!item) return null;
          return (
            <div key={key} className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>{item.icon}</span>
                <span className="text-slate-300 text-xs">{item.name.split('(')[0].trim()}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={quantities[key]}
                  onChange={(e) => setQuantities(prev => ({
                    ...prev,
                    [key]: parseInt(e.target.value) || 0
                  }))}
                  className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-center text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 text-xs">/ mo</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs mb-1">Monthly</p>
            <p className="text-xl font-bold text-white">${monthlyCost.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Annual</p>
            <p className="text-xl font-bold text-white">${annualCost.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">vs Last Year</p>
            <p className={`text-xl font-bold ${annualDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {annualDiff > 0 ? '+' : ''}${annualDiff.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-4 text-center">
        Based on current national average prices
      </p>
    </div>
  );
};

export default function CostOfLivingDashboard() {
  const [data, setData] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPriceData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('Failed to fetch price data');
      const liveData = await res.json();

      setData(liveData);
      setLastUpdated(new Date(liveData.timestamp));
      setError(null);

      // Set featured item to highest YoY change
      const items = Object.values(liveData.food).filter(f => f.yoyChange !== null);
      if (items.length > 0) {
        const featured = items.reduce((max, item) =>
          Math.abs(item.yoyChange) > Math.abs(max.yoyChange) ? item : max
        );
        setSelectedItem(featured);
      }
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError(err.message);
      // Set featured item from demo data
      setSelectedItem(DEMO_DATA.food.eggs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
  }, []);

  // Find notable items (high price changes)
  const notableItems = Object.keys(data.food).filter(
    key => Math.abs(data.food[key]?.yoyChange || 0) > 15
  );

  return (
    <>
      <Head>
        <title>Cost of Living Dashboard</title>
        <meta name="description" content="Real-time food and gas prices from BLS and EIA" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-4 md:p-6">
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
              <h1 className="text-3xl font-bold text-white">Cost of Living</h1>
              <p className="text-slate-400 mt-1">Grocery & Gas Prices • U.S. National Averages</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Loading prices...</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-red-500/50">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-slate-400 text-sm">Using demo data</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-emerald-500/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live BLS Data</span>
                </div>
              )}
              <span className="text-slate-500 text-sm">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onRetry={fetchPriceData} />}

          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Average Food Price Change (YoY)</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${data.summary.avgFoodChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {data.summary.avgFoodChange > 0 ? '+' : ''}{data.summary.avgFoodChange?.toFixed(1) || '--'}%
                  </span>
                  <span className="text-slate-500">across tracked items</span>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Object.keys(data.food).length}</p>
                  <p className="text-slate-500 text-sm">Food Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{data.gas ? '2' : '0'}</p>
                  <p className="text-slate-500 text-sm">Fuel Types</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{notableItems.length}</p>
                  <p className="text-slate-500 text-sm">Notable Changes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Featured Item */}
            <div className="lg:col-span-2">
              <FeaturedItem item={selectedItem} />
            </div>

            {/* Grocery Receipt */}
            <div>
              <GroceryReceipt food={data.food} />
            </div>
          </div>

          {/* YoY Comparison Chart */}
          <div className="mb-6">
            <YoYComparisonChart food={data.food} />
          </div>

          {/* Food Price Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">All Food Prices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(data.food).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => setSelectedItem(item)}
                  className="cursor-pointer"
                >
                  <PriceCard
                    item={item}
                    isHighlight={notableItems.includes(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gas Prices */}
          <div className="mb-6">
            <GasPricesSection gas={data.gas} />
          </div>

          {/* Annual Cost Calculator */}
          <div className="mb-6">
            <AnnualCostCalculator food={data.food} />
          </div>

          {/* Data Sources */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Food Prices</p>
                <p className="text-slate-500">Bureau of Labor Statistics via FRED</p>
                <p className="text-slate-600 text-xs">APU series (Average Price, Urban)</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Gas Prices</p>
                <p className="text-slate-500">U.S. Energy Information Administration</p>
                <p className="text-slate-600 text-xs">{data.gas ? 'Weekly retail prices' : 'API key required'}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Coverage</p>
                <p className="text-slate-500">U.S. City Average</p>
                <p className="text-slate-600 text-xs">Monthly data, seasonally unadjusted</p>
              </div>
            </div>
          </div>

          {/* Data Disclaimer */}
          <DataDisclaimer />
        </div>
      </main>
    </>
  );
}
