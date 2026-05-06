import { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { AdminProduct } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { Layers, Users, ExternalLink, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProductsPage() {
  const admin = useAdmin();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await admin.getProducts();
      setProducts(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Products & Apps</h1>
          <p className="text-secondary mt-1">Monitor all live products in the SAMKIEL ecosystem.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-destructive flex items-center justify-between">
          <p>{error}</p>
          <button onClick={fetchProducts} className="text-sm font-bold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border-color rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-4 border-t border-border-color grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-secondary bg-surface border border-border-color rounded-xl">
            No products registered.
          </div>
        ) : (
          products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-border-color rounded-xl p-6 flex flex-col hover:border-accent/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-base rounded-lg border border-border-color text-accent">
                  <Layers className="w-6 h-6" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  product.status === 'live' ? 'bg-success/10 text-success' : 
                  product.status === 'beta' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                }`}>
                  {product.status}
                </span>
              </div>

              <div className="flex-1 space-y-1 mb-6">
                <h3 className="text-xl font-heading font-bold text-primary group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 text-secondary text-sm">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{product.subdomain}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-color">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-secondary">
                    <Users className="w-3 h-3" />
                    <span>Users</span>
                  </div>
                  <p className="text-lg font-heading font-bold text-primary">{product.connectedUsersCount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] uppercase tracking-wider text-secondary font-bold">Last Deploy</p>
                   <p className="text-sm font-medium text-primary">
                     {product.lastDeployedAt ? new Date(product.lastDeployedAt).toLocaleDateString() : 'Never'}
                   </p>
                </div>
              </div>

              <div className="mt-6">
                <a 
                  href={`https://${product.subdomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-base hover:bg-base/70 border border-border-color rounded-lg text-sm font-bold transition-colors"
                >
                  Visit App
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
