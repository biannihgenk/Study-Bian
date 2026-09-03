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
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 text-white">
      {/* HERO SECTION */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative min-h-[300px] overflow-hidden flex items-center p-8 md:p-12 rounded-[32px] bg-[#0f0f11] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
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
          className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[80px]"
        />

        <div className="relative z-10 max-w-[600px]">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-indigo-300 text-[10px] font-bold tracking-widest uppercase mb-6 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-indigo-400" /> Your learning space
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight text-white"
          >
            Halo, {data.userName}.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-gray-400 text-base md:text-lg mb-8 max-w-[480px] leading-relaxed"
          >
            Pelan-pelan, satu langkah hari ini tetap membawa kamu lebih dekat ke versi terbaikmu.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/study-journey" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm transition-all hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
              Lihat Study Journey <ArrowRight size={17} />
            </Link>
            <Link href="/focus" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-sm backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-1 active:scale-95">
              <Play size={15} className="fill-white/80" /> Mulai fokus
            </Link>
          </motion.div>
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 text-indigo-200">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/5 border-t-indigo-500/50"
            />
            <motion.div 
              animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-white/5 border-b-emerald-500/50"
            />
            <div className="flex flex-col items-center justify-center z-10 text-white bg-white/5 w-20 h-20 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
              <Zap size={24} className="text-amber-400 mb-1 drop-shadow-md" />
              <span className="font-bold text-sm">{data.stats.xp} XP</span>
            </div>
          </div>
        </div>
        
        <div className="absolute right-8 bottom-8 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
          {data.dateString}
        </div>
      </motion.section>

      {/* TABS */}
      <div className="flex gap-2 mt-10 mb-8 border-b border-white/10 relative">
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
              className={`relative flex items-center gap-2 px-5 py-4 text-sm font-bold transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Icon size={16} className={isActive ? 'text-indigo-400' : ''} /> {label}
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
                <Metric variants={itemVariants} icon={<ListChecks />} label="Task selesai" value={`${data.stats.tasksDone}/${data.stats.tasksTotal}`} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                <Metric variants={itemVariants} icon={<BookOpen />} label="Waktu belajar" value={`${Math.floor(data.stats.learningMinutes / 60)}j ${data.stats.learningMinutes % 60}m`} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                <Metric variants={itemVariants} icon={<Flame />} label="Streak" value={`${data.stats.streak} hari`} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
                <Metric variants={itemVariants} icon={<Target />} label="Level" value={`${data.stats.level}`} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <JourneyCard variants={itemVariants} href="/study-journey/tasks" icon={<ListChecks />} title="Tasks" detail={`${visibleTasks.length} hal yang menunggu`} color="text-emerald-400" bg="bg-emerald-500/10" border="group-hover:border-emerald-500/30">
                  <div className="mt-5 space-y-2">
                    <AnimatePresence>
                      {visibleTasks.slice(0, 3).map((task) => <TaskRow key={task.id} task={task} onComplete={finishTask} />)}
                    </AnimatePresence>
                    {visibleTasks.length === 0 && <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 py-3 text-center border border-dashed border-white/10 rounded-xl mt-2">Semua tugas selesai! 🎉</p>}
                  </div>
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/goals" icon={<Goal />} title="Goals" detail={`${data.goals.length} tujuan sedang tumbuh`} color="text-amber-400" bg="bg-amber-500/10" border="group-hover:border-amber-500/30">
                  <ProgressList items={data.goals.slice(0, 2)} empty="Belum ada goal aktif" color="bg-amber-500" />
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/competitions" icon={<Trophy />} title="Competitions" detail="Tantangan yang sedang kamu kejar" color="text-rose-400" bg="bg-rose-500/10" border="group-hover:border-rose-500/30">
                  <ProgressList items={data.competitions.slice(0, 2)} empty="Belum ada kompetisi aktif" color="bg-rose-500" />
                </JourneyCard>
                <JourneyCard variants={itemVariants} href="/study-journey/projects" icon={<FolderKanban />} title="Projects" detail={`${data.projects.length} project dalam perjalanan`} color="text-blue-400" bg="bg-blue-500/10" border="group-hover:border-blue-500/30">
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

      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-white/10 text-sm text-gray-500">
        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Tidak harus sempurna, yang penting terus bergerak.</span>
        <Link href="/study-journey" className="flex items-center gap-1.5 font-bold text-indigo-400 hover:text-white transition-colors">Buka workspace <ChevronRight size={15} /></Link>
      </footer>
    </div>
  );
}

// Subcomponents

const Metric = motion.create(({ icon, label, value, color, bg, border }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string; border: string }) => {
  return (
    <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[24px] shadow-sm hover:bg-white/[0.07] transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} border ${border} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 truncate">{label}</div>
        <div className="text-xl sm:text-2xl font-black text-white truncate">{value}</div>
      </div>
    </div>
  );
});

const JourneyCard = motion.create(({ href, icon, title, detail, color, bg, border, children }: { href: string; icon: React.ReactNode; title: string; detail: string; color: string; bg: string; border: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="block group">
      <div className={`h-full p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${border} relative overflow-hidden`}>
        {/* Subtle background glow on hover */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${bg} blur-[50px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none`} />
        
        <div className="flex items-start justify-between relative z-10 mb-2">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${bg} ${color} border border-white/5`}>
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-white transition-colors">{title}</h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{detail}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white/10 group-hover:text-white transition-all">
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
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
      case 'urgent': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      case 'high': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'medium': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="flex items-center gap-4 py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] group transition-all"
    >
      <button 
        onClick={(e) => { e.preventDefault(); onComplete(task.id); }} 
        className="text-gray-500 hover:text-emerald-400 transition-colors shrink-0"
        aria-label={`Selesaikan ${task.title}`}
      >
        <Circle size={18} />
      </button>
      <span className="text-sm font-medium truncate flex-1 text-gray-300 group-hover:text-white transition-colors">{task.title}</span>
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} shrink-0`} title={`Priority: ${task.priority}`} />
    </motion.div>
  );
}

function ProgressList({ items, empty, color = "bg-indigo-500" }: { items: Array<{ id: number; title: string; progress: number }>; empty: string; color?: string }) {
  if (!items.length) return <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 py-6 text-center border border-dashed border-white/10 rounded-xl mt-4 bg-white/[0.02]">{empty}</p>;
  return (
    <div className="mt-6 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="space-y-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl">
          <div className="flex justify-between items-center text-xs px-1">
            <span className="font-bold text-gray-300 truncate pr-4">{item.title}</span>
            <span className="font-black text-white">{item.progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 overflow-hidden rounded-full relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite] z-10" />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${color} rounded-full relative z-0`}
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
      <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Focus map</span>
            <h2 className="text-2xl font-bold text-white">Ritme hari ini</h2>
          </div>
          <Link href="/study-journey/calendar" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white flex items-center gap-1.5 hover:bg-white/10 p-2 rounded-lg transition-colors">Atur jadwal <ArrowRight size={14} /></Link>
        </div>
        
        <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-[7px] before:w-0.5 before:bg-white/10">
          {data.schedule.length ? data.schedule.map((item) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-5 relative z-10 group" key={item.id}>
              <div className="w-4 h-4 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_10px_currentColor] ring-4 ring-[#0f0f11]" style={{ background: item.color, color: item.color }} />
              <div className="flex-1 flex justify-between items-center bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] p-4 rounded-2xl transition-colors">
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                    <CalendarDays size={12} className="text-indigo-400/70" /> {item.time}
                  </div>
                </div>
                {item.completed && <CheckCircle2 size={20} className="text-emerald-400" />}
              </div>
            </motion.div>
          )) : <p className="text-xs text-gray-500 italic pl-8 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">Belum ada jadwal hari ini.</p>}
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Next moves</span>
            <h2 className="text-2xl font-bold text-white">Task berikutnya</h2>
          </div>
          <Link href="/study-journey/tasks" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white flex items-center gap-1.5 hover:bg-white/10 p-2 rounded-lg transition-colors">Semua <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.length ? tasks.slice(0, 6).map((task) => <TaskRow key={task.id} task={task} onComplete={onComplete} />) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-gray-500 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl mt-4">
                <CheckCircle2 size={40} className="text-emerald-500/50 mb-3" />
                <p className="text-sm font-bold text-white">Semua task beres.</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Ambil napas dulu.</p>
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
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-8 sm:p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          {/* SVG Circular Progress */}
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-white/10" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="45" fill="none" 
              className="stroke-indigo-500" strokeWidth="8" strokeLinecap="round"
              initial={{ strokeDasharray: '0 300' }}
              animate={{ strokeDasharray: `${completion * 2.83} 300` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white">{completion}%</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">Minggu Ini</span>
          </div>
        </div>
        <div className="text-center sm:text-left relative z-10 mt-2">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Small wins matter</span>
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">Kamu sudah menyelesaikan <span className="text-indigo-400">{data.stats.tasksDone}</span> task.</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">Progress tidak selalu terasa besar saat dijalani, tapi setiap centang tetap berarti. Keep it up!</p>
        </div>
      </div>
      
      <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <TrendingUp size={16} className="text-indigo-400" />
          </div>
          Progress Breakdown
        </h3>
        <ProgressList items={[...data.goals, ...data.projects].slice(0, 4)} empty="Mulai satu goal untuk melihat progress." color="bg-indigo-500" />
      </div>
    </div>
  );
}

function GallerySection({ items, uploading, message, onUpload, onDelete }: { items: HomeData['gallery']; uploading: boolean; message: string; onUpload: (formData: FormData) => void; onDelete: (id: number) => void }) {
  return (
    <section className="mt-12 p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2"><Camera size={14} /> Visual reminders</span>
          <h2 className="text-2xl font-bold mb-2 text-white">Galeri penyemangat</h2>
          <p className="text-sm text-gray-400 leading-relaxed">Simpan momen, kutipan, atau foto yang bikin kamu ingin terus melangkah dan tidak menyerah.</p>
        </div>
        <form action={onUpload} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
          <label className="relative overflow-hidden cursor-pointer flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors">
            <Camera size={16} className="text-gray-400" /> <span>Pilih Foto</span>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <input name="caption" placeholder="Caption singkat..." maxLength={120} className="px-5 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all sm:w-[220px] placeholder-gray-500" />
          <button type="submit" disabled={uploading} className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
            {uploading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
      
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 text-center">
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
                  className="group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-white/5 shadow-sm border border-white/10" 
                  key={item.id}
                >
                  <Image src={item.path} alt={item.caption || 'Foto penyemangat'} fill sizes="(max-width: 800px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                  <button 
                    type="button" 
                    onClick={() => onDelete(item.id)} 
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all hover:scale-110 shadow-sm border border-white/10" 
                    aria-label="Hapus foto"
                  >
                    <Trash2 size={14} />
                  </button>
                  {item.caption && (
                    <figcaption className="absolute bottom-4 left-4 right-4 text-white text-xs font-bold truncate text-shadow-sm tracking-wide">
                      {item.caption}
                    </figcaption>
                  )}
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-white/10 rounded-[32px] text-gray-500 bg-white/[0.02]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-amber-400" />
            </div>
            <p className="font-bold text-center text-white mb-1">Belum ada visual penyemangat.</p>
            <p className="text-[10px] text-center uppercase tracking-widest font-bold">Tambahkan foto, kutipan, atau pemandangan.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
