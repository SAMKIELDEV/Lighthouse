export const systemHealth = {
  status: 'Operational', // Operational, Degraded, Down
  services: [
    { name: 'SAMKIEL ID API', status: 'Operational', uptime: '99.99%', lastChecked: 'Just now' },
    { name: 'Kiv API', status: 'Operational', uptime: '99.95%', lastChecked: 'Just now' },
    { name: 'Auth SDK (npm)', status: 'Operational', uptime: '100%', lastChecked: '5m ago' },
    { name: 'Vercel Deployments', status: 'Degraded', uptime: '98.50%', lastChecked: '2m ago' },
    { name: 'Database', status: 'Operational', uptime: '99.99%', lastChecked: 'Just now' },
  ],
  incidents: [
    { id: '1', title: 'Vercel Deployment Delays', status: 'Investigating', date: '2026-05-06 08:30 AM', resolutionTime: '-' },
    { id: '2', title: 'Database Failover', status: 'Resolved', date: '2026-05-02 02:15 AM', resolutionTime: '15m' },
    { id: '3', title: 'Kiv API Latency Spike', status: 'Resolved', date: '2026-04-28 04:45 PM', resolutionTime: '45m' },
  ]
};