import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Layers, AlertCircle } from 'lucide-react';
import { AdminProduct } from '@samkiel/authsdk';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  product?: AdminProduct | null;
}

export function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subdomain: '',
    description: '',
    status: 'live' as 'live' | 'beta' | 'down',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        subdomain: product.subdomain,
        description: product.description || '',
        status: product.status,
        logoUrl: product.logoUrl || '',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        subdomain: '',
        description: '',
        status: 'live',
        logoUrl: '',
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface border border-border-color w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border-color flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-primary">
              {product ? 'Edit Product' : 'Register New Product'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-base rounded-lg transition-colors">
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kiv"
                  className="w-full bg-base border border-border-color rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary">Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. kiv"
                  className="w-full bg-base border border-border-color rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary">Subdomain</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  required
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  placeholder="app.samkiel.tech"
                  className="w-full bg-base border border-border-color rounded-lg pl-11 pr-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this app do?"
                rows={3}
                className="w-full bg-base border border-border-color rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['live', 'beta', 'down'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                      formData.status === s 
                        ? 'bg-accent text-base border-accent' 
                        : 'bg-base text-secondary border-border-color hover:border-secondary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-border-color rounded-lg text-sm font-bold hover:bg-base transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-accent text-base rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Saving...' : product ? 'Update Product' : 'Register Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
