'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { markNotificationRead, markAllNotificationsRead } from '@/actions/profile';
import { Bell, CheckCheck, Inbox, ArrowRight } from 'lucide-react';

interface Notification {
  id: number; title: string; message: string; type: string; read: boolean; createdAt: string;
}

const typeIcons: Record<string, string> = {
  Achievement: '🏆', Deadline: '⏰', Streak: '🔥', Success: '🎉', Warning: '⚠️', Info: '📌',
};

const typeColors: Record<string, string> = {
  Achievement: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Deadline: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  Streak: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const notifications = initialNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  async function handleMarkRead(id: number) { await markNotificationRead(id); }
  async function handleMarkAllRead() { await markAllNotificationsRead(); }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } } };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><Bell size={24} className="text-primary" /></div>
            Notifications
          </h1>
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-md inline-block">
            {unreadCount > 0 ? <strong className="text-foreground">{unreadCount} unread</strong> : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border/60 text-muted-foreground font-bold text-sm rounded-xl hover:text-foreground hover:bg-muted shadow-sm transition-all active:scale-95 shrink-0" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </motion.div>

      {notifications.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
          <AnimatePresence>
            {notifications.map(n => {
              const colorClass = typeColors[n.type] || typeColors.Info;
              return (
                <motion.div
                  key={n.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`
                    relative bg-card border p-4 sm:p-5 rounded-[24px] flex flex-col sm:flex-row sm:items-center gap-4 transition-all shadow-sm
                    ${n.read ? 'border-border/40 opacity-70 hover:opacity-100 hover:border-border/60' : 'border-primary/30 ring-1 ring-primary/10 hover:shadow-md cursor-pointer'}
                  `}
                >
                  {!n.read && <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1/2 bg-primary rounded-r-full" />}
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${colorClass}`}>
                    {typeIcons[n.type] || '📌'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-base truncate ${n.read ? 'font-bold text-foreground' : 'font-black text-foreground'}`}>
                        {n.title}
                      </h4>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className={`text-sm line-clamp-2 ${n.read ? 'text-muted-foreground' : 'text-foreground/80 font-medium'}`}>
                      {n.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {!n.read && (
                      <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Mark read <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card border border-border/60 rounded-[28px] shadow-sm">
          <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6 shadow-inner">
            <Inbox size={40} className="text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground max-w-sm">No new notifications. Check back later for updates on your goals and achievements.</p>
        </motion.div>
      )}
    </div>
  );
}
