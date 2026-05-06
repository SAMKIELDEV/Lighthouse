import { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AuthContext';
import { AdminAuthLog } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { Download, Search, Calendar } from 'lucide-react';

export function AuthLogsPage() {
  const admin = useAdmin();
  const [logs, setLogs] = useState<AdminAuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [eventType, setEventType] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await admin.getAuthLogs({ 
        page, 
        eventType, 
        limit: 20,
        userId: search // We'll update the backend to treat userId as a search term if it's not a valid ID
      });
      setLogs(res.logs || []);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, eventType, search]);


  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ['ID', 'User Email', 'Event Type', 'Provider', 'IP Address', 'Status', 'Timestamp'];
    const rows = logs.map(l => [
      l.id,
      l.userEmail,
      l.eventType,
      l.provider || 'N/A',
      l.ipAddress || 'N/A',
      l.status,
      new Date(l.createdAt).toISOString()
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auth-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">Auth Logs</h1>
          <p className="text-secondary mt-1 text-sm md:text-base">Audit trail for all authentication activity across the platform.</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={logs.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-base rounded-md text-sm font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input 
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border-color rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
          />

        </div>
        <div className="flex gap-4">
          <select 
            className="flex-1 bg-surface border border-border-color rounded-md px-4 py-2 text-sm focus:outline-none focus:border-accent"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="">All Events</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="REGISTER">Register</option>
            <option value="PASSWORD_CHANGE">Password Change</option>
            <option value="ACCOUNT_DELETED">Account Deleted</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-md text-sm font-medium hover:bg-base transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Date Range</span>
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border-color rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="border-b border-border-color bg-base/50">
                <th className="px-6 py-4 font-semibold text-secondary uppercase tracking-wider text-[10px]">Event</th>
                <th className="px-6 py-4 font-semibold text-secondary uppercase tracking-wider text-[10px]">User</th>
                <th className="px-6 py-4 font-semibold text-secondary uppercase tracking-wider text-[10px]">IP Address</th>
                <th className="px-6 py-4 font-semibold text-secondary uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-semibold text-secondary uppercase tracking-wider text-[10px]">Timestamp</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-border-color">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-base/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary">{log.eventType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary">{log.userEmail}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-secondary">
                    {log.ipAddress || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary">
            Page <span className="text-primary font-medium">{page}</span> of <span className="text-primary font-medium">{Math.ceil(total / 20)}</span>
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-border-color rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page * 20 >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-border-color rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
