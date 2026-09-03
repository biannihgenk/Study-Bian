'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { completeTask } from '@/actions/tasks';
import { addGalleryImage, deleteGalleryImage } from '@/actions/gallery';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Flame,
  FolderKanban,
  Goal,
  LayoutGrid,
  ListChecks,
  Play,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Camera,
  Trash2
} from 'lucide-react';

interface HomeData {
  userName: string;
  dateString: string;
  stats: { tasksDone: number; tasksTotal: number; learningMinutes: number; streak: number; xp: number; level: number };
  tasks: Array<{ id: number; title: string; priority: string; status: string }>;
  schedule: Array<{ id: number; title: string; time: string; color: string; completed: boolean }>;
  goals: Array<{ id: number; title: string; progress: number }>;
  competitions: Array<{ id: number; title: string; progress: number }>;
  projects: Array<{ id: number; title: string; progress: number }>;
  gallery: Array<{ id: number; path: string; caption: string }>;
}

type View = 'overview' | 'today' | 'progress';

const MotionLink = motion.create(Link);

export default function HomeClient({ data }: { data: HomeData }) {
  const [view, setView] = useState<View>('overview');
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [removedGalleryItems, setRemovedGalleryItems] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState('');
  
  const completion = data.stats.tasksTotal ? Math.round((data.stats.tasksDone / data.stats.tasksTotal) * 100) : 0;
  
  const visibleTasks = useMemo(() => {
    return data.tasks.filter((task) => !completedTasks.includes(task.id));
  }, [data.tasks, completedTasks]);

  const galleryItems = useMemo(() => {
    return data.gallery.filter((item) => !removedGalleryItems.includes(item.id));
  }, [data.gallery, removedGalleryItems]);

  async function finishTask(id: number) {
    setCompletedTasks((current) => [...current, id]);
    await completeTask(id);
  }

  async function uploadPhoto(formData: FormData) {
    setUploading(true);
    setGalleryMessage('');
    const result = await addGalleryImage(formData);
    setUploading(false);
    if (result.error) {
      setGalleryMessage(result.error);
      return;
    }
    setGalleryMessage('Foto tersimpan.');
  }

  async function removePhoto(id: number) {
    setRemovedGalleryItems((items) => [...items, id]);
    await deleteGalleryImage(id);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-[1180px] mx-auto text-foreground">
      {/* HERO SECTION */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative min-h-[300px] overflow-hidden flex items-center p-8 md:p-12 rounded-[28px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-2xl border border-white/10"
      >
        {/* Animated glowing orbs in background */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[80px]"
        />

        <div className="relative z-10 max-w-[600px]">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-indigo-400" /> Your learning space
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
          >
            Halo, {data.userName}.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-indigo-100/80 text-base md:text-lg mb-8 max-w-[480px] leading-relaxed"
          >
            Pelan-pelan, satu langkah hari ini tetap membawa kamu lebih dekat ke versi terbaikmu.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/study-journey" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-sm transition-transform hover:scale-105 hover:shadow-lg shadow-white/20">
              Lihat Study Journey <ArrowRight size={17} />
            </Link>
            <Link href="/focus" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105">
              <Play size={15} className="fill-white/80" /> Mulai fokus
            </Link>
          </motion.div>
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 text-indigo-200">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-indigo-400/30 border-t-indigo-400"
            />
            <motion.div 
              animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-emerald-400/30 border-b-emerald-400"
            />
            <div className="flex flex-col items-center justify-center z-10 text-white bg-indigo-950/50 w-20 h-20 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <Zap size={24} className="text-amber-400 mb-1 drop-shadow-md" />
              <span className="font-bold text-sm">{data.stats.xp} XP</span>
            </div>
          </div>
        </div>
        
        <div className="absolute right-6 bottom-6 text-indigo-200/50 text-xs font-medium">
          {data.dateString}
        </div>
      </motion.section>

      {/* TABS */}
      <div className="flex gap-2 mt-8 mb-6 border-b border-border/60 relative">
        {([
          ['overview', 'Ringkasan', LayoutGrid],
          ['today', 'Hari ini', CalendarDays],
          ['progress', 'Progress', TrendingUp],
        ] as const).map(([key, label, Icon]) => {
          const isActive = view === key;
          return (
            <button 
              key={key} 
              onClick={() => setView(key)} 
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon size={16} className={isActive ? 'text-primary' : ''} /> {label}
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'overview' && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric variants={itemVariants} icon={<ListChecks />} label="Task selesai" value={`${data.stats.tasksDone}/${data.stats.tasksTotal}`} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-500/20" />
                <Metric variants={itemVariants} icon={<BookOpen />} label="Waktu belajar" value={`${Math.floor(data.stats.learningMinutes / 60)}j ${data.stats.learningMinutes % 60}m`} color="text-amber-600 dark:text-amber-400" bg="bg-amber-100 dark:bg-amber-500/20" />
                <Metric variants={itemVariants} icon={<Flame />} label="Streak" value={`${data.stats.streak} hari`} color="text-rose-600 dark:text-rose-400" bg="bg-rose-100 dark:bg-rose-500/20" />
                <Metric variants={itemVariants} icon={<Target />} label="Level" value={`${data.stats.level}`} color="text-blue-600 dark:text-blue-400" bg="bg-blue-100 dark:bg-blue-500/20" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <JourneyCard variants={itemVariants} href="/study-journey/tasks" icon={<ListChecks />} title="Tasks" detail={`${visibleTasks.length} hal yang menunggu`} color="text-emerald-500" bg="bg-emerald-500/10">
                  <div className="mt-4 space-y-2">
                    <AnimatePresence>
                      {visibleTasks.slice(0, 3).map((task) => <TaskRow key={task.id} task={task} onComplete={finishTask} />)}
                    </AnimatePresence>
                    {visibleTasks.length === 0 && <p className="text-xs text-muted-foreground py-2">Semua tugas selesai! 🎉</p>}
                  </div>
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/goals" icon={<Goal />} title="Goals" detail={`${data.goals.length} tujuan sedang tumbuh`} color="text-amber-500" bg="bg-amber-500/10">
                  <ProgressList items={data.goals.slice(0, 2)} empty="Belum ada goal aktif" color="bg-amber-500" />
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/competitions" icon={<Trophy />} title="Competitions" detail="Tantangan yang sedang kamu kejar" color="text-rose-500" bg="bg-rose-500/10">
                  <ProgressList items={data.competitions.slice(0, 2)} empty="Belum ada kompetisi aktif" color="bg-rose-500" />
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/projects" icon={<FolderKanban />} title="Projects" detail={`${data.projects.length} project dalam perjalanan`} color="text-blue-500" bg="bg-blue-500/10">
                  <ProgressList items={data.projects.slice(0, 2)} empty="Belum ada project aktif" color="bg-blue-500" />
                </JourneyCard>
              </div>
            </motion.div>
          )}

          {view === 'today' && <TodayView data={data} tasks={visibleTasks} onComplete={finishTask} />}
          {view === 'progress' && <ProgressView data={data} completion={completion} />}
        </motion.div>
      </AnimatePresence>

      <GallerySection items={galleryItems} uploading={uploading} message={galleryMessage} onUpload={uploadPhoto} onDelete={removePhoto} />

      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-border/50 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Tidak harus sempurna, yang penting terus bergerak.</span>
        <Link href="/study-journey" className="flex items-center gap-1 font-semibold text-primary hover:underline underline-offset-4">Buka workspace <ChevronRight size={15} /></Link>
      </footer>
    </div>
  );
}

// Subcomponents

const Metric = motion.create(({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-0.5">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
});

const JourneyCard = motion.create(({ href, icon, title, detail, color, bg, children }: { href: string; icon: React.ReactNode; title: string; detail: string; color: string; bg: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="block group">
      <div className="h-full p-5 bg-card border border-border/60 rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 relative overflow-hidden">
        {/* Subtle background glow on hover */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${bg} ${color}`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold group-hover:text-primary transition-colors">{title}</h2>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </Link>
  );
});

function TaskRow({ task, onComplete }: { task: HomeData['tasks'][number]; onComplete: (id: number) => void }) {
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
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 py-2 px-1 group"
    >
      <button 
        onClick={(e) => { e.preventDefault(); onComplete(task.id); }} 
        className="text-muted-foreground hover:text-emerald-500 transition-colors"
        aria-label={`Selesaikan ${task.title}`}
      >
        <Circle size={18} />
      </button>
      <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">{task.title}</span>
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} shadow-sm`} title={`Priority: ${task.priority}`} />
    </motion.div>
  );
}

function ProgressList({ items, empty, color = "bg-primary" }: { items: Array<{ id: number; title: string; progress: number }>; empty: string; color?: string }) {
  if (!items.length) return <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg mt-4">{empty}</p>;
  return (
    <div className="mt-5 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium truncate pr-4">{item.title}</span>
            <span className="font-bold">{item.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${color} rounded-full`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TodayView({ data, tasks, onComplete }: { data: HomeData; tasks: HomeData['tasks']; onComplete: (id: number) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-6 bg-card border border-border/60 rounded-[20px] shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Focus map</span>
            <h2 className="text-xl font-bold mt-1">Ritme kamu hari ini</h2>
          </div>
          <Link href="/study-journey/calendar" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">Atur jadwal <ArrowRight size={14} /></Link>
        </div>
        
        <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[5px] before:w-0.5 before:bg-border/60">
          {data.schedule.length ? data.schedule.map((item) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 relative z-10" key={item.id}>
              <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0 shadow-sm ring-4 ring-card" style={{ background: item.color }} />
              <div className="flex-1 flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                <div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <CalendarDays size={12} /> {item.time}
                  </div>
                </div>
                {item.completed && <CheckCircle2 size={18} className="text-emerald-500" />}
              </div>
            </motion.div>
          )) : <p className="text-sm text-muted-foreground italic pl-6">Belum ada jadwal hari ini.</p>}
        </div>
      </div>

      <div className="p-6 bg-card border border-border/60 rounded-[20px] shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Next moves</span>
            <h2 className="text-xl font-bold mt-1">Task berikutnya</h2>
          </div>
          <Link href="/study-journey/tasks" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">Semua <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-1">
          <AnimatePresence>
            {tasks.length ? tasks.slice(0, 6).map((task) => <TaskRow key={task.id} task={task} onComplete={onComplete} />) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 size={40} className="text-emerald-500/50 mb-3" />
                <p className="text-sm font-medium">Semua task beres.</p>
                <p className="text-xs">Ambil napas dulu.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProgressView({ data, completion }: { data: HomeData; completion: number }) {
  return (
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-8 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-card border border-indigo-100 dark:border-indigo-900/50 rounded-[20px] shadow-sm">
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          {/* SVG Circular Progress */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" 
              className="stroke-primary" strokeWidth="8" strokeLinecap="round"
              initial={{ strokeDasharray: '0 300' }}
              animate={{ strokeDasharray: `${completion * 2.83} 300` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold">{completion}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Minggu Ini</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Small wins matter</span>
          <h2 className="text-2xl font-bold mb-3">Kamu sudah menyelesaikan {data.stats.tasksDone} task.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Progress tidak selalu terasa besar saat dijalani, tapi setiap centang tetap berarti. Keep it up!</p>
        </div>
      </div>
      
      <div className="p-6 bg-card border border-border/60 rounded-[20px] shadow-sm">
        <h3 className="font-bold mb-4">Progress Breakdown</h3>
        <ProgressList items={[...data.goals, ...data.projects].slice(0, 4)} empty="Mulai satu goal untuk melihat progress." />
      </div>
    </div>
  );
}

function GallerySection({ items, uploading, message, onUpload, onDelete }: { items: HomeData['gallery']; uploading: boolean; message: string; onUpload: (formData: FormData) => void; onDelete: (id: number) => void }) {
  return (
    <section className="mt-10 p-6 sm:p-8 bg-card border border-border/60 rounded-[24px] shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2"><Camera size={14} /> Visual reminders</span>
          <h2 className="text-2xl font-bold mb-2">Galeri penyemangat</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Simpan momen, kutipan, atau foto yang bikin kamu ingin terus melangkah dan tidak menyerah.</p>
        </div>
        <form action={onUpload} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <label className="relative overflow-hidden cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-sm font-semibold transition-colors">
            <Camera size={16} /> <span>Pilih Foto</span>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <input name="caption" placeholder="Caption singkat (opsional)..." maxLength={120} className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all sm:w-[200px]" />
          <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
      
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 text-center">
          {message}
        </motion.div>
      )}

      <AnimatePresence>
        {items.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.figure 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-sm border border-border/50" 
                  key={item.id}
                >
                  <Image src={item.path} alt={item.caption || 'Foto penyemangat'} fill sizes="(max-width: 800px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <button 
                    type="button" 
                    onClick={() => onDelete(item.id)} 
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all hover:scale-110 shadow-sm" 
                    aria-label="Hapus foto"
                  >
                    <Trash2 size={14} />
                  </button>
                  {item.caption && (
                    <figcaption className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium truncate text-shadow-sm">
                      {item.caption}
                    </figcaption>
                  )}
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground bg-muted/10">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-amber-500/70" />
            </div>
            <p className="font-medium text-center">Belum ada visual penyemangat.</p>
            <p className="text-sm text-center mt-1 max-w-xs">Tambahkan foto, kutipan, atau pemandangan yang bisa mengembalikan semangat belajarmu.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


