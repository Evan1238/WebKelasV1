export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    status: 'healthy',
    app: 'NEXUSS X TJKT 1',
    version: '2.0.0',
    environment: 'production',
    architecture: 'Full-Stack Modular Vite + Vercel Serverless',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Supabase PostgreSQL',
      tablesCount: 20,
      realtimeEnabled: true
    }
  });
}
