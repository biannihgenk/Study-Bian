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
    <div className="max-w-5xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><Target size={24} className="text-primary" /></div>
            Goals
          </h1>
          <div className="flex gap-3 text-sm font-medium">
            <span className="text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md"><strong className="text-foreground">{activeCount}</strong> active</span>
            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md"><strong className="font-bold">{completedCount}</strong> completed</span>
          </div>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
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
                <motion.div key={goal.id} layout variants={itemVariants} className="bg-card border border-border/60 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="p-5 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors group"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  >
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                      {isExpanded ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-primary" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-bold mb-1.5 truncate group-hover:text-primary transition-colors">{goal.title}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">{goal.category}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${goal.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-500' : goal.priority === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {goal.priority}
                        </span>
                        {goal.status === 'Completed' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">Completed</span>
                        )}
                        {goal.targetDate && (
                          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                            <CalendarDays size={12} />
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0 pr-2">
                      <div className="text-2xl font-black text-primary mb-0.5 flex items-center justify-end gap-1">
                        <Activity size={18} className="opacity-70" /> {goal.progress}%
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} milestones
                      </div>
                    </div>
                  </div>

                  {/* Minimal progress bar below header */}
                  <div className="px-6 pb-4">
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${goal.progress}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full" 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50 bg-muted/5 overflow-hidden"
                      >
                        <div className="p-6">
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mb-6 bg-muted/30 p-4 rounded-xl border border-border/40">
                              {goal.description}
                            </p>
                          )}

                          <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                              <Target size={14} /> Milestones Roadmap
                            </h4>
                            {goal.milestones.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {goal.milestones.map((m) => (
                                  <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors group/ms">
                                    <button onClick={() => handleToggleMilestone(m.id)} className={`shrink-0 transition-colors ${m.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'}`}>
                                      {m.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </button>
                                    <span className={`text-sm flex-1 transition-all ${m.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                      {m.title}
                                    </span>
                                    <button className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md opacity-0 group-hover/ms:opacity-100 transition-all" onClick={() => handleDeleteMilestone(m.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground p-4 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                                No milestones mapped out yet. Break your goal down into smaller steps.
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 mb-8">
                            <input
                              className="flex-1 px-4 py-2 bg-background border border-border/60 hover:border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none"
                              placeholder="Add a new milestone..."
                              value={newMilestone}
                              onChange={(e) => setNewMilestone(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            />
                            <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition-colors flex items-center gap-2 text-sm" onClick={() => handleAddMilestone(goal.id)}>
                              <Plus size={16} /> Add
                            </button>
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                            <button className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors flex items-center gap-2" onClick={() => setEditingGoal(goal)}>
                              <Edit3 size={16} /> Edit Goal
                            </button>
                            <button className="px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2" onClick={() => handleDelete(goal.id)}>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card border border-border/60 rounded-[28px] shadow-sm">
          <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6 shadow-inner">
            <Target size={40} className="text-primary/70" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Set your first goal</h2>
          <p className="text-muted-foreground max-w-md mb-8">Goals give your learning direction. Create milestones to break them down and track your progress to success.</p>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowModal(true)}>
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
              onClick={() => { setShowModal(false); setEditingGoal(null); }} 
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-muted/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg"><Target size={18} className="text-primary" /></div>
                    {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                  </h2>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" onClick={() => { setShowModal(false); setEditingGoal(null); }}>
                    <X size={18} />
                  </button>
                </div>
                
                <form action={editingGoal ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required defaultValue={editingGoal?.title || ''} placeholder="What do you want to achieve?" autoFocus />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" defaultValue={editingGoal?.description || ''} placeholder="Why is this important to you?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                        <input name="category" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={editingGoal?.category || ''} placeholder="e.g. Programming" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Priority</label>
                        <div className="relative">
                          <select name="priority" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer" defaultValue={editingGoal?.priority || 'Medium'}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Target Date</label>
                        <input name="targetDate" type="date" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={editingGoal?.targetDate ? editingGoal.targetDate.split('T')[0] : ''} />
                      </div>
                      {editingGoal && (
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
                          <div className="relative">
                            <select name="status" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer" defaultValue={editingGoal.status}>
                              {GOAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => { setShowModal(false); setEditingGoal(null); }}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>
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
