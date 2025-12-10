import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

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

  useEffect(() => {
    async function fetchData() {
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
        </div>
      </main>
    </>
  )
}
