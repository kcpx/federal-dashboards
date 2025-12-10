// pages/api/briefing.js
// Serves the pre-generated daily briefing from Vercel Blob
// The briefing is generated once daily by the cron job

import { list } from '@vercel/blob';

const BLOB_FILENAME = 'daily-briefing.json';

export default async function handler(req, res) {
  try {
    // Find the briefing blob
    const { blobs } = await list({ prefix: BLOB_FILENAME });

    if (blobs.length === 0) {
      return res.status(200).json({
        error: 'No briefing available yet',
        fallback: true,
        briefing: "Economic briefing will be generated shortly. Please check back soon or view the dashboard charts for current data.",
      });
    }

    // Fetch the briefing content
    const blobUrl = blobs[0].url;
    const response = await fetch(blobUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch briefing from storage');
    }

    const briefingData = await response.json();

    res.status(200).json({
      briefing: briefingData.briefing,
      date: briefingData.date,
      cached: true,
      generatedAt: briefingData.generatedAt,
    });
  } catch (error) {
    console.error('Briefing API error:', error);

    res.status(500).json({
      error: 'Failed to retrieve briefing',
      details: error.message,
      fallback: true,
      briefing: "Economic briefing temporarily unavailable. Please check the dashboard charts for current data.",
    });
  }
}
