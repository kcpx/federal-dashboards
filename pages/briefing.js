import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function BriefingPage() {
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [briefingDate, setBriefingDate] = useState(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    async function fetchBriefing() {
      try {
        setLoading(true)
        const res = await fetch('/api/briefing')
        const data = await res.json()

        if (data.error && !data.briefing) {
          throw new Error(data.details || 'Failed to generate briefing')
        }

        setBriefing(data.briefing)
        setBriefingDate(data.date)
        setCached(data.cached)
        setError(null)
      } catch (err) {
        console.error('Error fetching briefing:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBriefing()
  }, [])

  const formattedDate = briefingDate
    ? new Date(briefingDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const renderBriefing = (text) => {
    const lines = text.split('\n').filter(line => line.trim());

    return lines.map((line, i) => {
      // Headers (bold text like **The Big Picture**)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="mb-3 text-lg">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : <span key={j}>{part}</span>
            )}
          </p>
        );
      }
      // Bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={i} className="ml-6 mb-2 text-slate-300 text-lg leading-relaxed">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      // Regular paragraphs
      return <p key={i} className="mb-4 text-slate-300 text-lg leading-relaxed">{line}</p>;
    });
  };

  return (
    <>
      <Head>
        <title>AI Economic Briefing | Federal Dashboards</title>
        <meta name="description" content="AI-powered daily economic briefing analyzing FRED data" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <div className="flex items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Economic Briefing</h1>
                <p className="text-slate-400 mt-1">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Briefing Content */}
          {loading ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-slate-300 text-lg">Analyzing economic data...</span>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-5 bg-slate-700 rounded w-full"></div>
                <div className="h-5 bg-slate-700 rounded w-5/6"></div>
                <div className="h-5 bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-red-400 text-lg font-medium">Unable to generate briefing</span>
              </div>
              <p className="text-slate-400">Please check the dashboard for current economic data.</p>
              <Link href="/fred" className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300">
                View FRED Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-8">
              <div className="prose prose-invert max-w-none">
                {renderBriefing(briefing)}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Powered by Claude AI</span>
              {cached && <span className="text-slate-600">• Cached today</span>}
            </div>

            <div className="flex gap-4">
              <Link
                href="/fred"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View FRED Data
              </Link>
              <Link
                href="/housing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Housing Data
              </Link>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-8 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-3">About This Briefing</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              This AI-generated briefing analyzes live economic data from the Federal Reserve Bank of St. Louis (FRED).
              It covers GDP, unemployment, inflation, interest rates, yield curve, housing, and labor market indicators.
              Briefings are regenerated daily and cached to provide consistent analysis throughout the day.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
