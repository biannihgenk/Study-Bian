'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createGoal, updateGoal, deleteGoal, createMilestone, toggleMilestone, deleteMilestone } from '@/actions/goals';
import { Plus, X, Target, CheckCircle2, Circle, Trash2, Edit3, ChevronDown, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { PRIORITIES, GOAL_STATUSES } from '@/lib/constants';

interface Milestone {
  id: number;
  title: string;
  order: number;
  completed: boolean;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  targetDate: string | null;
  status: string;
  progress: number;
  milestones: Milestone[];
}

export default function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [loading, setLoading] = useState(false);

  const goals = initialGoals;
  const activeCount = goals.filter(g => g.status === 'Active').length;
  const completedCount = goals.filter(g => g.status === 'Completed').length;

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createGoal(formData);
    setShowModal(false);
    setLoading(false);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingGoal) return;
    setLoading(true);
    await updateGoal(editingGoal.id, formData);
    setEditingGoal(null);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this goal and all its milestones?')) {
      await deleteGoal(id);
    }
  }

  async function handleAddMilestone(goalId: number) {
    if (!newMilestone.trim()) return;
    await createMilestone(goalId, newMilestone);
    setNewMilestone('');
  }

  async function handleToggleMilestone(milestoneId: number) {
    await toggleMilestone(milestoneId);
  }

  async function handleDeleteMilestone(milestoneId: number) {
    await deleteMilestone(milestoneId);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target size={24} className="text-purple-400" />
            </div>
            Goals
          </h1>
          <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            <span className="text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg">
              <strong className="text-white">{activeCount}</strong> active
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <strong className="font-bold">{completedCount}</strong> completed
            </span>
          </div>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Add Goal
        </button>
      </motion.div>

      {goals.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
          <AnimatePresence>
            {goals.map((goal) => {
              const isExpanded = expandedGoal === goal.id;
              return (
                <motion.div key={goal.id} layout variants={itemVariants} className={`bg-white/5 backdrop-blur-sm border rounded-[28px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'}`}>
                  <div 
                    className="p-5 sm:p-6 flex items-center gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors group"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 border border-purple-500/20 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                      {isExpanded ? <ChevronDown size={20} className="text-purple-400" /> : <ChevronRight size={20} className="text-purple-400" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-bold mb-1.5 text-white truncate group-hover:text-purple-400 transition-colors">{goal.title}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-gray-400 border border-white/[0.06]">{goal.category}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${goal.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : goal.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {goal.priority}
                        </span>
                        {goal.status === 'Completed' && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>
                        )}
                        {goal.targetDate && (
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md bg-white/[0.04] text-gray-400 border border-white/[0.06]">
                            <CalendarDays size={12} className="text-gray-500" />
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0 pr-2 hidden sm:block">
                      <div className="text-2xl font-black text-purple-400 mb-0.5 flex items-center justify-end gap-1.5">
                        <Activity size={18} className="opacity-70 text-purple-500" /> {goal.progress}%
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} milestones
                      </div>
                    </div>
                  </div>

                  {/* Minimal progress bar below header */}
                  <div className="px-6 sm:px-8 pb-5">
                    <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${goal.progress}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.06] bg-white/[0.02] overflow-hidden"
                      >
                        <div className="p-6 sm:p-8">
                          {/* Mobile progress display */}
                          <div className="sm:hidden flex items-center justify-between mb-6 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Progress: {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}
                            </div>
                            <div className="text-xl font-black text-purple-400 flex items-center gap-1.5">
                              <Activity size={16} className="text-purple-500" /> {goal.progress}%
                            </div>
                          </div>

                          {goal.description && (
                            <p className="text-sm text-gray-300 mb-6 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] leading-relaxed">
                              {goal.description}
                            </p>
                          )}

                          <div className="mb-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                              <span className="flex items-center gap-2"><Target size={14} className="text-purple-400" /> Milestones Roadmap</span>
                            </h4>
                            {goal.milestones.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {goal.milestones.map((m) => (
                                  <div key={m.id} className="flex items-center gap-4 p-3 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] rounded-xl transition-colors group/ms">
                                    <button onClick={() => handleToggleMilestone(m.id)} className={`shrink-0 transition-colors ${m.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}>
                                      {m.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </button>
                                    <span className={`text-sm flex-1 transition-all ${m.completed ? 'line-through text-gray-500' : 'text-white font-medium'}`}>
                                      {m.title}
                                    </span>
                                    <button className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover/ms:opacity-100 transition-all" onClick={() => handleDeleteMilestone(m.id)}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 p-6 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10 font-medium flex flex-col items-center justify-center gap-2">
                                <Target size={24} className="opacity-30 mb-1" />
                                No milestones mapped out yet. Break your goal down into smaller steps.
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 mb-8 bg-white/[0.02] p-3 border border-white/[0.06] rounded-2xl">
                            <input
                              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 focus:border-purple-500/50 rounded-xl text-sm text-white transition-all outline-none placeholder-gray-500"
                              placeholder="Add a new milestone..."
                              value={newMilestone}
                              onChange={(e) => setNewMilestone(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            />
                            <button className="px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm" onClick={() => handleAddMilestone(goal.id)}>
                              <Plus size={16} /> Add
                            </button>
                          </div>

                          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/[0.06]">
                            <button className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-white/[0.06]" onClick={() => setEditingGoal(goal)}>
                              <Edit3 size={16} /> Edit Goal
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-colors flex items-center gap-2" onClick={() => handleDelete(goal.id)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-sm shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
            <Target size={32} className="text-purple-500/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Set your first goal</h2>
          <p className="text-gray-400 max-w-md mb-8">Goals give your learning direction. Create milestones to break them down and track your progress to success.</p>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Goal
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {(showModal || editingGoal) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
              onClick={() => { setShowModal(false); setEditingGoal(null); }} 
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl"><Target size={18} className="text-purple-400" /></div>
                    {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => { setShowModal(false); setEditingGoal(null); }}>
                    <X size={18} />
                  </button>
                </div>
                
                <form action={editingGoal ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required defaultValue={editingGoal?.title || ''} placeholder="What do you want to achieve?" autoFocus />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" defaultValue={editingGoal?.description || ''} placeholder="Why is this important to you?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <input name="category" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={editingGoal?.category || ''} placeholder="e.g. Programming" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</label>
                        <div className="relative">
                          <select name="priority" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingGoal?.priority || 'Medium'}>
                            {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0f0f11]">{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Date</label>
                        <input name="targetDate" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingGoal?.targetDate ? editingGoal.targetDate.split('T')[0] : ''} />
                      </div>
                      {editingGoal && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Status</label>
                          <div className="relative">
                            <select name="status" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingGoal.status}>
                              {GOAL_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0f0f11]">{s}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => { setShowModal(false); setEditingGoal(null); }}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:bg-purple-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
                      {loading ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
