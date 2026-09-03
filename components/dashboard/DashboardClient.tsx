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

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   Motion helpers
   ───────────────────────────────────────────── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 22 },
  },
};

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */

export default function DashboardClient({ data }: { data: DashboardData }) {
  const taskCompletion =
    data.weeklyStats.totalTasks > 0
      ? Math.round(
          (data.weeklyStats.tasksCompleted / data.weeklyStats.totalTasks) * 100
        )
      : 0;

  const pendingTasks = data.todayTasks.filter((t) => t.status !== 'Completed');

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a]">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* ════════════════════════════════════════
            HERO — Immersive greeting banner
            ════════════════════════════════════════ */}
        <motion.section variants={rise} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/20 border border-white/[0.06] p-8 md:p-10 lg:p-12">
            {/* Ambient glow orbs */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-blue-500/15 blur-[120px] pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.12, 0.28, 0.12] }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 3,
              }}
              className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"
            />

            {/* Dot grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 0.8px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left — Text */}
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 text-blue-300/80 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm"
                >
                  <Sparkles size={13} /> Your Learning Space
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-3"
                >
                  {data.greeting},{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                    {data.userName}
                  </span>
                  .
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-gray-400 text-sm md:text-base leading-relaxed mb-7 max-w-md"
                >
                  Pelan-pelan, satu langkah hari ini tetap membawa kamu lebih
                  dekat ke versi terbaikmu.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link
                    href="/study-journey"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0a0a0a] font-bold text-sm transition-all duration-300 hover:bg-gray-200 hover:shadow-[0_4px_24px_rgba(255,255,255,0.15)] active:scale-[0.97]"
                  >
                    Lihat Study Journey <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/focus"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.14] active:scale-[0.97]"
                  >
                    <Play size={14} className="fill-white" /> Mulai fokus
                  </Link>
                </motion.div>
              </div>

              {/* Right — XP Orb (desktop) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:flex flex-col items-center gap-3"
              >
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 24,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 rounded-full border border-blue-400/25 border-t-blue-400/70"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 18,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-3 rounded-full border border-indigo-400/20 border-b-indigo-400/60"
                  />
                  <div className="flex flex-col items-center justify-center z-10 w-20 h-20 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/[0.1]">
                    <Zap
                      size={20}
                      className="text-amber-400 mb-0.5 drop-shadow-md"
                    />
                    <span className="text-white font-bold text-sm">
                      {data.xp.total} XP
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-white/30 font-medium tracking-widest uppercase">
                  Level {data.xp.level}
                </span>
              </motion.div>
            </div>

            {/* Date (bottom right) */}
            <div className="absolute right-8 bottom-5 text-white/20 text-xs font-medium hidden sm:block">
              {data.dateString}
            </div>
          </div>
        </motion.section>

        {/* ════════════════════════════════════════
            OVERDUE ALERT
            ════════════════════════════════════════ */}
        <AnimatePresence>
          {data.overdueTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-4 sm:p-5 bg-rose-500/[0.08] border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-rose-400">
                    {data.overdueTasks} task
                    {data.overdueTasks > 1 ? 's' : ''} overdue
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Segera selesaikan agar tidak menumpuk.
                  </p>
                </div>
                <Link
                  href="/study-journey/tasks"
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all duration-300 shrink-0"
                >
                  Lihat Tasks →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════
            STATS ROW — 4 glassmorphic cards
            ════════════════════════════════════════ */}
        <motion.div
          variants={rise}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8"
        >
          <StatCard
            icon={<CheckCircle2 size={20} />}
            iconClass="text-emerald-400"
            label="Task selesai"
            value={`${data.weeklyStats.tasksCompleted}/${data.weeklyStats.totalTasks}`}
            sub={`${taskCompletion}% complete`}
          />
          <StatCard
            icon={<BookOpen size={20} />}
            iconClass="text-blue-400"
            label="Waktu belajar"
            value={data.weeklyStats.learningTime}
            sub="Minggu ini"
          />
          <StatCard
            icon={<Flame size={20} />}
            iconClass="text-orange-400"
            label="Streak"
            value={`${data.weeklyStats.currentStreak} hari`}
            sub="Berturut-turut"
          />
          <StatCard
            icon={<Target size={20} />}
            iconClass="text-violet-400"
            label="Level"
            value={`${data.xp.level}`}
            sub={data.xp.title}
          />
        </motion.div>

        {/* ════════════════════════════════════════
            XP PROGRESS
            ════════════════════════════════════════ */}
        <motion.div
          variants={rise}
          className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 mb-8 group hover:bg-white/[0.07] transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap size={20} className="text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-white font-bold text-lg">
                    Level {data.xp.level}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full">
                    {data.xp.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {data.xp.progress.required - data.xp.progress.current} XP
                  lagi ke level berikutnya
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-400 bg-white/5 px-4 py-1.5 rounded-lg">
              <span className="text-white">
                {data.xp.progress.current}
              </span>{' '}
              / {data.xp.progress.required} XP
            </span>
          </div>

          <div className="h-3 w-full bg-white/[0.06] overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.xp.progress.percentage}%` }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-400 rounded-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════
            FOCUS + REKOMENDASI — 2-column
            ════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Today's Focus */}
          <motion.div
            variants={rise}
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/[0.06] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Target size={18} className="text-blue-400" />
              </div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
                Today&apos;s Focus
              </h2>
            </div>

            {data.todayFocus ? (
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {data.todayFocus.title}
                </h3>
                {data.todayFocus.description && (
                  <p className="text-sm text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                    {data.todayFocus.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-6">
                  <Clock size={13} className="text-amber-400" />
                  <span>{data.todayFocus.estimatedMinutes} menit</span>
                </div>
                <Link
                  href="/focus"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] active:scale-[0.97]"
                >
                  <Timer size={16} /> Mulai Fokus
                </Link>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col justify-center min-h-[150px]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Rocket size={22} className="text-gray-600" />
                </div>
                <p className="text-white font-bold text-base mb-1">
                  Belum ada fokus hari ini
                </p>
                <p className="text-sm text-gray-500 max-w-xs">
                  Tentukan prioritas utamamu untuk memaksimalkan produktivitas.
                </p>
              </div>
            )}
          </motion.div>

          {/* Smart Recommendation */}
          <motion.div
            variants={rise}
            className="bg-white/5 border border-amber-500/[0.12] rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/[0.05] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.12em]">
                Rekomendasi Untukmu
              </h2>
            </div>

            {data.recommendation ? (
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {data.recommendation.title}
                </h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                  {data.recommendation.reason}
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg">
                    <Clock size={13} className="text-blue-400" />
                    Est. {data.recommendation.estimatedTime} menit
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/15">
                    {data.recommendation.type}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col justify-center min-h-[150px]">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/[0.08] flex items-center justify-center mb-4">
                  <Star size={22} className="text-amber-500/40" />
                </div>
                <p className="text-white font-bold text-base mb-1">
                  Kamu On Track! 🎉
                </p>
                <p className="text-sm text-gray-500 max-w-xs">
                  Tidak ada rekomendasi mendesak. Tetap konsisten!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ════════════════════════════════════════
            MAIN GRID — Schedule (3col) + Tasks (2col)
            ════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* ── Jadwal Hari Ini ── */}
          <motion.div
            variants={rise}
            className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">
                    Jadwal Hari Ini
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data.todaySchedule.length} kegiatan
                  </p>
                </div>
              </div>
              <Link
                href="/study-journey/calendar"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Lihat semua <ChevronRight size={14} />
              </Link>
            </div>

            {data.todaySchedule.length > 0 ? (
              <div className="space-y-2 relative ml-1 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-[2px] before:bg-white/[0.06] before:rounded-full">
                {data.todaySchedule.map((event, i) => (
                  <ScheduleItem key={event.id} event={event} index={i} />
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<Calendar size={28} className="text-gray-600" />}
                text="Belum ada jadwal hari ini"
                sub="Atur jadwal di kalender"
              />
            )}
          </motion.div>

          {/* ── Tasks ── */}
          <motion.div
            variants={rise}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">Tasks</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pendingTasks.length} menunggu
                  </p>
                </div>
              </div>
              <Link
                href="/study-journey/tasks"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Semua <ChevronRight size={14} />
              </Link>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-1">
                {pendingTasks.slice(0, 7).map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={
                  <CheckCircle2 size={28} className="text-emerald-500/40" />
                }
                text="Semua selesai! 🎉"
                sub="Kerja bagus, istirahat dulu"
              />
            )}
          </motion.div>
        </div>

        {/* ════════════════════════════════════════
            ROW 2 — Goals + Competitions + Projects
            ════════════════════════════════════════ */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Goals */}
          <motion.div variants={rise}>
            <Link href="/study-journey/goals" className="block group">
              <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Target size={18} className="text-amber-400" />
                    </div>
                    <h2 className="text-white font-bold text-base">Goals</h2>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                  />
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {data.weeklyStats.goalProgress}% rata-rata progress
                </p>
                <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.weeklyStats.goalProgress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Tujuan yang sedang kamu kejar
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Competitions */}
          <motion.div variants={rise}>
            <Link href="/study-journey/competitions" className="block group">
              <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <Award size={18} className="text-rose-400" />
                    </div>
                    <h2 className="text-white font-bold text-base">
                      Competitions
                    </h2>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                  />
                </div>
                <p className="text-sm text-gray-400 mb-1">
                  Tantangan yang sedang kamu kejar
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Lihat progress dan deadline →
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Projects */}
          <motion.div variants={rise}>
            <Link href="/study-journey/projects" className="block group">
              <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Rocket size={18} className="text-violet-400" />
                    </div>
                    <h2 className="text-white font-bold text-base">Projects</h2>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                  />
                </div>
                <p className="text-sm text-gray-400 mb-1">
                  Project dalam perjalanan
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Buka workspace project →
                </p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════
            ROW 3 — Learning Distribution + Upcoming
            ════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learning Distribution */}
          <motion.div
            variants={rise}
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  Distribusi Belajar
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Proporsi waktu minggu ini
                </p>
              </div>
            </div>

            {data.learningDistribution.length > 0 ? (
              <div className="space-y-5">
                {data.learningDistribution.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/80 font-medium">
                        {item.name}
                      </span>
                      <span className="text-gray-400 font-bold text-xs">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.06] overflow-hidden rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<TrendingUp size={28} className="text-gray-600" />}
                text="Belum ada data"
                sub="Mulai sesi belajar untuk melihat insight"
              />
            )}
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            variants={rise}
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock size={18} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  Deadline Mendatang
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Goals, kompetisi & project
                </p>
              </div>
            </div>

            {data.upcoming.length > 0 ? (
              <div className="space-y-2">
                {data.upcoming.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group/item cursor-default"
                  >
                    <div className="text-xl w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold truncate group-hover/item:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            item.daysLeft <= 1
                              ? 'bg-rose-500/15 text-rose-400'
                              : item.daysLeft <= 3
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          {item.daysLeft === 0
                            ? 'Hari ini!'
                            : item.daysLeft === 1
                              ? 'Besok'
                              : `${item.daysLeft} hari`}
                        </span>
                        {item.progress > 0 && (
                          <span className="text-[11px] text-blue-400 font-semibold">
                            {item.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-600 group-hover/item:text-gray-400 group-hover/item:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<Award size={28} className="text-gray-600" />}
                text="Bebas deadline!"
                sub="Kamu sudah up-to-date 🎉"
              />
            )}
          </motion.div>
        </div>

        {/* ════════════════════════════════════════
            FOOTER
            ════════════════════════════════════════ */}
        <motion.footer
          variants={rise}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 pb-2 border-t border-white/[0.06] text-sm"
        >
          <span className="flex items-center gap-2 text-gray-500">
            <CheckCircle2 size={14} className="text-emerald-500/60" />
            Tidak harus sempurna, yang penting terus bergerak.
          </span>
          <Link
            href="/study-journey"
            className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            Buka Workspace <ChevronRight size={14} />
          </Link>
        </motion.footer>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────── */

function StatCard({
  icon,
  iconClass,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300 cursor-default group">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold text-white leading-none mb-1 group-hover:text-blue-100 transition-colors">
        {value}
      </p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function TaskItem({
  task,
}: {
  task: {
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
  };
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await completeTask(task.id);
    setLoading(false);
  }

  const priorityColors: Record<string, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500',
  };

  const dotColor =
    priorityColors[task.priority.toLowerCase()] ?? 'bg-gray-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group cursor-pointer"
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div className="shrink-0 text-gray-600 group-hover:text-emerald-400 transition-colors">
        {task.status === 'Completed' ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : (
          <Circle
            size={18}
            className={loading ? 'opacity-40 animate-pulse' : ''}
          />
        )}
      </div>
      <span
        className={`text-sm font-medium flex-1 truncate transition-colors ${
          task.status === 'Completed'
            ? 'line-through text-gray-600'
            : 'text-white/80 group-hover:text-white'
        }`}
      >
        {task.title}
      </span>
      <div
        className={`w-2 h-2 rounded-full ${dotColor} shrink-0`}
        title={task.priority}
      />
    </motion.div>
  );
}

function ScheduleItem({
  event,
  index,
}: {
  event: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    color: string;
    completed: boolean;
  };
  index: number;
}) {
  const [loading, setLoading] = useState(false);
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const fmt = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const timeStr = `${fmt(start)} – ${fmt(end)}`;

  async function handleToggle() {
    setLoading(true);
    await completeScheduleEvent(event.id);
    setLoading(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-start gap-4 relative z-10 group cursor-pointer p-3 rounded-xl transition-all duration-300 ${
        event.completed
          ? 'opacity-40'
          : 'hover:bg-white/5'
      }`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
    >
      <div
        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-[3px] ring-[#0a0a0a] group-hover:scale-125 transition-transform"
        style={{ background: event.color }}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate transition-colors ${
            event.completed
              ? 'line-through text-gray-600'
              : 'text-white/80 group-hover:text-white'
          }`}
        >
          {event.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
          <Clock size={11} /> {timeStr}
        </p>
      </div>
      {event.completed && (
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
      )}
      {loading && (
        <span className="text-xs text-gray-500 animate-pulse shrink-0">
          ...
        </span>
      )}
    </motion.div>
  );
}

function EmptyBlock({
  icon,
  text,
  sub,
}: {
  icon: React.ReactNode;
  text: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06]">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-400">{text}</p>
      <p className="text-xs text-gray-600 mt-1">{sub}</p>
    </div>
  );
}
