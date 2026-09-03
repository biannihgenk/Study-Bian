'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCompetition, updateCompetition, deleteCompetition, createCompetitionTask, toggleCompetitionTask, deleteCompetitionTask, addCompetitionLearning } from '@/actions/competitions';
import { Plus, X, Trophy, CheckCircle2, Circle, Trash2, Edit3, ChevronDown, Rocket, Clock, Lightbulb, TrendingUp } from 'lucide-react';
import { PRIORITIES, COMPETITION_STATUSES } from '@/lib/constants';

interface CompTask { id: number; title: string; completed: boolean; order: number; }
interface CompLearning { id: number; content: string; }
interface Competition {
  id: number; name: string; description: string; category: string; priority: string;
  startDate: string | null; deadline: string | null; status: string; progress: number; image: string;
  tasks: CompTask[]; learnings: CompLearning[];
}

export default function CompetitionsClient({ initialCompetitions }: { initialCompetitions: Competition[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [expandedComp, setExpandedComp] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newLearning, setNewLearning] = useState('');
  const [loading, setLoading] = useState(false);

  const competitions = initialCompetitions;
  const ongoingCount = competitions.filter(c => c.status === 'Ongoing').length;
  const completedCount = competitions.filter(c => c.status === 'Completed' || c.status === 'Won').length;

  async function handleCreate(formData: FormData) { setLoading(true); await createCompetition(formData); setShowModal(false); setLoading(false); }
  async function handleUpdate(formData: FormData) { if (!editingComp) return; setLoading(true); await updateCompetition(editingComp.id, formData); setEditingComp(null); setLoading(false); }
  async function handleDelete(id: number) { if (confirm('Delete this competition?')) await deleteCompetition(id); }
  async function handleAddTask(compId: number) { if (!newTask.trim()) return; await createCompetitionTask(compId, newTask); setNewTask(''); }
  async function handleToggleTask(taskId: number) { await toggleCompetitionTask(taskId); }
  async function handleDeleteTask(taskId: number) { await deleteCompetitionTask(taskId); }
  async function handleAddLearning(compId: number) { if (!newLearning.trim()) return; await addCompetitionLearning(compId, newLearning); setNewLearning(''); }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Trophy size={24} className="text-rose-400" />
            </div>
            Competitions
          </h1>
          <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            <span className="text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg">
              <strong className="text-white">{ongoingCount}</strong> ongoing
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <strong className="font-bold">{completedCount}</strong> won/completed
            </span>
          </div>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Enter Competition
        </button>
      </motion.div>

      {competitions.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {competitions.map(comp => {
              const isExpanded = expandedComp === comp.id;
              const daysLeft = comp.deadline ? Math.ceil((new Date(comp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              
              return (
                <motion.div key={comp.id} layout variants={itemVariants} className={`bg-white/5 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'}`}>
                  <div className="p-6 sm:p-8 cursor-pointer" onClick={() => setExpandedComp(isExpanded ? null : comp.id)}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center border border-rose-500/10 shrink-0">
                          <Trophy size={28} className="text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors flex items-center gap-2">
                            {comp.name}
                            {comp.status === 'Won' && <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Winner</span>}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-gray-400 px-2.5 py-0.5 rounded-md border border-white/[0.06]">{comp.category}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${comp.status === 'Completed' || comp.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                              {comp.status}
                            </span>
                            {daysLeft !== null && daysLeft >= 0 && comp.status === 'Ongoing' && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1.5 border ${daysLeft <= 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                <Clock size={11} /> {daysLeft} days left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-right ml-18 md:ml-0">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Progress</div>
                          <div className="flex items-center justify-end gap-2 text-2xl font-black text-rose-400">
                            <TrendingUp size={18} className="opacity-70 text-rose-500" /> {comp.progress}%
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:bg-white/[0.08] hover:text-white transition-colors shrink-0">
                          <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${comp.progress}%` }} transition={{ duration: 1 }} className={`h-full rounded-full relative overflow-hidden ${comp.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`}>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/[0.06] bg-white/[0.02]">
                        <div className="p-6 md:p-8">
                          {comp.description && (
                            <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] mb-8">
                              {comp.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Tasks Column */}
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Rocket size={14}/> Preparation Tasks</span>
                                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">{comp.tasks.filter(t=>t.completed).length}/{comp.tasks.length} Done</span>
                              </h4>
                              
                              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[320px]">
                                <div className="p-3.5 border-b border-white/[0.06] flex gap-2.5 bg-white/[0.02]">
                                  <input className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 focus:border-rose-500/50 rounded-xl text-sm text-white transition-all outline-none placeholder-gray-500" placeholder="Add preparation task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask(comp.id)} />
                                  <button className="px-4 py-2 bg-rose-500/10 text-rose-400 font-bold rounded-xl text-sm hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-colors" onClick={() => handleAddTask(comp.id)}>Add</button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                  {comp.tasks.length > 0 ? (
                                    <div className="flex flex-col gap-1.5">
                                      {comp.tasks.map(t => (
                                        <div key={t.id} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.05] rounded-xl transition-colors group/task border border-transparent hover:border-white/[0.06]">
                                          <button onClick={() => handleToggleTask(t.id)} className={`shrink-0 transition-colors ${t.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}>
                                            {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                          </button>
                                          <span className={`text-sm flex-1 transition-all ${t.completed ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}`}>{t.title}</span>
                                          <button className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover/task:opacity-100 transition-all" onClick={() => handleDeleteTask(t.id)}>
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                                      <Rocket size={28} className="mb-3 opacity-30" />
                                      <span className="text-sm font-medium">No tasks mapped out yet.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Learnings Column */}
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Lightbulb size={14}/> What I Learned</span>
                                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md flex items-center gap-1.5">Insights</span>
                              </h4>
                              
                              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[320px]">
                                <div className="p-3.5 border-b border-white/[0.06] flex gap-2.5 bg-white/[0.02]">
                                  <input className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 focus:border-amber-500/50 rounded-xl text-sm text-white transition-all outline-none placeholder-gray-500" placeholder="Document an insight or lesson..." value={newLearning} onChange={e => setNewLearning(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddLearning(comp.id)} />
                                  <button className="px-4 py-2 bg-amber-500/10 text-amber-500 font-bold rounded-xl text-sm hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-colors" onClick={() => handleAddLearning(comp.id)}>Add</button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                  {comp.learnings.length > 0 ? (
                                    <ul className="flex flex-col gap-4 pl-1">
                                      {comp.learnings.map(l => (
                                        <li key={l.id} className="relative pl-5 text-sm text-gray-300 font-medium leading-relaxed">
                                          <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                          {l.content}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                                      <Lightbulb size={28} className="mb-3 opacity-30" />
                                      <span className="text-sm font-medium">No learnings documented yet.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-white/[0.06]">
                            <button className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-white/[0.06]" onClick={() => setEditingComp(comp)}>
                              <Edit3 size={16} /> Edit Details
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-rose-500/20" onClick={() => handleDelete(comp.id)}>
                              <Trash2 size={16} /> Delete Competition
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
            <Trophy size={32} className="text-rose-500/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No competitions yet</h2>
          <p className="text-gray-400 max-w-md mb-8">Push your limits, test your skills, and track your next competition journey right here.</p>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.3)] transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Enter a Competition
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {(showModal || editingComp) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setShowModal(false); setEditingComp(null); }} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-xl"><Trophy size={18} className="text-rose-400" /></div>
                    {editingComp ? 'Edit Competition' : 'New Competition'}
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => { setShowModal(false); setEditingComp(null); }}><X size={18} /></button>
                </div>
                
                <form action={editingComp ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Competition Name *</label>
                      <input name="name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required defaultValue={editingComp?.name || ''} placeholder="e.g. Hackathon 2026" autoFocus />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" defaultValue={editingComp?.description || ''} placeholder="Brief details about the rules or goals..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <input name="category" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={editingComp?.category || ''} placeholder="e.g. Data Science" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</label>
                        <div className="relative">
                          <select name="priority" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingComp?.priority || 'Medium'}>
                            {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#0f0f11]">{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                        <input name="startDate" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingComp?.startDate?.split('T')[0] || ''} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Deadline</label>
                        <input name="deadline" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingComp?.deadline?.split('T')[0] || ''} />
                      </div>
                    </div>
                    {editingComp && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Status</label>
                        <div className="relative">
                          <select name="status" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer font-bold" defaultValue={editingComp.status}>
                            {COMPETITION_STATUSES.map(s => <option key={s} value={s} className="bg-[#0f0f11]">{s}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => { setShowModal(false); setEditingComp(null); }}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:bg-rose-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
                      {loading ? 'Saving...' : editingComp ? 'Save Changes' : 'Enter Competition'}
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
