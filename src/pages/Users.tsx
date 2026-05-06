import { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AuthContext';
import { AdminUser, AdminUserDetail } from '@samkiel/authsdk';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, Filter, UserCheck, UserMinus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UsersPage() {
  const admin = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await admin.getUsers({ page, search, limit: 10 });
      setUsers(res.users || []);
      setTotal(res.pagination.total);
    } catch (err: any) {
      console.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSuspend = async (id: string, suspended: boolean) => {
    // Optimistic UI
    setUsers(prev => prev.map(u => u.id === id ? { ...u, suspended } : u));
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, suspended });
    }

    try {
      await admin.suspendUser(id, suspended);
    } catch (err) {
      // Revert on error
      setUsers(prev => prev.map(u => u.id === id ? { ...u, suspended: !suspended } : u));
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, suspended: !suspended });
      }
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      await admin.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const viewUserDetail = async (id: string) => {
    try {
      const user = await admin.getUserById(id);
      setSelectedUser(user);
    } catch (err) {
      alert('Failed to fetch user details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Users & Accounts</h1>
          <p className="text-secondary mt-1">Manage all accounts across the SAMKIEL ecosystem.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-surface border border-border-color rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-md text-sm font-medium hover:bg-base transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-surface border border-border-color rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-color bg-base/50">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-8 ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-base/30 transition-colors cursor-pointer group"
                  onClick={() => viewUserDetail(user.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-base border border-border-color flex items-center justify-center text-xs font-bold">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{user.name}</p>
                        <p className="text-xs text-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.suspended ? 'bg-destructive' : 'bg-success'}`}></span>
                      <span className="text-secondary">{user.suspended ? 'Suspended' : 'Active'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleSuspend(user.id, !user.suspended)}
                         className="p-1.5 text-secondary hover:text-accent hover:bg-base rounded-md transition-colors"
                         title={user.suspended ? 'Unsuspend' : 'Suspend'}
                       >
                         {user.suspended ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                       </button>
                       <button 
                         onClick={() => handleDelete(user.id)}
                         className="p-1.5 text-secondary hover:text-destructive hover:bg-base rounded-md transition-colors"
                         title="Delete"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary">
            Showing <span className="text-primary font-medium">{users.length}</span> of <span className="text-primary font-medium">{total}</span> users
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
              disabled={page * 10 >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-border-color rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-base/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-border-color shadow-2xl z-50 p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-heading font-bold">User Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-secondary hover:text-primary rounded-full hover:bg-base transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-base border border-border-color flex items-center justify-center text-2xl font-bold text-accent">
                     {selectedUser.name?.[0] || 'U'}
                   </div>
                   <div>
                     <h4 className="text-lg font-bold text-primary">{selectedUser.name}</h4>
                     <p className="text-secondary">{selectedUser.email}</p>
                     <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedUser.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>
                       {selectedUser.role}
                     </span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-base/50 p-4 rounded-lg border border-border-color">
                    <p className="text-xs text-secondary mb-1">Status</p>
                    <p className={`font-bold ${selectedUser.suspended ? 'text-destructive' : 'text-success'}`}>
                      {selectedUser.suspended ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                  <div className="bg-base/50 p-4 rounded-lg border border-border-color">
                    <p className="text-xs text-secondary mb-1">Plan</p>
                    <p className="font-bold text-primary capitalize">{selectedUser.plan}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-primary uppercase tracking-wider">Metrics</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary">Active Sessions</span>
                      <span className="font-medium">{selectedUser.activeSessions}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary">Auth Events</span>
                      <span className="font-medium">{selectedUser.authEventCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary">Last Active</span>
                      <span className="font-medium">{new Date(selectedUser.lastActiveAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-primary uppercase tracking-wider">Connected Products</h5>
                  {selectedUser.connectedProducts.length === 0 ? (
                    <p className="text-sm text-secondary italic">No products connected yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.connectedProducts.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-base/30 border border-border-color rounded-lg text-sm">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-secondary">Since {new Date(p.connectedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-border-color flex gap-3">
                   <button 
                     onClick={() => handleSuspend(selectedUser.id, !selectedUser.suspended)}
                     className={`flex-1 px-4 py-2 rounded-md text-sm font-bold transition-colors ${selectedUser.suspended ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
                   >
                     {selectedUser.suspended ? 'Unsuspend Account' : 'Suspend Account'}
                   </button>
                   <button 
                     onClick={() => handleDelete(selectedUser.id)}
                     className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-sm font-bold transition-colors"
                   >
                     Delete
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
