import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine } from 'recharts'

// FRED Series IDs for reference:
// GDP: GDP, GDPC1 (real)
// Unemployment: UNRATE
// Inflation: CPIAUCSL (CPI), PCEPI (PCE)
// Fed Funds: FEDFUNDS
// 10Y Treasury: DGS10
// 2Y Treasury: DGS2
// 30Y Mortgage: MORTGAGE30US
// Housing Starts: HOUST

// December 2025 Demo Data - Replace with live FRED API calls
const DEMO_DATA = {
  summary: {
    gdp: { value: 28.64, change: 2.8, unit: 'T', name: 'Real GDP (Q3 2025)' },
    unemployment: { value: 4.1, change: -0.2, unit: '%', name: 'Unemployment Rate' },
    inflation: { value: 2.7, change: -0.4, unit: '%', name: 'CPI (YoY)' },
    fedFunds: { value: 4.50, change: -0.75, unit: '%', name: 'Fed Funds Rate' },
  },
  gdpHistory: [
    { date: '2023-Q1', value: 26.53 }, { date: '2023-Q2', value: 26.84 }, { date: '2023-Q3', value: 27.15 },
    { date: '2023-Q4', value: 27.36 }, { date: '2024-Q1', value: 27.58 }, { date: '2024-Q2', value: 27.84 },
    { date: '2024-Q3', value: 28.06 }, { date: '2024-Q4', value: 28.29 }, { date: '2025-Q1', value: 28.42 },
    { date: '2025-Q2', value: 28.55 }, { date: '2025-Q3', value: 28.64 },
  ],
  unemploymentHistory: [
    { date: 'Jan 24', value: 3.7 }, { date: 'Mar 24', value: 3.8 }, { date: 'May 24', value: 4.0 },
    { date: 'Jul 24', value: 4.3 }, { date: 'Sep 24', value: 4.1 }, { date: 'Nov 24', value: 4.2 },
    { date: 'Jan 25', value: 4.0 }, { date: 'Mar 25', value: 4.1 }, { date: 'May 25', value: 4.0 },
    { date: 'Jul 25', value: 4.2 }, { date: 'Sep 25', value: 4.1 }, { date: 'Nov 25', value: 4.1 },
  ],
  inflationHistory: [
    { date: 'Jan 24', cpi: 3.1, pce: 2.6 }, { date: 'Mar 24', cpi: 3.5, pce: 2.7 },
    { date: 'May 24', cpi: 3.3, pce: 2.6 }, { date: 'Jul 24', cpi: 2.9, pce: 2.5 },
    { date: 'Sep 24', cpi: 2.4, pce: 2.2 }, { date: 'Nov 24', cpi: 2.7, pce: 2.4 },
    { date: 'Jan 25', cpi: 2.9, pce: 2.5 }, { date: 'Mar 25', cpi: 2.8, pce: 2.4 },
    { date: 'May 25', cpi: 2.6, pce: 2.3 }, { date: 'Jul 25', cpi: 2.5, pce: 2.2 },
    { date: 'Sep 25', cpi: 2.6, pce: 2.3 }, { date: 'Nov 25', cpi: 2.7, pce: 2.4 },
  ],
  yieldCurve: [
    { maturity: '1M', yield: 4.45 }, { maturity: '3M', yield: 4.42 }, { maturity: '6M', yield: 4.35 },
    { maturity: '1Y', yield: 4.25 }, { maturity: '2Y', yield: 4.18 }, { maturity: '3Y', yield: 4.15 },
    { maturity: '5Y', yield: 4.20 }, { maturity: '7Y', yield: 4.28 }, { maturity: '10Y', yield: 4.35 },
    { maturity: '20Y', yield: 4.58 }, { maturity: '30Y', yield: 4.55 },
  ],
  yieldSpreadHistory: [
    { date: 'Jan 24', spread: -0.35 }, { date: 'Mar 24', spread: -0.42 }, { date: 'May 24', spread: -0.38 },
    { date: 'Jul 24', spread: -0.20 }, { date: 'Sep 24', spread: 0.05 }, { date: 'Nov 24', spread: 0.12 },
    { date: 'Jan 25', spread: 0.08 }, { date: 'Mar 25', spread: 0.15 }, { date: 'May 25', spread: 0.18 },
    { date: 'Jul 25', spread: 0.14 }, { date: 'Sep 25', spread: 0.16 }, { date: 'Nov 25', spread: 0.17 },
  ],
  fedFundsHistory: [
    { date: 'Jan 24', rate: 5.50 }, { date: 'Mar 24', rate: 5.50 }, { date: 'May 24', rate: 5.50 },
    { date: 'Jul 24', rate: 5.50 }, { date: 'Sep 24', rate: 5.00 }, { date: 'Nov 24', rate: 4.75 },
    { date: 'Jan 25', rate: 4.50 }, { date: 'Mar 25', rate: 4.50 }, { date: 'May 25', rate: 4.50 },
    { date: 'Jul 25', rate: 4.50 }, { date: 'Sep 25', rate: 4.50 }, { date: 'Nov 25', rate: 4.50 },
  ],
  housingData: [
    { date: 'Jan 24', starts: 1.42, mortgage: 6.64 }, { date: 'Mar 24', starts: 1.32, mortgage: 6.82 },
    { date: 'May 24', starts: 1.35, mortgage: 7.03 }, { date: 'Jul 24', starts: 1.24, mortgage: 6.78 },
    { date: 'Sep 24', starts: 1.35, mortgage: 6.20 }, { date: 'Nov 24', starts: 1.31, mortgage: 6.84 },
    { date: 'Jan 25', starts: 1.36, mortgage: 6.95 }, { date: 'Mar 25', starts: 1.38, mortgage: 6.72 },
    { date: 'May 25', starts: 1.41, mortgage: 6.58 }, { date: 'Jul 25', starts: 1.39, mortgage: 6.45 },
    { date: 'Sep 25', starts: 1.42, mortgage: 6.38 }, { date: 'Nov 25', starts: 1.40, mortgage: 6.52 },
  ],
  laborMarket: {
    jolts: 7.74, // Job openings (millions)
    quits: 3.3, // Quits rate (%)
    hires: 5.3, // Hires (millions)
    participation: 62.5, // Labor force participation (%)
  },
  recessionIndicators: {
    sahmRule: 0.37, // Below 0.5 = no recession signal
    leadingIndex: 0.2, // Conference Board LEI
    yieldInversion: false,
    unemploymentTrend: 'stable',
  }
}

const SummaryCard = ({ title, value, unit, change, color = 'blue' }) => {
  const isPositive = change >= 0
  const changeColor = title.includes('Unemployment') || title.includes('Inflation') 
    ? (isPositive ? 'text-red-400' : 'text-emerald-400')
    : (isPositive ? 'text-emerald-400' : 'text-red-400')
  
  const bgColors = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    yellow: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
  }

  return (
    <div className={`bg-gradient-to-br ${bgColors[color]} border rounded-xl p-5`}>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-slate-400 text-lg">{unit}</span>
      </div>
      <div className={`text-sm mt-2 ${changeColor}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)} from prior
      </div>
    </div>
  )
}

const ChartCard = ({ title, children, description }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
      </div>
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
          <p key={i} className="text-white text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value?.toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function FredDashboard() {
  const [data, setData] = useState(DEMO_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    async function fetchFredData() {
      try {
        setLoading(true)
        const res = await fetch('/api/fred')
        if (!res.ok) throw new Error('Failed to fetch FRED data')
        const liveData = await res.json()
        
        // Merge live data with demo data structure
        setData(prev => ({
          ...prev,
          summary: {
            gdp: { 
              value: parseFloat(liveData.summary.gdp.value) || prev.summary.gdp.value, 
              change: parseFloat(liveData.summary.gdp.change) || prev.summary.gdp.change,
              unit: 'T',
              name: liveData.summary.gdp.name || prev.summary.gdp.name
            },
            unemployment: {
              value: liveData.summary.unemployment.value || prev.summary.unemployment.value,
              change: parseFloat(liveData.summary.unemployment.change) || prev.summary.unemployment.change,
              unit: '%',
              name: 'Unemployment Rate'
            },
            inflation: {
              value: parseFloat(liveData.summary.inflation.value) || prev.summary.inflation.value,
              change: parseFloat(liveData.summary.inflation.change) || prev.summary.inflation.change,
              unit: '%',
              name: 'CPI (YoY)'
            },
            fedFunds: {
              value: liveData.summary.fedFunds.value || prev.summary.fedFunds.value,
              change: parseFloat(liveData.summary.fedFunds.change) || prev.summary.fedFunds.change,
              unit: '%',
              name: 'Fed Funds Rate'
            },
          },
          gdpHistory: liveData.gdpHistory?.length > 0 ? liveData.gdpHistory : prev.gdpHistory,
          unemploymentHistory: liveData.unemploymentHistory?.length > 0 ? liveData.unemploymentHistory : prev.unemploymentHistory,
          inflationHistory: liveData.inflationHistory?.length > 0 ? liveData.inflationHistory : prev.inflationHistory,
          yieldCurve: liveData.yieldCurve?.length > 0 ? liveData.yieldCurve : prev.yieldCurve,
          yieldSpreadHistory: liveData.yieldSpreadHistory?.length > 0 ? liveData.yieldSpreadHistory : prev.yieldSpreadHistory,
          housingData: liveData.housingData?.length > 0 ? liveData.housingData : prev.housingData,
          laborMarket: {
            jolts: parseFloat(liveData.laborMarket.jolts) || prev.laborMarket.jolts,
            quits: liveData.laborMarket.quits || prev.laborMarket.quits,
            hires: parseFloat(liveData.laborMarket.hires) || prev.laborMarket.hires,
            participation: liveData.laborMarket.participation || prev.laborMarket.participation,
          },
          recessionIndicators: {
            sahmRule: parseFloat(liveData.recessionIndicators.sahmRule) || prev.recessionIndicators.sahmRule,
            leadingIndex: prev.recessionIndicators.leadingIndex, // Not available from FRED directly
            yieldInversion: liveData.recessionIndicators.yieldInversion ?? prev.recessionIndicators.yieldInversion,
            unemploymentTrend: liveData.recessionIndicators.unemploymentTrend || prev.recessionIndicators.unemploymentTrend,
          }
        }))
        setLastUpdated(new Date(liveData.timestamp))
        setError(null)
      } catch (err) {
        console.error('Error fetching FRED data:', err)
        setError(err.message)
        // Keep demo data on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchFredData()
  }, [])

  return (
    <>
      <Head>
        <title>FRED Economic Dashboard</title>
        <meta name="description" content="Real-time economic indicators from FRED" />
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
              <h1 className="text-3xl font-bold text-white">FRED Economic Dashboard</h1>
              <p className="text-slate-400 mt-1">Federal Reserve Bank of St. Louis • December 2025</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Loading live data...</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-red-500/50">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-slate-400 text-sm">Using demo data</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-emerald-500/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live FRED Data</span>
                </div>
              )}
              <span className="text-slate-500 text-sm">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* AI Briefing Link */}
          <Link href="/briefing" className="block mb-8 group">
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">AI Economic Briefing</h3>
                    <p className="text-slate-400 text-sm">Get an AI-generated analysis of this data</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard 
              title={data.summary.gdp.name}
              value={`$${data.summary.gdp.value}`}
              unit="T"
              change={data.summary.gdp.change}
              color="blue"
            />
            <SummaryCard 
              title={data.summary.unemployment.name}
              value={data.summary.unemployment.value}
              unit="%"
              change={data.summary.unemployment.change}
              color="green"
            />
            <SummaryCard 
              title={data.summary.inflation.name}
              value={data.summary.inflation.value}
              unit="%"
              change={data.summary.inflation.change}
              color="yellow"
            />
            <SummaryCard 
              title={data.summary.fedFunds.name}
              value={data.summary.fedFunds.value}
              unit="%"
              change={data.summary.fedFunds.change}
              color="purple"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* GDP Growth */}
            <ChartCard title="Real GDP" description="Quarterly, seasonally adjusted annual rate ($ Trillions)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.gdpHistory}>
                    <defs>
                      <linearGradient id="gdpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#gdpGradient)" name="GDP" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Unemployment */}
            <ChartCard title="Unemployment Rate" description="Monthly, seasonally adjusted (%)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.unemploymentHistory}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3, 5]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={4.0} stroke="#64748b" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} name="Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Inflation (CPI vs PCE) */}
            <ChartCard title="Inflation: CPI vs PCE" description="Year-over-year change (%)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.inflationHistory}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[2, 4]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '2% Target', fill: '#f59e0b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="cpi" stroke="#f59e0b" strokeWidth={2} dot={false} name="CPI" />
                    <Line type="monotone" dataKey="pce" stroke="#8b5cf6" strokeWidth={2} dot={false} name="PCE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-400 text-sm">CPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-slate-400 text-sm">PCE (Fed preferred)</span>
                </div>
              </div>
            </ChartCard>

            {/* Yield Curve */}
            <ChartCard title="Treasury Yield Curve" description="Current term structure of interest rates">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.yieldCurve}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="maturity" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[4, 5]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="yield" stroke="#8b5cf6" strokeWidth={2} fill="url(#yieldGradient)" name="Yield" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* 2Y-10Y Spread */}
            <ChartCard title="2Y-10Y Treasury Spread" description="Yield curve slope — negative = inversion (recession signal)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.yieldSpreadHistory}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[-0.5, 0.3]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar 
                      dataKey="spread" 
                      name="Spread"
                      fill="#3b82f6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm font-medium">
                  ✓ Yield curve is now positive (0.17%) — recession signal cleared
                </p>
              </div>
            </ChartCard>

            {/* Fed Funds Rate */}
            <ChartCard title="Federal Funds Rate" description="FOMC target rate (upper bound)">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.fedFundsHistory}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[4, 6]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="stepAfter" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={false} name="Fed Funds" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-slate-700/50">
                <p className="text-slate-300 text-sm">
                  Fed cut 75bps in late 2024, held steady in 2025. Markets pricing 2 more cuts in 2026.
                </p>
              </div>
            </ChartCard>
          </div>

          {/* Housing Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Housing Market</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartCard title="Housing Starts & Mortgage Rates" description="Monthly housing starts (M) vs 30Y fixed mortgage rate (%)">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.housingData}>
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" domain={[1, 1.6]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" domain={[6, 7.5]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line yAxisId="left" type="monotone" dataKey="starts" stroke="#10b981" strokeWidth={2} dot={false} name="Starts (M)" />
                      <Line yAxisId="right" type="monotone" dataKey="mortgage" stroke="#f59e0b" strokeWidth={2} dot={false} name="Mortgage (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-400 text-sm">Housing Starts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-400 text-sm">30Y Mortgage Rate</span>
                  </div>
                </div>
              </ChartCard>

              {/* Labor Market Summary */}
              <ChartCard title="Labor Market Snapshot" description="JOLTS and participation data">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Job Openings (JOLTS)</p>
                    <p className="text-2xl font-bold text-white">{data.laborMarket.jolts}M</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Quits Rate</p>
                    <p className="text-2xl font-bold text-white">{data.laborMarket.quits}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Hires (monthly)</p>
                    <p className="text-2xl font-bold text-white">{data.laborMarket.hires}M</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Participation Rate</p>
                    <p className="text-2xl font-bold text-white">{data.laborMarket.participation}%</p>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-slate-700/50">
                  <p className="text-slate-300 text-sm">
                    Labor market remains tight but cooling. Job openings down from 2022 peak of 12M.
                  </p>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Recession Indicators */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Recession Indicators</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${data.recessionIndicators.sahmRule < 0.5 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className="text-slate-400 text-sm mb-1">Sahm Rule</p>
                <p className="text-2xl font-bold text-white">{data.recessionIndicators.sahmRule}</p>
                <p className={`text-sm ${data.recessionIndicators.sahmRule < 0.5 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.recessionIndicators.sahmRule < 0.5 ? '✓ Below 0.5 threshold' : '⚠ Above 0.5 threshold'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Leading Index (LEI)</p>
                <p className="text-2xl font-bold text-white">{data.recessionIndicators.leadingIndex > 0 ? '+' : ''}{data.recessionIndicators.leadingIndex}%</p>
                <p className="text-slate-400 text-sm">MoM change</p>
              </div>
              <div className={`p-4 rounded-lg ${!data.recessionIndicators.yieldInversion ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className="text-slate-400 text-sm mb-1">Yield Curve</p>
                <p className="text-2xl font-bold text-white">{data.recessionIndicators.yieldInversion ? 'Inverted' : 'Normal'}</p>
                <p className={`text-sm ${!data.recessionIndicators.yieldInversion ? 'text-emerald-400' : 'text-red-400'}`}>
                  {!data.recessionIndicators.yieldInversion ? '✓ Positive slope' : '⚠ Recession signal'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Unemployment Trend</p>
                <p className="text-2xl font-bold text-white capitalize">{data.recessionIndicators.unemploymentTrend}</p>
                <p className="text-slate-400 text-sm">3-month direction</p>
              </div>
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Data Sources & Series IDs</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-2">GDP & Growth</p>
                <code className="text-slate-500">GDPC1, GDP</code>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Labor Market</p>
                <code className="text-slate-500">UNRATE, JTSJOL, CIVPART</code>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Inflation</p>
                <code className="text-slate-500">CPIAUCSL, PCEPI</code>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Rates & Housing</p>
                <code className="text-slate-500">FEDFUNDS, DGS10, MORTGAGE30US</code>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              {error ? (
                <>Demo data shown due to API error. </>
              ) : (
                <>Live data from FRED API. </>
              )}
              Series refresh on page load. API key configured.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
