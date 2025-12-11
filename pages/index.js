import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Federal Economic Dashboards</title>
        <meta name="description" content="FRED Economic Dashboard & Housing Affordability Calculator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-400 text-sm font-medium">LIVE DATA</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Federal Economic Dashboards
            </h1>
            
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Real-time economic data from FRED and HUD. Built for federal analysts, policy researchers, and curious citizens.
            </p>
          </div>

          {/* AI Briefing Banner */}
          <Link href="/briefing" className="group block mb-8">
            <div className="bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">AI Economic Briefing</h2>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">NEW</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Daily AI-generated analysis of economic conditions — like having a Fed economist explain the data
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                  Read Briefing
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* FRED Dashboard Card */}
            <Link href="/fred" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">FRED Economic</h2>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                  Macro indicators, yield curves, inflation, and labor market data from the Fed.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['GDP', 'Unemployment', 'Inflation', 'Yield Curve'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Dashboard
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Treasury Debt Card */}
            <Link href="/treasury" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Treasury Debt</h2>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                  National debt tracking, interest expense, debt-to-GDP, and upcoming auctions.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['$36T Debt', 'Interest', 'Auctions', 'Debt/GDP'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-red-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Dashboard
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Housing Affordability Card */}
            <Link href="/housing" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 card-hover h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Housing</h2>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                  Affordability calculator with HUD Fair Market Rents and median incomes.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['FMR', 'Income', 'Rent vs Buy', 'ZIP Code'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Open Calculator
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Data Sources */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
            <div className="grid md:grid-cols-5 gap-4 text-sm">
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
                <h4 className="text-slate-300 font-medium mb-2">Census ACS</h4>
                <p className="text-slate-500">Median household income</p>
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
