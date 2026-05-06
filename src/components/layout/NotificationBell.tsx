import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertTriangle, XCircle, Check, CheckCheck, Clock } from 'lucide-react';
import { useAdmin } from '../../lib/AuthContext';
import { AdminNotification } from '@samkiel/authsdk';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const data = await admin.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [admin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await admin.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await admin.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (n: AdminNotification) => {
    if (!n.read) handleMarkRead(n._id);
    setOpen(false);
    
    // Simple navigation logic based on title/type
    if (n.title.toLowerCase().includes('user')) {
      navigate('/users');
    } else if (n.title.toLowerCase().includes('service')) {
      navigate('/system');
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setOpen(!open)}
        aria-label="Notifications" 
        className={`relative transition-colors ${open ? 'text-accent' : 'text-secondary hover:text-primary'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-accent text-[8px] font-black text-black rounded-full flex items-center justify-center border-2 border-base">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20, y: 10 }}
            className="absolute top-full mt-4 right-0 w-80 md:w-96 bg-base border border-border-color rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border-color flex items-center justify-between bg-surface/30">
              <h4 className="text-sm font-bold text-primary">Notifications</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto text-secondary/30">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-secondary text-sm">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border-color/50">
                  {notifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 hover:bg-surface transition-all cursor-pointer flex gap-4 ${!n.read ? 'bg-accent/[0.02]' : ''}`}
                    >
                      <div className={`mt-0.5 p-2 rounded-xl h-fit ${
                        n.type === 'info' ? 'bg-info/10 text-info' : 
                        n.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {n.type === 'info' && <Info className="w-4 h-4" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                        {n.type === 'error' && <XCircle className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className={`text-sm font-bold leading-tight ${!n.read ? 'text-primary' : 'text-secondary'}`}>
                            {n.title}
                          </h5>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">
                          {n.body}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-secondary font-medium">
                          <Clock className="w-3 h-3 opacity-50" />
                          {getTimeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-surface/30 border-t border-border-color text-center">
               <button className="text-[10px] font-bold text-secondary hover:text-primary transition-colors">
                 View All Activity
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
