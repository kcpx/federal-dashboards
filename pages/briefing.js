import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function BriefingPage() {
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [briefingDate, setBriefingDate] = useState(null)

  const generateBriefing = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/briefing')
      const data = await res.json()

      if (data.error) {
        throw new Error(data.details || 'Failed to generate briefing')
      }

      setBriefing(data.briefing)
      setBriefingDate(data.date)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={i} className="ml-6 mb-2 text-slate-300 text-lg leading-relaxed">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      return <p key={i} className="mb-4 text-slate-300 text-lg leading-relaxed">{line}</p>;
    });
  };

  return (
    <>
      <Head>
        <title>AI Economic Briefing | Federal Dashboards</title>
        <meta name="description" content="AI-powered economic briefing analyzing FRED data" />
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

          {/* Generate Button or Content */}
          {!briefing && !loading && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Generate Economic Briefing</h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Click below to analyze the latest FRED economic data and generate an AI-powered briefing.
              </p>
              <button
                onClick={generateBriefing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Briefing
              </button>
              {error && (
                <p className="mt-4 text-red-400 text-sm">{error}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
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
          )}

          {/* Briefing Content */}
          {briefing && !loading && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-8">
              <div className="prose prose-invert max-w-none">
                {renderBriefing(briefing)}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <button
                  onClick={generateBriefing}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Powered by Claude AI</span>
            </div>

            <div className="flex gap-4">
              <Link
                href="/fred"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View FRED Data
              </Link>
              <Link
                href="/housing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Housing Data
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
