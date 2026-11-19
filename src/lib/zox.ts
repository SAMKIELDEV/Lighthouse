export type ZoxServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface ZoxService {
  name: string;
  status: ZoxServiceStatus;
  latencyMs?: number;
  detail?: string;
}

export interface ZoxIncident {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
  createdAt: string;
}

export interface ZoxActivityPoint {
  time: string;
  conversations: number;
  toolCalls: number;
  failures: number;
}

export interface ZoxOverview {
  generatedAt: string;
  metrics: {
    activeUsers24h: number;
    conversations24h: number;
    creditsConsumed24h: number;
    failedJobs24h: number;
    pendingJobs: number;
    paymentFailures24h: number;
  };
  services: ZoxService[];
  activity: ZoxActivityPoint[];
  incidents: ZoxIncident[];
}

const configuredUrl = import.meta.env.VITE_ZOX_ADMIN_API_URL?.trim();

export async function getZoxOverview(signal?: AbortSignal): Promise<ZoxOverview> {
  if (!configuredUrl) {
    throw new Error('Set VITE_ZOX_ADMIN_API_URL to connect Zox operational data.');
  }

  const response = await fetch(`${configuredUrl.replace(/\/$/, '')}/overview`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Zox admin API returned ${response.status}.`);
  }

  return response.json() as Promise<ZoxOverview>;
}
