'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { completeTask } from '@/actions/tasks';
import { completeScheduleEvent } from '@/actions/schedule';
import {
  CheckCircle2, Circle, Clock, Flame, Target, BookOpen,
  ChevronRight, Sparkles, Calendar, TrendingUp, Zap, Timer,
  AlertTriangle, ArrowRight, Play, Rocket, Star, Award,
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
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } }
  };

  const taskCompletion = data.weeklyStats.totalTasks > 0
    ? Math.round((data.weeklyStats.tasksCompleted / data.weeklyStats.totalTasks) * 100)
    : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1280px] mx-auto pb-16">

      {/* ═══════════════════════════════════════════
          HERO SECTION — Big, immersive greeting
          ═══════════════════════════════════════════ */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] mb-8"
      >
        <div className="relative min-h-[280px] md:min-h-[320px] flex items-center p-8 md:p-12 lg:p-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white">
          {/* Animated ambient orbs */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[30%] -right-[15%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute top-[20%] left-[40%] w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[80px]"
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />

          <div className="relative z-10 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-[0.15em] uppercase mb-5 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.1] backdrop-blur-md"
            >
              <Sparkles size={14} className="text-indigo-400" /> Your Command Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight mb-4 leading-[1.1]"
            >
              {data.greeting},{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-violet-300">
                {data.userName}
              </span>
              <span className="ml-2">👋</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-indigo-100/70 text-base md:text-lg max-w-[520px] leading-relaxed mb-8"
            >
              Hari ini adalah kanvas baru. Langkah kecil hari ini, cerita besar di masa depan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/focus"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-indigo-950 font-bold text-sm transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:scale-[0.98] shadow-lg"
              >
                <Play size={16} className="fill-indigo-950" /> Mulai Fokus
              </Link>
              <Link
                href="/study-journey"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/[0.08] border border-white/[0.15] text-white font-semibold text-sm backdrop-blur-md transition-all hover:bg-white/[0.15] hover:scale-[1.03] active:scale-[0.98]"
              >
                Study Journey <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* XP Ring — Desktop only */}
          <div className="absolute right-10 lg:right-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-indigo-400/20 border-t-indigo-400"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2.5 rounded-full border-2 border-violet-400/20 border-b-violet-400"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-5 rounded-full border border-emerald-400/20 border-l-emerald-400"
              />
              <div className="flex flex-col items-center justify-center z-10 text-white bg-white/[0.06] w-20 h-20 rounded-full backdrop-blur-xl border border-white/[0.1] shadow-2xl">
                <Zap size={22} className="text-amber-400 mb-0.5 drop-shadow-lg" />
                <span className="font-extrabold text-sm">{data.xp.total} XP</span>
              </div>
            </div>
            <span className="text-xs text-indigo-300/60 font-semibold tracking-wider uppercase">Level {data.xp.level}</span>
          </div>

          {/* Date badge */}
          <div className="absolute right-6 bottom-6 text-indigo-200/40 text-xs font-medium tracking-wide">
            {data.dateString}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          OVERDUE ALERT
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {data.overdueTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-rose-500/[0.08] border border-rose-500/20 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {data.overdueTasks} task{data.overdueTasks > 1 ? 's' : ''} overdue
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Segera selesaikan agar tidak menumpuk.
                </p>
              </div>
              <Link href="/study-journey/tasks" className="shrink-0 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl transition-colors">
                Lihat Tasks →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          WEEKLY STAT CARDS — Big & bold
          ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <StatCard
          icon={<BookOpen size={22} />}
          label="Waktu Belajar"
          value={data.weeklyStats.learningTime}
          subtitle="Minggu ini"
          gradient="from-indigo-500 to-violet-500"
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Tasks Selesai"
          value={`${data.weeklyStats.tasksCompleted}/${data.weeklyStats.totalTasks}`}
          subtitle={`${taskCompletion}% selesai`}
          gradient="from-emerald-500 to-teal-500"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={<Target size={22} />}
          label="Goal Progress"
          value={`${data.weeklyStats.goalProgress}%`}
          subtitle="Rata-rata progress"
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          icon={<Flame size={22} />}
          label="Streak"
          value={`${data.weeklyStats.currentStreak}`}
          subtitle={data.weeklyStats.currentStreak === 1 ? 'hari' : 'hari berturut'}
          gradient="from-rose-500 to-orange-500"
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
        />
      </motion.div>

      {/* ═══════════════════════════════════════════
          XP PROGRESS BAR — Glassmorphic & big
          ═══════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[28px] p-6 md:p-8 mb-8 shadow-sm overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />

        {/* Hover glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/15 to-orange-500/15 rounded-2xl border border-amber-500/10">
              <Zap size={24} className="text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <span className="font-extrabold text-xl">Level {data.xp.level}</span>
                <span className="px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase bg-gradient-to-r from-primary to-violet-500 text-white rounded-full shadow-sm">
                  {data.xp.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {data.xp.progress.required - data.xp.progress.current} XP lagi menuju level berikutnya
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl">
            <span className="text-foreground">{data.xp.progress.current}</span>
            <span className="mx-1">/</span>
            <span>{data.xp.progress.required} XP</span>
          </span>
        </div>

        <div className="h-4 w-full bg-muted/80 overflow-hidden rounded-full relative z-10 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.xp.progress.percentage}%` }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary via-violet-500 to-indigo-400 rounded-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:1.2rem_1.2rem] animate-[shimmer_1s_linear_infinite]" />
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          FOCUS + RECOMMENDATION — Two column hero cards
          ═══════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-8">
        {/* Today's Focus */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/[0.05] rounded-full blur-3xl group-hover:bg-primary/[0.1] transition-colors duration-700" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Target size={20} className="text-primary" />
            </div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.1em]">Today&apos;s Focus</h2>
          </div>

          {data.todayFocus ? (
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold mb-3 leading-tight">{data.todayFocus.title}</h3>
              {data.todayFocus.description && (
                <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                  {data.todayFocus.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-7 bg-muted/40 w-fit px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-amber-500" />
                <span>{data.todayFocus.estimatedMinutes} menit</span>
              </div>
              <Link
                href="/focus"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-2xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Timer size={18} /> Mulai Fokus
              </Link>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm relative z-10 flex flex-col justify-center min-h-[160px]">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Rocket size={24} className="text-muted-foreground/50" />
              </div>
              <p className="font-bold text-foreground text-lg mb-1">Belum ada fokus hari ini</p>
              <p className="text-sm text-muted-foreground max-w-sm">Tentukan prioritas utamamu untuk memaksimalkan produktivitas hari ini.</p>
            </div>
          )}
        </motion.div>

        {/* Smart Recommendation */}
        <motion.div variants={itemVariants} className="bg-card border-2 border-amber-500/15 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group bg-gradient-to-br from-card via-card to-amber-500/[0.03]">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/[0.08] rounded-full blur-3xl group-hover:bg-amber-500/[0.15] transition-colors duration-700" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.1em]">Rekomendasi</h2>
          </div>

          {data.recommendation ? (
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold mb-3 text-foreground leading-tight">{data.recommendation.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-md">
                {data.recommendation.reason}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold bg-muted/40 px-4 py-2 rounded-xl border border-border/50">
                  <Clock size={14} className="text-primary" />
                  <span>Estimasi: {data.recommendation.estimatedTime} menit</span>
                </div>
                <span className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
                  {data.recommendation.type}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm relative z-10 flex flex-col justify-center min-h-[160px]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Star size={24} className="text-amber-500/50" />
              </div>
              <p className="font-bold text-foreground text-lg mb-1">Kamu On Track! 🎉</p>
              <p className="text-sm text-muted-foreground max-w-sm">Tidak ada rekomendasi mendesak. Tetap konsisten dan terus bergerak.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT — BENTO GRID
          ═══════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-5 gap-5 md:gap-6 mb-8">

        {/* ── Schedule — Takes 3 cols on large ── */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-card border border-border/60 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/[0.04] rounded-full blur-3xl group-hover:bg-blue-500/[0.08] transition-colors duration-700" />

          <div className="flex items-center justify-between mb-7 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Calendar size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg">Jadwal Hari Ini</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {data.todaySchedule.length} kegiatan terjadwal
                </p>
              </div>
            </div>
            <Link href="/study-journey/calendar" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline underline-offset-4 transition-colors">
              Lihat semua <ChevronRight size={14} />
            </Link>
          </div>

          {data.todaySchedule.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-[2px] before:bg-border/40 before:rounded-full z-10">
              {data.todaySchedule.map((event, i) => (
                <ScheduleItem key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Calendar size={36} />} title="Belum ada jadwal" desc="Atur jadwal harianmu di kalender" />
          )}
        </motion.div>

        {/* ── Tasks — Takes 2 cols on large ── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border/60 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/[0.04] rounded-full blur-3xl group-hover:bg-emerald-500/[0.08] transition-colors duration-700" />

          <div className="flex items-center justify-between mb-7 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg">Tasks</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {data.todayTasks.filter(t => t.status !== 'Completed').length} menunggu
                </p>
              </div>
            </div>
            <Link href="/study-journey/tasks" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline underline-offset-4 transition-colors">
              Semua <ChevronRight size={14} />
            </Link>
          </div>

          {data.todayTasks.filter(t => t.status !== 'Completed').length > 0 ? (
            <div className="space-y-1 relative z-10">
              {data.todayTasks.filter(t => t.status !== 'Completed').slice(0, 7).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<CheckCircle2 size={36} className="text-emerald-500/40" />} title="Semua selesai! 🎉" desc="Kerja bagus, ambil napas dulu" />
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          SECOND ROW — Learning Distribution + Upcoming
          ═══════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-8">
        {/* Learning Distribution */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/[0.04] rounded-full blur-3xl group-hover:bg-purple-500/[0.08] transition-colors duration-700" />

          <div className="flex items-center gap-3 mb-7 relative z-10">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <TrendingUp size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Distribusi Belajar</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Proporsi waktu per subjek minggu ini</p>
            </div>
          </div>

          {data.learningDistribution.length > 0 ? (
            <div className="space-y-5 relative z-10">
              {data.learningDistribution.map((item) => (
                <div key={item.name} className="group/bar">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted-foreground font-bold">{item.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted/60 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full transition-opacity group-hover/bar:opacity-80"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp size={36} />} title="Belum ada data" desc="Mulai sesi belajar untuk melihat distribusi" />
          )}
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[28px] p-7 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/[0.04] rounded-full blur-3xl group-hover:bg-amber-500/[0.08] transition-colors duration-700" />

          <div className="flex items-center gap-3 mb-7 relative z-10">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Clock size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Deadline Mendatang</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Goals, kompetisi, dan project</p>
            </div>
          </div>

          {data.upcoming.length > 0 ? (
            <div className="space-y-3 relative z-10">
              {data.upcoming.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group/item cursor-default">
                  <div className="text-2xl bg-muted/50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-border/40 group-hover/item:scale-110 transition-transform shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate group-hover/item:text-primary transition-colors">{item.title}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.daysLeft <= 1 ? 'bg-rose-500/10 text-rose-500' : item.daysLeft <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                        {item.daysLeft === 0 ? 'Hari ini!' : item.daysLeft === 1 ? 'Besok' : `${item.daysLeft} hari lagi`}
                      </span>
                      {item.progress > 0 && <span className="text-primary font-bold">• {item.progress}%</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover/item:text-foreground transition-all group-hover/item:translate-x-1 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Award size={36} />} title="Bebas deadline!" desc="Kamu sudah up-to-date, mantap!" />
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          MOTIVATIONAL FOOTER
          ═══════════════════════════════════════════ */}
      <motion.footer
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-border/30 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Tidak harus sempurna, yang penting terus bergerak.
        </span>
        <Link href="/study-journey" className="flex items-center gap-1.5 font-bold text-primary hover:underline underline-offset-4 transition-colors">
          Buka Workspace <ChevronRight size={15} />
        </Link>
      </motion.footer>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ icon, label, value, subtitle, gradient, iconBg, iconColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-[24px] p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden group cursor-default">
      {/* Hover gradient glow */}
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.08em] line-clamp-1">
          {label}
        </span>
      </div>

      <div className="relative z-10">
        <div className="text-2xl md:text-3xl font-extrabold truncate leading-none mb-1">{value}</div>
        <div className="text-xs text-muted-foreground font-medium">{subtitle}</div>
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: { id: number; title: string; status: string; priority: string; category: string } }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await completeTask(task.id);
    setLoading(false);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'border-l-rose-500';
      case 'high': return 'border-l-amber-500';
      case 'medium': return 'border-l-blue-500';
      default: return 'border-l-slate-400';
    }
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/40 transition-all group cursor-pointer border border-transparent hover:border-border/50 border-l-[3px] ${getPriorityBorder(task.priority)}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div className="shrink-0 text-muted-foreground group-hover:text-emerald-500 transition-colors">
        {task.status === 'Completed' ? (
          <CheckCircle2 size={20} className="text-emerald-500" />
        ) : (
          <Circle size={20} className={loading ? "opacity-50 animate-pulse" : ""} />
        )}
      </div>
      <span className={`text-sm font-semibold flex-1 truncate transition-colors ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'group-hover:text-primary'}`}>
        {task.title}
      </span>
      <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)} shadow-sm shrink-0`} title={`Priority: ${task.priority}`} />
    </motion.div>
  );
}

function ScheduleItem({ event, index }: { event: { id: number; title: string; startTime: string; endTime: string; color: string; completed: boolean }; index: number }) {
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
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-4 relative z-10 group cursor-pointer p-3.5 rounded-xl transition-all ${event.completed ? 'opacity-50' : 'hover:bg-muted/40 border border-transparent hover:border-border/50'}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div
        className="w-3 h-3 rounded-full mt-1.5 shrink-0 ring-4 ring-card shadow-sm transition-transform group-hover:scale-[1.3]"
        style={{ background: event.color }}
      />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold truncate transition-colors ${event.completed ? 'line-through' : 'group-hover:text-primary'}`}>
          {event.title}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-2">
          <Clock size={12} /> {timeStr}
        </div>
      </div>
      {event.completed && <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
      {loading && <span className="text-xs text-muted-foreground animate-pulse shrink-0">...</span>}
    </motion.div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/60 relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 text-muted-foreground/40">
        {icon}
      </div>
      <p className="text-sm font-bold text-foreground/70">{title}</p>
      <p className="text-xs text-center mt-1 max-w-xs">{desc}</p>
    </div>
  );
}
