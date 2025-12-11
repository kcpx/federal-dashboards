// pages/api/fred.js
// Fetches live economic data from FRED API

import { getFredData } from '../../lib/fred';

export default async function handler(req, res) {
  try {
    const data = await getFredData();

    // Set cache headers (cache for 5 minutes, stale-while-revalidate for 10 min)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    res.status(200).json(data);
  } catch (error) {
    console.error('FRED API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch FRED data', details: error.message });
  }
}
