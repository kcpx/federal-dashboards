import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Demo data for when API fails
const DEMO_SUMMARY = {
  economy: {
    gdp: { value: '28.64', change: '2.8', unit: 'T', period: 'Q3 2025' },
    unemployment: { value: 4.1, change: '-0.1', unit: '%', period: 'Nov 2025' },
    inflation: { value: '2.7', unit: '%', label: 'YoY', period: 'Nov 2025' },
    fedRate: { value: 4.50, unit: '%', period: 'Nov 2025' },
  },
  consumer: {
    sentiment: { value: '74.0', change: '2.2', period: 'Dec 2025' },
    gas: { value: '2.94', change: '-5.2', unit: '/gal', period: '2025-12-08' },
    food: { value: '2.4', unit: '%', label: 'YoY', period: 'Nov 2025' },
    mortgage: { value: '6.52', change: '-0.08', unit: '%', period: 'Dec 2025' },
  },
};

// Stat Card Component
const StatCard = ({ label, value, unit, change, period, prefix = '', isPositiveGood = true }) => {
  const changeNum = parseFloat(change);
  const hasChange = change !== null && change !== undefined && !isNaN(changeNum);
  const isPositive = changeNum > 0;
  const changeColor = hasChange
    ? (isPositiveGood ? (isPositive ? 'text-emerald-400' : 'text-red-400') : (isPositive ? 'text-red-400' : 'text-emerald-400'))
    : 'text-slate-400';

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 md:p-4">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl md:text-2xl font-bold text-white">
          {prefix}{value || '--'}{unit && <span className="text-sm md:text-base font-normal text-slate-400">{unit}</span>}
        </span>
        {hasChange && (
          <span className={`text-xs md:text-sm ${changeColor}`}>
            {isPositive ? '↑' : '↓'}{Math.abs(changeNum)}
          </span>
        )}
      </div>
      {period && <p className="text-slate-500 text-xs mt-1">{period}</p>}
    </div>
  );
};

export default function Home() {
  const [summary, setSummary] = useState(DEMO_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary');
        if (!res.ok) throw new Error('Failed to fetch summary');
        const data = await res.json();
        setSummary(data);
        setLastUpdated(new Date(data.timestamp));
      } catch (err) {
        console.error('Error fetching summary:', err);
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <>
      <Head>
        <title>DataGov Live</title>
        <meta name="description" content="Real-time economic data dashboards — FRED, Treasury, Housing, and Cost of Living" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 pt-6 md:pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-400 text-sm font-medium">LIVE DATA</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              DataGov Live
            </h1>

            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto px-4">
              Real-time economic data from FRED, Treasury, and EIA. Built for analysts, researchers, and curious citizens.
            </p>
          </div>

          {/* Economy at a Glance */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Economy at a Glance</h2>
              </div>
              <div className="flex items-center gap-2">
                {loading ? (
                  <span className="text-slate-500 text-xs">Loading...</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                label="Real GDP"
                value={summary.economy.gdp.value}
                unit={summary.economy.gdp.unit}
                change={summary.economy.gdp.change}
                period={summary.economy.gdp.period}
                prefix="$"
                isPositiveGood={true}
              />
              <StatCard
                label="Unemployment"
                value={summary.economy.unemployment.value}
                unit={summary.economy.unemployment.unit}
                change={summary.economy.unemployment.change}
                period={summary.economy.unemployment.period}
                isPositiveGood={false}
              />
              <StatCard
                label="Inflation (CPI)"
                value={summary.economy.inflation.value}
                unit={`${summary.economy.inflation.unit} ${summary.economy.inflation.label || ''}`}
                period={summary.economy.inflation.period}
                isPositiveGood={false}
              />
              <StatCard
                label="Fed Funds Rate"
                value={summary.economy.fedRate.value}
                unit={summary.economy.fedRate.unit}
                period={summary.economy.fedRate.period}
              />
            </div>
          </div>

          {/* Consumer at a Glance */}
          <Link href="/money" className="block mb-6 md:mb-8 group">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Consumer at a Glance</h2>
              </div>
              <div className="flex items-center gap-3">
                {loading ? (
                  <span className="text-slate-500 text-xs">Loading...</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
                <span className="text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Your Money
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                label="Consumer Sentiment"
                value={summary.consumer.sentiment.value}
                change={summary.consumer.sentiment.change}
                period={summary.consumer.sentiment.period}
                isPositiveGood={true}
              />
              <StatCard
                label="Gas Price"
                value={summary.consumer.gas?.value}
                unit={summary.consumer.gas?.unit}
                change={summary.consumer.gas?.change}
                period={summary.consumer.gas?.period}
                prefix="$"
                isPositiveGood={false}
              />
              <StatCard
                label="Food Prices"
                value={summary.consumer.food.value}
                unit={`${summary.consumer.food.unit} ${summary.consumer.food.label || ''}`}
                period={summary.consumer.food.period}
                isPositiveGood={false}
              />
              <StatCard
                label="30Y Mortgage"
                value={summary.consumer.mortgage.value}
                unit={summary.consumer.mortgage.unit}
                change={summary.consumer.mortgage.change}
                period={summary.consumer.mortgage.period}
                isPositiveGood={false}
              />
            </div>
          </div>
          </Link>

          {/* AI Briefing Banner */}
          <Link href="/briefing" className="group block mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50 border border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg md:text-xl font-bold text-white">AI Economic Briefing</h2>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">
                      Daily AI-generated analysis of economic conditions — like having a Fed economist explain the data
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform text-sm md:text-base">
                  Read Briefing
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-16">
            {/* FRED Dashboard Card */}
            <Link href="/fred" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">FRED Economic</h2>
                </div>

                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                  Macro indicators, yield curves, inflation, and labor market data from the Fed.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                  {['GDP', 'Unemployment', 'Inflation', 'Yield Curve'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-blue-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Dashboard
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Treasury Debt Card */}
            <Link href="/treasury" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Treasury Debt</h2>
                </div>

                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                  National debt tracking, interest expense, debt-to-GDP, and upcoming auctions.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                  {['$36T Debt', 'Interest', 'Auctions', 'Debt/GDP'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-red-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Dashboard
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Housing Affordability Card */}
            <Link href="/housing" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Housing</h2>
                </div>

                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                  Affordability calculator with HUD Fair Market Rents and median incomes.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                  {['FMR', 'Income', 'Rent vs Buy', 'ZIP Code'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-emerald-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Calculator
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Cost of Living Card */}
            <Link href="/prices" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Cost of Living</h2>
                </div>

                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                  Real grocery and gas prices. See what eggs, milk, bread, and fuel actually cost.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                  {['Food', 'Gas', 'Diesel', 'YoY Change'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-amber-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform">
                  View Prices
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Your Money Card */}
            <Link href="/money" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Your Money</h2>
                </div>

                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                  See how inflation affects your wallet, salary, and generational wealth.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                  {['Purchasing Power', 'Salary', 'Then vs Now'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-purple-400 text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Explore
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Data Sources */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-white mb-4">Data Sources</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div>
                <h4 className="text-slate-300 font-medium mb-2">FRED API</h4>
                <p className="text-slate-500">Federal Reserve Bank of St. Louis — economic time series</p>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Treasury FiscalData</h4>
                <p className="text-slate-500">Debt, interest rates, and auction data</p>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-2">HUD API</h4>
                <p className="text-slate-500">Fair Market Rents and Income Limits</p>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-2">BLS</h4>
                <p className="text-slate-500">Consumer prices for food and goods</p>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-2">EIA</h4>
                <p className="text-slate-500">Gas and diesel fuel prices</p>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-2">Claude AI</h4>
                <p className="text-slate-500">AI-powered economic analysis</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
