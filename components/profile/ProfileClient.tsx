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
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><Crown size={24} className="text-primary" /></div>
          Your Profile
        </h1>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/60 rounded-[32px] p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start gap-8 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[28px] bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-xl shadow-primary/20 shrink-0">
            {data.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form key="edit-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} action={handleSave} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Display Name</label><input name="name" className="w-full px-4 py-2.5 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={data.name} required /></div>
                    <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Title</label><input name="title" className="w-full px-4 py-2.5 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={data.title} placeholder="e.g. Aspiring Developer" /></div>
                  </div>
                  <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Favorite Quote / Motto</label><input name="quote" className="w-full px-4 py-2.5 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={data.quote} placeholder="Your motto" /></div>
                  <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bio</label><textarea name="bio" className="w-full px-4 py-2.5 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" defaultValue={data.bio} placeholder="Tell us about yourself" /></div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setEditing(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <h2 className="text-3xl font-black text-foreground">{data.name}</h2>
                    <button className="self-start sm:self-auto p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" onClick={() => setEditing(true)}>
                      <Edit3 size={16} />
                    </button>
                  </div>
                  {data.title && <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-lg mb-4">{data.title}</div>}
                  {data.quote && <p className="text-sm italic text-muted-foreground mb-4 pl-4 border-l-2 border-primary/30">"{data.quote}"</p>}
                  {data.bio && <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{data.bio}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level & XP Progress */}
            <div className="mt-8 bg-background border border-border/40 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Zap size={24} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Current Level</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground">{data.stats.level}</span>
                      <span className="text-sm font-bold text-amber-500">{data.stats.levelTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">{data.stats.xpProgress.percentage}%</span>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">To Next Level</div>
                </div>
              </div>
              
              <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden mb-2 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.stats.xpProgress.percentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" />
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>{data.stats.xpProgress.current.toLocaleString()} XP</span>
                <span>{data.stats.xpProgress.required.toLocaleString()} XP</span>
              </div>
              <div className="text-center text-xs font-bold text-muted-foreground mt-2 bg-muted/30 py-1.5 rounded-lg border border-border/40">
                Total Lifetime Experience: <span className="text-foreground">{data.stats.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<BookOpen size={20} />} label="Learning Time" value={formatDuration(data.stats.totalLearningMinutes)} color="bg-blue-500" />
        <StatCard icon={<CheckSquare size={20} />} label="Tasks Done" value={data.stats.tasksCompleted} color="bg-emerald-500" />
        <StatCard icon={<Target size={20} />} label="Goals Hit" value={data.stats.goalsCompleted} color="bg-purple-500" />
        <StatCard icon={<Timer size={20} />} label="Focus Sessions" value={data.stats.focusSessions} color="bg-rose-500" />
        <StatCard icon={<Trophy size={20} />} label="Competitions" value={data.stats.competitionsCompleted} color="bg-amber-500" />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={data.stats.projectsCompleted} color="bg-indigo-500" />
        <StatCard icon={<Flame size={20} />} label="Current Streak" value={`${data.streak.current}d`} color="bg-orange-500" />
        <StatCard icon={<Medal size={20} />} label="Longest Streak" value={`${data.streak.longest}d`} color="bg-yellow-500" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Achievements Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border/60 rounded-[32px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl"><Award size={20} className="text-amber-500" /></div>
              Achievements
            </h2>
            <div className="px-3 py-1 bg-muted rounded-lg text-sm font-bold text-muted-foreground">
              {unlockedAchievements.length} / {data.achievements.length} Unlocked
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {unlockedAchievements.map(a => (
              <div key={a.id} className="bg-gradient-to-br from-background to-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="text-4xl group-hover:scale-110 transition-transform origin-bottom">{a.icon}</div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{a.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
            {lockedAchievements.map(a => (
              <div key={a.id} className="bg-background border border-border/40 rounded-2xl p-4 flex gap-4 items-start opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <div className="text-4xl opacity-50">{a.icon}</div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{a.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mini Boards (Projects & Comps) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex flex-col gap-6">
          {data.projects.length > 0 && (
            <div className="bg-card border border-border/60 rounded-[28px] p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <FolderKanban size={16} /> Active Projects
              </h3>
              <div className="flex flex-col gap-3">
                {data.projects.map(p => (
                  <div key={p.id} className="bg-background border border-border/40 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <FolderKanban size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{p.name}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{p.status}</div>
                    </div>
                    <div className="text-sm font-black text-indigo-500">{p.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.competitions.length > 0 && (
            <div className="bg-card border border-border/60 rounded-[28px] p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Trophy size={16} /> Competitions
              </h3>
              <div className="flex flex-col gap-3">
                {data.competitions.map(c => (
                  <div key={c.id} className="bg-background border border-border/40 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Trophy size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{c.name}</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{c.status}</div>
                    </div>
                    <div className="text-sm font-black text-amber-500">{c.progress}%</div>
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
  return (
    <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} className="bg-card border border-border/60 rounded-[24px] p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 mb-3 group-hover:-translate-y-1 transition-transform`}>
        <div className={color.replace('bg-', 'text-')}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-foreground mb-1">{value}</div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
