// pages/api/briefing.js
// Generates AI economic briefing using Claude with persistent daily caching via Vercel KV

import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { getFredData } from '../../lib/fred';

const CACHE_KEY = 'economic-briefing';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDataForPrompt(data) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
Here is today's economic data (${today}):

HEADLINE NUMBERS:
- GDP: $${data.summary.gdp.value}T (${data.summary.gdp.name}), ${data.summary.gdp.change > 0 ? '+' : ''}${data.summary.gdp.change}% annualized growth
- Unemployment: ${data.summary.unemployment.value}%, ${data.summary.unemployment.change > 0 ? 'up' : 'down'} ${Math.abs(data.summary.unemployment.change)} from prior month
- CPI (YoY): ${data.summary.inflation.value}%, ${data.summary.inflation.change > 0 ? 'up' : 'down'} ${Math.abs(data.summary.inflation.change)} from prior month
- Fed Funds Rate: ${data.summary.fedFunds.value}%, ${data.summary.fedFunds.change == 0 ? 'unchanged' : (data.summary.fedFunds.change > 0 ? 'up' : 'down') + ' ' + Math.abs(data.summary.fedFunds.change)}

YIELD CURVE:
- 2Y Treasury: ${data.yieldCurve?.find(y => y.maturity === '2Y')?.yield?.toFixed(2) || 'N/A'}%
- 10Y Treasury: ${data.yieldCurve?.find(y => y.maturity === '10Y')?.yield?.toFixed(2) || 'N/A'}%
- 2Y-10Y Spread: ${data.recessionIndicators.currentSpread}% (${data.recessionIndicators.yieldInversion ? 'INVERTED' : 'positive/normal'})

RECESSION INDICATORS:
- Sahm Rule: ${data.recessionIndicators.sahmRule} (threshold is 0.5 - above = recession signal)
- Yield Curve: ${data.recessionIndicators.yieldInversion ? 'Inverted (recession signal)' : 'Normal (no signal)'}
- Unemployment Trend: ${data.recessionIndicators.unemploymentTrend}

HOUSING:
- 30Y Mortgage Rate: ${data.mortgage30}%
- Housing Starts: ${data.housingData?.[data.housingData.length - 1]?.starts?.toFixed(2) || 'N/A'}M annualized

LABOR MARKET:
- Job Openings (JOLTS): ${data.laborMarket.jolts}M
- Quits Rate: ${data.laborMarket.quits}%
- Hires: ${data.laborMarket.hires}M
- Labor Force Participation: ${data.laborMarket.participation}%
`.trim();
}

async function generateBriefing(fredData) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const dataContext = formatDataForPrompt(fredData);

  const prompt = `${dataContext}

Write a concise economic briefing (150-200 words) for a federal policy analyst or informed citizen. Structure it as:

1. **The Big Picture** (1-2 sentences): Overall economic assessment
2. **What Changed** (2-3 bullet points): Notable recent developments
3. **Watch List** (1-2 bullet points): Risks or indicators to monitor
4. **Bottom Line** (1 sentence): Summary takeaway

Guidelines:
- Be factual and balanced - avoid political commentary
- Use plain English, not jargon
- Reference specific numbers from the data
- Note any recession signals or their absence
- Compare current values to historical norms where relevant (e.g., 4% unemployment is historically low, 2% is the Fed's inflation target)

Do not include a title or date header - those will be added separately.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return response.content[0].text;
}

export default async function handler(req, res) {
  try {
    const today = getTodayString();

    // Check persistent cache first (Vercel KV)
    let cached = null;
    try {
      cached = await kv.get(CACHE_KEY);
    } catch (kvError) {
      console.log('KV not configured, skipping cache check:', kvError.message);
    }

    // If we have a cached briefing from today, return it
    if (cached && cached.date === today) {
      return res.status(200).json({
        briefing: cached.briefing,
        date: cached.date,
        cached: true,
        generatedAt: cached.generatedAt,
      });
    }

    // No valid cache - generate new briefing
    const fredData = await getFredData();
    const briefing = await generateBriefing(fredData);
    const generatedAt = new Date().toISOString();

    // Store in persistent cache (expires in 25 hours to ensure daily refresh)
    try {
      await kv.set(CACHE_KEY, {
        briefing,
        date: today,
        generatedAt,
      }, { ex: 90000 }); // 25 hours in seconds
    } catch (kvError) {
      console.log('KV not configured, skipping cache write:', kvError.message);
    }

    res.status(200).json({
      briefing,
      date: today,
      cached: false,
      generatedAt,
    });
  } catch (error) {
    console.error('Briefing API error:', error);

    // Try to return cached version even if expired
    try {
      const cached = await kv.get(CACHE_KEY);
      if (cached?.briefing) {
        return res.status(200).json({
          briefing: cached.briefing,
          date: cached.date,
          cached: true,
          stale: true,
          generatedAt: cached.generatedAt,
        });
      }
    } catch (kvError) {
      // KV not available
    }

    res.status(500).json({
      error: 'Failed to generate briefing',
      details: error.message,
      fallback: true,
      briefing: "Economic briefing temporarily unavailable. Please check the dashboard charts for current data.",
    });
  }
}
