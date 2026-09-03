'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSubject, deleteSubject, createTopic, toggleTopic, deleteTopic, createSession } from '@/actions/learning';
import { Plus, X, BookOpen, CheckCircle2, Circle, Trash2, ChevronDown, ChevronRight, Clock, Target, GraduationCap } from 'lucide-react';

interface Topic { id: number; title: string; completed: boolean; order: number; }
interface Subject { id: number; title: string; description: string; icon: string; color: string; topics: Topic[]; }
interface Session { id: number; activity: string; duration: number; date: string; description: string; subject: { title: string } | null; }

export default function LearningClient({ initialSubjects, recentSessions }: { initialSubjects: Subject[]; recentSessions: Session[] }) {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const subjects = initialSubjects;

  async function handleCreateSubject(formData: FormData) { setLoading(true); await createSubject(formData); setShowSubjectModal(false); setLoading(false); }
  async function handleDeleteSubject(id: number) { if (confirm('Delete this subject and all its topics?')) await deleteSubject(id); }
  async function handleAddTopic(subjectId: number) { if (!newTopic.trim()) return; await createTopic(subjectId, newTopic); setNewTopic(''); }
  async function handleToggleTopic(topicId: number) { await toggleTopic(topicId); }
  async function handleDeleteTopic(topicId: number) { await deleteTopic(topicId); }
  async function handleLogSession(formData: FormData) { setLoading(true); await createSession(formData); setShowSessionModal(false); setLoading(false); }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <GraduationCap size={24} className="text-purple-400" />
            </div>
            Learning Center
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg inline-block">
            <strong className="text-white">{subjects.length}</strong> active subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 shadow-sm transition-all active:scale-95 shrink-0" onClick={() => setShowSessionModal(true)}>
            <Clock size={16} className="text-gray-400" /> Log Session
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all active:scale-95 shrink-0" onClick={() => setShowSubjectModal(true)}>
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Subjects Column */}
        <div>
          {subjects.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-5">
              <AnimatePresence>
                {subjects.map((subject) => {
                  const isExpanded = expandedSubject === subject.id;
                  const total = subject.topics.length;
                  const completed = subject.topics.filter(t => t.completed).length;
                  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <motion.div key={subject.id} layout variants={itemVariants} className={`bg-white/5 backdrop-blur-sm border rounded-[28px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'}`}>
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer hover:bg-white/[0.03] transition-colors" onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white/[0.06] shrink-0" style={{ backgroundColor: `${subject.color}15` }}>
                          {subject.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1.5 truncate group-hover:text-purple-400 transition-colors">{subject.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">{completed}/{total} Topics</span>
                            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden max-w-[200px] relative">
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite] z-10" />
                              <div className="h-full rounded-full transition-all duration-1000 relative z-0" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
                            </div>
                            <span className="text-xs font-black" style={{ color: subject.color }}>{progress}%</span>
                          </div>
                        </div>
                        
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 shrink-0 shadow-sm ml-auto sm:ml-0 hover:text-white hover:bg-white/[0.08] transition-colors">
                          <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/[0.06] bg-white/[0.02]">
                            <div className="p-6 sm:p-8">
                              {subject.description && (
                                <p className="text-sm text-gray-300 mb-6 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] shadow-sm leading-relaxed">
                                  {subject.description}
                                </p>
                              )}

                              <div className="mb-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                  <BookOpen size={14} style={{ color: subject.color }} /> Curriculum
                                </h4>
                                
                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl shadow-sm p-3">
                                  {subject.topics.length > 0 ? (
                                    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                      {subject.topics.map(t => (
                                        <div key={t.id} className="flex items-center gap-4 p-2.5 hover:bg-white/[0.04] rounded-xl transition-colors group/topic border border-transparent hover:border-white/[0.06]">
                                          <button onClick={() => handleToggleTopic(t.id)} className={`shrink-0 transition-colors ${t.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}>
                                            {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                          </button>
                                          <span className={`text-sm flex-1 transition-all ${t.completed ? 'line-through text-gray-500' : 'text-white font-medium'}`}>
                                            {t.title}
                                          </span>
                                          <button className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover/topic:opacity-100 transition-all" onClick={() => handleDeleteTopic(t.id)}>
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-8 text-center text-sm font-medium text-gray-500 flex flex-col items-center gap-2">
                                      <BookOpen size={24} className="opacity-30 mb-1" />
                                      No topics added yet. Start building your curriculum.
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-3 mb-8 bg-white/[0.02] p-3 border border-white/[0.06] rounded-2xl">
                                <input className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 focus:border-purple-500/50 rounded-xl text-sm text-white transition-all outline-none placeholder-gray-500" placeholder="Add a new topic..." value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTopic(subject.id)} />
                                <button className="px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold rounded-xl text-sm hover:bg-purple-500 hover:text-white transition-colors" onClick={() => handleAddTopic(subject.id)}>Add Topic</button>
                              </div>

                              <div className="flex justify-end pt-6 mt-6 border-t border-white/[0.06]">
                                <button className="px-5 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-colors flex items-center gap-2" onClick={() => handleDeleteSubject(subject.id)}>
                                  <Trash2 size={16} /> Delete Subject
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
                <BookOpen size={32} className="text-purple-500/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Start learning something new</h2>
              <p className="text-gray-400 max-w-md mb-8">Add subjects you want to master, break them down into topics, and track your progress.</p>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowSubjectModal(true)}>
                <Plus size={18} /> Add Subject
              </button>
            </motion.div>
          )}
        </div>

        {/* Recent Sessions Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20"><Clock size={20} className="text-blue-400" /></div>
            <h3 className="text-lg font-bold text-white">Recent Sessions</h3>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {recentSessions.map(s => (
                <div key={s.id} className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl hover:border-white/10 hover:bg-white/[0.05] transition-all shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{s.activity}</h4>
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-3 border border-blue-500/20">
                      {s.duration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-gray-400" /> {s.subject?.title || 'General'}</span>
                    <span className="text-gray-600">•</span>
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
              <Clock size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-bold text-gray-300">No sessions logged yet.</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Use the Focus Timer or log manually.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Subject Modal */}
        {showSubjectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowSubjectModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl"><BookOpen size={18} className="text-purple-400" /></div>
                    Add New Subject
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => setShowSubjectModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleCreateSubject} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required placeholder="e.g. Machine Learning, Spanish" autoFocus />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" placeholder="What is the goal of learning this?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Icon (Emoji)</label>
                        <input name="icon" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-purple-500/50 focus:bg-white/[0.05] rounded-xl text-lg text-center transition-all outline-none text-white" defaultValue="📚" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Theme Color</label>
                        <div className="h-[52px] p-1.5 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-xl overflow-hidden flex items-center justify-center transition-colors">
                          <input name="color" type="color" className="w-full h-full p-0 border-0 cursor-pointer rounded-lg overflow-hidden bg-transparent" defaultValue="#a855f7" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:bg-purple-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Subject'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}

        {/* Session Modal */}
        {showSessionModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowSessionModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl"><Clock size={18} className="text-blue-400" /></div>
                    Log Manual Session
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => setShowSessionModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleLogSession} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">What did you work on? *</label>
                      <input name="activity" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required placeholder="e.g. Watched React Tutorial" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Duration (min) *</label>
                        <input name="duration" type="number" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required min="1" placeholder="45" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                        <div className="relative">
                          <select name="subjectId" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer">
                            <option value="" className="bg-[#0f0f11]">General</option>
                            {subjects.map(s => <option key={s.id} value={s.id} className="bg-[#0f0f11]">{s.title}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" placeholder="Key takeaways or summary..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                      <input name="date" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowSessionModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
                      {loading ? 'Saving...' : 'Log Session'}
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
