import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, User, Box, FileText, X } from 'lucide-react';
import { useAdmin } from '../../lib/AuthContext';
import { SearchResults } from '@samkiel/authsdk';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await admin.search(query);
          setResults(res);
          setOpen(true);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, admin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSelect = (type: 'user' | 'product' | 'log', id: string, extra?: string) => {
    setOpen(false);
    setQuery('');
    if (type === 'user') {
      navigate(`/users?id=${id}`);
    } else if (type === 'product') {
      navigate(`/products`);
    } else if (type === 'log') {
      navigate(`/auth-logs?id=${id}`);
    }
  };

  const hasResults = results && (results.users.length > 0 || results.products.length > 0 || results.logs.length > 0);

  return (
    <div className="relative group" ref={containerRef}>
      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-accent' : 'text-secondary group-focus-within:text-accent'}`} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        placeholder="Search users, apps, logs..." 
        className="bg-surface border border-border-color rounded-full py-1.5 pl-10 pr-10 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all w-64 md:w-80 text-primary"
      />
      {loading && (
        <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent" />
      )}
      {!loading && query && (
        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary">
          <X className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-base border border-border-color rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {!hasResults ? (
              <div className="p-8 text-center">
                <p className="text-secondary text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results!.users.length > 0 && (
                  <div className="mb-2">
                    <h5 className="px-4 py-2 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface/30">Users</h5>
                    {results!.users.map(u => (
                      <button 
                        key={u.id}
                        onClick={() => handleSelect('user', u.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-colors group"
                      >
                        <div className="p-1.5 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-black transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{u.name}</p>
                          <p className="text-[10px] text-secondary">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results!.products.length > 0 && (
                  <div className="mb-2">
                    <h5 className="px-4 py-2 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface/30">Products</h5>
                    {results!.products.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleSelect('product', p.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-colors group"
                      >
                        <div className="p-1.5 bg-warning/10 rounded-lg text-warning group-hover:bg-warning group-hover:text-black transition-colors">
                          <Box className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{p.name}</p>
                          <p className="text-[10px] text-secondary">{p.subdomain}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results!.logs.length > 0 && (
                  <div className="mb-2">
                    <h5 className="px-4 py-2 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface/30">Auth Logs</h5>
                    {results!.logs.map(l => (
                      <button 
                        key={l.id}
                        onClick={() => handleSelect('log', l.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-colors group"
                      >
                        <div className="p-1.5 bg-info/10 rounded-lg text-info group-hover:bg-info group-hover:text-black transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{l.eventType}</p>
                          <p className="text-[10px] text-secondary">{l.userEmail} • {new Date(l.createdAt).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
