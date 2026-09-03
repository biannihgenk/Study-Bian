'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '@/actions/profile';
import { Zap, Flame, BookOpen, CheckSquare, Target, Trophy, FolderKanban, Timer, Edit3, X, Award, Medal, Crown } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface ProfileData {
  name: string; email: string; bio: string; avatar: string; title: string; quote: string;
  stats: {
    totalXp: number; level: number; levelTitle: string; xpProgress: { current: number; required: number; percentage: number };
    totalLearningMinutes: number; tasksCompleted: number; goalsCompleted: number; projectsCompleted: number;
    competitionsCompleted: number; focusSessions: number;
  };
  streak: { current: number; longest: number };
  achievements: Array<{ id: number; key: string; title: string; description: string; icon: string; unlocked: boolean; unlockedAt: string | null; }>;
  projects: Array<{ id: number; name: string; status: string; category: string; progress: number }>;
  competitions: Array<{ id: number; name: string; status: string; category: string; progress: number }>;
}

export default function ProfileClient({ data }: { data: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(formData: FormData) {
    setLoading(true);
    await updateProfile(formData);
    setEditing(false);
    setLoading(false);
  }

  const unlockedAchievements = data.achievements.filter(a => a.unlocked);
  const lockedAchievements = data.achievements.filter(a => !a.unlocked);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Crown size={24} className="text-amber-400" />
          </div>
          Your Profile
        </h1>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-white/20">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start gap-8 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-xl shadow-amber-500/20 shrink-0 border border-white/10">
            {data.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form key="edit-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} action={handleSave} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                      <input name="name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={data.name} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                      <input name="title" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={data.title} placeholder="e.g. Aspiring Developer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Favorite Quote / Motto</label>
                    <input name="quote" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={data.quote} placeholder="Your motto" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea name="bio" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" defaultValue={data.bio} placeholder="Tell us about yourself" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:bg-amber-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <h2 className="text-3xl font-black text-white">{data.name}</h2>
                    <button className="self-start sm:self-auto p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors border border-transparent hover:border-amber-500/20" onClick={() => setEditing(true)}>
                      <Edit3 size={16} />
                    </button>
                  </div>
                  {data.title && <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase tracking-wider rounded-lg mb-4 border border-amber-500/20">{data.title}</div>}
                  {data.quote && <p className="text-sm italic text-gray-400 mb-5 pl-4 border-l-2 border-amber-500/30">"{data.quote}"</p>}
                  {data.bio && <p className="text-sm text-gray-300 leading-relaxed max-w-2xl bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">{data.bio}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level & XP Progress */}
            <div className="mt-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Zap size={26} className="text-amber-400 fill-amber-400/50" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Current Level</div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-white drop-shadow-sm">{data.stats.level}</span>
                      <span className="text-sm font-bold text-amber-400">{data.stats.levelTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{data.stats.xpProgress.percentage}%</span>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">To Next Level</div>
                </div>
              </div>
              
              <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.stats.xpProgress.percentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                <span>{data.stats.xpProgress.current.toLocaleString()} XP</span>
                <span>{data.stats.xpProgress.required.toLocaleString()} XP</span>
              </div>
              <div className="text-center text-xs font-bold text-gray-400 mt-4 bg-white/[0.02] py-2 rounded-xl border border-white/[0.04]">
                Total Lifetime Experience: <span className="text-white ml-1">{data.stats.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<BookOpen size={20} />} label="Learning Time" value={formatDuration(data.stats.totalLearningMinutes)} color="blue" />
        <StatCard icon={<CheckSquare size={20} />} label="Tasks Done" value={data.stats.tasksCompleted} color="emerald" />
        <StatCard icon={<Target size={20} />} label="Goals Hit" value={data.stats.goalsCompleted} color="purple" />
        <StatCard icon={<Timer size={20} />} label="Focus Sessions" value={data.stats.focusSessions} color="rose" />
        <StatCard icon={<Trophy size={20} />} label="Competitions" value={data.stats.competitionsCompleted} color="amber" />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={data.stats.projectsCompleted} color="indigo" />
        <StatCard icon={<Flame size={20} />} label="Current Streak" value={`${data.streak.current}d`} color="orange" />
        <StatCard icon={<Medal size={20} />} label="Longest Streak" value={`${data.streak.longest}d`} color="yellow" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Achievements Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20"><Award size={20} className="text-amber-400" /></div>
              Achievements
            </h2>
            <div className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span className="text-amber-400">{unlockedAchievements.length}</span> / {data.achievements.length} Unlocked
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {unlockedAchievements.map(a => (
              <div key={a.id} className="bg-gradient-to-br from-white/[0.04] to-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 group">
                <div className="text-4xl group-hover:scale-110 transition-transform origin-bottom drop-shadow-md">{a.icon}</div>
                <div>
                  <h4 className="font-bold text-white mb-1.5">{a.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
            {lockedAchievements.map(a => (
              <div key={a.id} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 flex gap-4 items-start opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0">
                <div className="text-4xl opacity-40">{a.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-300 mb-1.5">{a.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mini Boards (Projects & Comps) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex flex-col gap-6">
          {data.projects.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[28px] p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <FolderKanban size={14} className="text-indigo-400" /> Active Projects
              </h3>
              <div className="flex flex-col gap-3">
                {data.projects.map(p => (
                  <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.05] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                      <FolderKanban size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate mb-0.5">{p.name}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{p.status}</div>
                    </div>
                    <div className="text-sm font-black text-indigo-400">{p.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.competitions.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[28px] p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <Trophy size={14} className="text-rose-400" /> Competitions
              </h3>
              <div className="flex flex-col gap-3">
                {data.competitions.map(c => (
                  <div key={c.id} className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.05] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                      <Trophy size={18} className="text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate mb-0.5">{c.name}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{c.status}</div>
                    </div>
                    <div className="text-sm font-black text-rose-400">{c.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  // Mapping color prop to Tailwind classes for dynamic styling safely
  const colorMap: Record<string, { bg: string, text: string, border: string, glow: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'bg-emerald-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'bg-purple-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'bg-rose-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'bg-amber-500' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'bg-indigo-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'bg-orange-500' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', glow: 'bg-yellow-500' },
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${style.glow} opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-500`} />
      <div className={`p-3.5 rounded-2xl ${style.bg} ${style.border} border mb-4 group-hover:-translate-y-1 transition-transform duration-300`}>
        <div className={style.text}>{icon}</div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
