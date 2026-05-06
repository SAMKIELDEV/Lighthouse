import { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AuthContext';
import { AdminProduct } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { Layers, Users, ExternalLink, Globe, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductModal } from '../components/ProductModal';
import { useAlert } from '../lib/AlertContext';

export function ProductsPage() {
  const admin = useAdmin();
  const { showAlert } = useAlert();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

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

  const handleSaveProduct = async (data: any) => {
    if (editingProduct) {
      await admin.updateProduct(editingProduct.id, data);
    } else {
      await admin.registerProduct(data);
    }
    fetchProducts();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    showAlert({
      title: 'Delete Product',
      description: `Are you sure you want to remove ${name}? This will also disconnect all users.`,
      type: 'error',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await admin.deleteProduct(id);
          fetchProducts();
        } catch (err: any) {
          setError(err.message || 'Failed to delete product');
        }
      }
    });
  };

  const openRegisterModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">Products & Apps</h1>
          <p className="text-secondary mt-1 text-sm md:text-base">Monitor and manage all live products in the SAMKIEL ecosystem.</p>
        </div>
        <button 
          onClick={openRegisterModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-base rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Register Product
        </button>
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
              className="bg-surface border border-border-color rounded-xl p-6 flex flex-col hover:border-accent/50 transition-colors group relative"
            >
              <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(product)}
                  className="p-2 bg-base border border-border-color rounded-lg text-secondary hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="p-2 bg-base border border-border-color rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

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
                <h3 className="text-xl font-heading font-bold text-primary group-hover:text-accent transition-colors pr-16">
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

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}

