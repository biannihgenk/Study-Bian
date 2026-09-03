'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { completeTask } from '@/actions/tasks';
import { completeScheduleEvent } from '@/actions/schedule';
import {
  CheckCircle2, Circle, Clock, Flame, Target, BookOpen,
  ChevronRight, Sparkles, Calendar, TrendingUp, Zap, Timer,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  greeting: string;
  userName: string;
  dateString: string;
  todayTasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
    deadline: string | null;
  }>;
  todaySchedule: Array<{
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    category: string;
    color: string;
    completed: boolean;
  }>;
  weeklyStats: {
    learningTime: string;
    tasksCompleted: number;
    totalTasks: number;
    goalProgress: number;
    currentStreak: number;
  };
  learningDistribution: Array<{ name: string; color: string; percentage: number }>;
  upcoming: Array<{
    id: number;
    title: string;
    type: string;
    icon: string;
    daysLeft: number;
    progress: number;
  }>;
  recommendation: {
    title: string;
    reason: string;
    type: string;
    estimatedTime: number;
  } | null;
  xp: {
    total: number;
    level: number;
    title: string;
    progress: { current: number; required: number; percentage: number };
  };
  todayFocus: {
    title: string;
    description: string;
    estimatedMinutes: number;
  } | null;
  overdueTasks: number;
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <motion.header variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-foreground">
          {data.greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">{data.userName}</span> 👋
        </h1>
        <p className="text-muted-foreground font-medium text-sm">
          Let&apos;s make today count. <span className="opacity-70 ml-2 font-normal">{data.dateString}</span>
        </p>
      </motion.header>

      {/* Alert: Overdue Tasks */}
      <AnimatePresence>
        {data.overdueTasks > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-rose-500" />
              </div>
              <span className="text-rose-600 dark:text-rose-400">You have <strong className="font-bold">{data.overdueTasks}</strong> overdue task{data.overdueTasks > 1 ? 's' : ''}.</span>
              <Link href="/study-journey/tasks" className="ml-auto text-rose-500 font-bold text-xs hover:underline underline-offset-2 shrink-0">
                View tasks →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Row: Today's Focus + Recommendation */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Today's Focus */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Target size={16} className="text-primary" /></div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Focus</h2>
          </div>
          
          {data.todayFocus ? (
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">{data.todayFocus.title}</h3>
              {data.todayFocus.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {data.todayFocus.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-6">
                <Clock size={14} className="text-amber-500" />
                <span>{data.todayFocus.estimatedMinutes} minutes</span>
              </div>
              <Link href="/focus" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <Timer size={16} /> Start Focus
              </Link>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm relative z-10 flex flex-col justify-center h-[120px]">
              <p className="font-medium mb-1 text-foreground">No focus set for today.</p>
              <p className="text-xs">Your most important tasks will appear here.</p>
            </div>
          )}
        </motion.div>

        {/* Smart Recommendation */}
        {data.recommendation && (
          <motion.div variants={itemVariants} className="bg-card border-2 border-amber-500/20 rounded-[24px] p-6 shadow-sm relative overflow-hidden group bg-gradient-to-br from-card to-amber-500/5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-amber-500/10 rounded-lg"><Sparkles size={16} className="text-amber-500" /></div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recommended for you</h2>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 text-foreground">{data.recommendation.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {data.recommendation.reason}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium bg-background/50 w-fit px-3 py-1.5 rounded-lg border border-border/50">
                <Clock size={14} className="text-primary" />
                <span>Estimated: {data.recommendation.estimatedTime} min</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Weekly Progress Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<BookOpen size={18} />} label="Learning" value={data.weeklyStats.learningTime} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Tasks" value={`${data.weeklyStats.tasksCompleted} / ${data.weeklyStats.totalTasks}`} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={<Target size={18} />} label="Goals" value={`${data.weeklyStats.goalProgress}%`} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={<Flame size={18} />} label="Streak" value={`${data.weeklyStats.currentStreak} day${data.weeklyStats.currentStreak !== 1 ? 's' : ''}`} color="text-rose-500" bg="bg-rose-500/10" />
      </motion.div>

      {/* XP Bar */}
      <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-5 mb-6 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Zap size={18} className="text-amber-500" /></div>
            <span className="font-bold text-lg">Level {data.xp.level}</span>
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground rounded-full shadow-sm">{data.xp.title}</span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            <span className="text-foreground">{data.xp.progress.current}</span> / {data.xp.progress.required} XP
          </span>
        </div>
        <div className="h-2.5 w-full bg-muted overflow-hidden rounded-full relative z-10 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.xp.progress.percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Schedule + Tasks */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg"><Calendar size={16} className="text-blue-500" /></div>
                <h2 className="font-bold text-base">Today&apos;s Schedule</h2>
              </div>
              <Link href="/study-journey/calendar" className="text-xs font-bold text-primary hover:underline underline-offset-2">View all</Link>
            </div>
            
            {data.todaySchedule.length > 0 ? (
              <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-border/50">
                {data.todaySchedule.map((event) => (
                  <ScheduleItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <Calendar size={32} className="text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No events scheduled.</p>
              </div>
            )}
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg"><CheckCircle2 size={16} className="text-emerald-500" /></div>
                <h2 className="font-bold text-base">Tasks</h2>
              </div>
              <Link href="/study-journey/tasks" className="text-xs font-bold text-primary hover:underline underline-offset-2">View all</Link>
            </div>
            
            {data.todayTasks.length > 0 ? (
              <div className="space-y-1">
                {data.todayTasks.filter(t => t.status !== 'Completed').slice(0, 6).map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {data.todayTasks.filter(t => t.status !== 'Completed').length === 0 && (
                   <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                     <CheckCircle2 size={40} className="text-emerald-500/50 mb-3" />
                     <p className="text-sm font-medium">No pending tasks.</p>
                     <p className="text-xs">Great job! 🎉</p>
                   </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <CheckCircle2 size={32} className="text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No pending tasks. Great job! 🎉</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Distribution + Upcoming */}
        <div className="space-y-6">
          {/* Learning Distribution */}
          <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-purple-500/10 rounded-lg"><TrendingUp size={16} className="text-purple-500" /></div>
              <h2 className="font-bold text-base">Learning Distribution</h2>
            </div>
            
            {data.learningDistribution.length > 0 ? (
              <div className="space-y-5">
                {data.learningDistribution.map((item) => (
                  <div key={item.name} className="group">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground font-bold">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full group-hover:opacity-80 transition-opacity" style={{ background: item.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <TrendingUp size={32} className="text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">Start learning to see insights.</p>
              </div>
            )}
          </motion.div>

          {/* Upcoming */}
          <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-amber-500/10 rounded-lg"><Clock size={16} className="text-amber-500" /></div>
              <h2 className="font-bold text-base">Upcoming</h2>
            </div>
            
            {data.upcoming.length > 0 ? (
              <div className="space-y-3">
                {data.upcoming.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group cursor-default">
                    <div className="text-2xl bg-background w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-border/50 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.daysLeft <= 1 ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'}`}>
                          {item.daysLeft === 0 ? 'Today' : item.daysLeft === 1 ? 'Tomorrow' : `${item.daysLeft} days`}
                        </span>
                        {item.progress > 0 && <span className="text-primary">• {item.progress}%</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <Clock size={32} className="text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No upcoming deadlines.</p>
                <p className="text-xs">You&apos;re all caught up!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

const StatCard = motion.create(({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) => {
  return (
    <div className="bg-card border border-border/60 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[100px]">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-extrabold truncate">{value}</div>
    </div>
  );
});

function TaskItem({ task }: { task: { id: number; title: string; status: string; priority: string; category: string } }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await completeTask(task.id);
    setLoading(false);
  }

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <motion.div 
      layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border/50"
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div className="shrink-0 text-muted-foreground group-hover:text-emerald-500 transition-colors">
        {task.status === 'Completed' ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} className={loading ? "opacity-50" : ""} />
        )}
      </div>
      <span className={`text-sm font-medium flex-1 truncate transition-colors ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'group-hover:text-primary'}`}>
        {task.title}
      </span>
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} shadow-sm shrink-0`} title={`Priority: ${task.priority}`} />
    </motion.div>
  );
}

function ScheduleItem({ event }: { event: { id: number; title: string; startTime: string; endTime: string; color: string; completed: boolean } }) {
  const [loading, setLoading] = useState(false);
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} – ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

  async function handleToggle() {
    setLoading(true);
    await completeScheduleEvent(event.id);
    setLoading(false);
  }

  return (
    <motion.div
      layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-4 relative z-10 group cursor-pointer p-2 rounded-xl transition-all ${event.completed ? 'opacity-60' : 'hover:bg-muted/50 border border-transparent hover:border-border/50'}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-4 ring-card shadow-sm transition-transform group-hover:scale-125" style={{ background: event.color }} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold truncate transition-colors ${event.completed ? 'line-through' : 'group-hover:text-primary'}`}>
          {event.title}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{timeStr}</div>
      </div>
      {loading && <span className="text-xs text-muted-foreground animate-pulse">...</span>}
    </motion.div>
  );
}
