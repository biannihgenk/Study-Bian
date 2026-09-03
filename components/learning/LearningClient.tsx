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
    <div className="max-w-7xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl"><GraduationCap size={24} className="text-purple-500" /></div>
            Learning Center
          </h1>
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-md inline-block">
            {subjects.length} active subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border/60 text-foreground font-bold text-sm rounded-xl hover:bg-muted shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0" onClick={() => setShowSessionModal(true)}>
            <Clock size={16} /> Log Session
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0" onClick={() => setShowSubjectModal(true)}>
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
                    <motion.div key={subject.id} layout variants={itemVariants} className={`bg-card border rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all ${isExpanded ? 'border-primary/40 ring-2 ring-primary/5' : 'border-border/60 hover:border-primary/20'}`}>
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-border/40 shrink-0" style={{ backgroundColor: `${subject.color}15` }}>
                          {subject.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1 truncate">{subject.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{completed}/{total} Topics</span>
                            <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden max-w-[200px]">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
                            </div>
                            <span className="text-xs font-black" style={{ color: subject.color }}>{progress}%</span>
                          </div>
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-background border border-border/40 flex items-center justify-center text-muted-foreground shrink-0 shadow-sm ml-auto sm:ml-0">
                          <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/50 bg-muted/5">
                            <div className="p-6">
                              {subject.description && (
                                <p className="text-sm text-muted-foreground mb-6 bg-background p-4 rounded-xl border border-border/40 shadow-sm">
                                  {subject.description}
                                </p>
                              )}

                              <div className="mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3 flex items-center gap-2">
                                  <BookOpen size={14} style={{ color: subject.color }} /> Curriculum
                                </h4>
                                
                                <div className="bg-background border border-border/40 rounded-xl shadow-sm p-2">
                                  {subject.topics.length > 0 ? (
                                    <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                      {subject.topics.map(t => (
                                        <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors group/topic">
                                          <button onClick={() => handleToggleTopic(t.id)} className={`shrink-0 transition-colors ${t.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'}`}>
                                            {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                          </button>
                                          <span className={`text-sm flex-1 transition-all ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                            {t.title}
                                          </span>
                                          <button className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md opacity-0 group-hover/topic:opacity-100 transition-all" onClick={() => handleDeleteTopic(t.id)}>
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                      No topics added yet. Start building your curriculum.
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-3 mb-6">
                                <input className="flex-1 px-4 py-2 bg-background border border-border/60 hover:border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" placeholder="Add a new topic..." value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTopic(subject.id)} />
                                <button className="px-5 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => handleAddTopic(subject.id)}>Add Topic</button>
                              </div>

                              <div className="flex justify-end pt-4 border-t border-border/40">
                                <button className="px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2" onClick={() => handleDeleteSubject(subject.id)}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card border border-border/60 rounded-[28px] shadow-sm">
              <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6 shadow-inner">
                <BookOpen size={40} className="text-purple-500/70" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Start learning something new</h2>
              <p className="text-muted-foreground max-w-md mb-8">Add subjects you want to master, break them down into topics, and track your progress.</p>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowSubjectModal(true)}>
                <Plus size={18} /> Add Subject
              </button>
            </motion.div>
          )}
        </div>

        {/* Recent Sessions Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/60 rounded-[28px] p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <div className="p-2 bg-blue-500/10 rounded-xl"><Clock size={20} className="text-blue-500" /></div>
            <h3 className="text-lg font-bold">Recent Sessions</h3>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {recentSessions.map(s => (
                <div key={s.id} className="bg-background border border-border/40 p-4 rounded-2xl hover:border-primary/30 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-foreground leading-tight">{s.activity}</h4>
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2">
                      {s.duration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {s.subject?.title || 'General'}</span>
                    <span>•</span>
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Clock size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No sessions logged yet.</p>
              <p className="text-xs mt-1">Use the Focus Timer or log a session manually.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Subject Modal */}
        {showSubjectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowSubjectModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-muted/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg"><BookOpen size={18} className="text-primary" /></div>
                    Add New Subject
                  </h2>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" onClick={() => setShowSubjectModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleCreateSubject} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subject Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required placeholder="e.g. Machine Learning, Spanish" autoFocus />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" placeholder="What is the goal of learning this?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Icon (Emoji)</label>
                        <input name="icon" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-lg text-center transition-all outline-none" defaultValue="📚" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme Color</label>
                        <div className="h-[52px] p-1.5 bg-background border border-border/60 rounded-xl overflow-hidden flex items-center justify-center">
                          <input name="color" type="color" className="w-full h-full p-0 border-0 cursor-pointer rounded-lg overflow-hidden bg-transparent" defaultValue="#a855f7" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowSessionModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-muted/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg"><Clock size={18} className="text-blue-500" /></div>
                    Log Manual Session
                  </h2>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" onClick={() => setShowSessionModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleLogSession} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">What did you work on? *</label>
                      <input name="activity" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required placeholder="e.g. Watched React Tutorial" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration (min) *</label>
                        <input name="duration" type="number" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required min="1" placeholder="45" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subject</label>
                        <div className="relative">
                          <select name="subjectId" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer">
                            <option value="">General</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" placeholder="Key takeaways or summary..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date</label>
                      <input name="date" type="date" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setShowSessionModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>
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
