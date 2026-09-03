'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject, updateProject, deleteProject, createProjectTask, toggleProjectTask, deleteProjectTask } from '@/actions/projects';
import { Plus, X, FolderKanban, CheckCircle2, Circle, Trash2, Edit3, ChevronDown, Rocket, LayoutDashboard, Clock } from 'lucide-react';
import { PRIORITIES, PROJECT_STATUSES } from '@/lib/constants';

interface ProjTask { id: number; title: string; completed: boolean; order: number; }
interface Project {
  id: number; name: string; description: string; category: string; status: string;
  startDate: string | null; endDate: string | null; progress: number;
  projectTasks: ProjTask[];
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  const projects = initialProjects;
  const activeCount = projects.filter(p => ['In Development', 'Planning'].includes(p.status)).length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;

  async function handleCreate(formData: FormData) { setLoading(true); await createProject(formData); setShowModal(false); setLoading(false); }
  async function handleUpdate(formData: FormData) { if (!editingProject) return; setLoading(true); await updateProject(editingProject.id, formData); setEditingProject(null); setLoading(false); }
  async function handleDelete(id: number) { if (confirm('Delete this project?')) await deleteProject(id); }
  async function handleAddTask(projId: number) { if (!newTask.trim()) return; await createProjectTask(projId, newTask); setNewTask(''); }
  async function handleToggleTask(taskId: number) { await toggleProjectTask(taskId); }
  async function handleDeleteTask(taskId: number) { await deleteProjectTask(taskId); }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><FolderKanban size={24} className="text-blue-500" /></div>
            Projects
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
          <Plus size={16} /> New Project
        </button>
      </motion.div>

      {projects.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map(proj => {
              const isExpanded = expandedProject === proj.id;
              return (
                <motion.div key={proj.id} layout variants={itemVariants} className={`bg-card border rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all ${isExpanded ? 'border-primary/50 ring-4 ring-primary/5 lg:col-span-2 xl:col-span-3' : 'border-border/60 hover:border-primary/30'}`}>
                  <div className="p-6 cursor-pointer" onClick={() => setExpandedProject(isExpanded ? null : proj.id)}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/10">
                          <Rocket size={24} className="text-blue-500 drop-shadow-sm" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{proj.name}</h3>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{proj.category}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : proj.status === 'In Development' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border/50'}`}>
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                      {proj.description || 'No description provided.'}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><LayoutDashboard size={14} /> Progress</span>
                        <span className="font-bold text-foreground">{proj.progress}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'No deadline'}</span>
                        <span>{proj.projectTasks.filter(t => t.completed).length}/{proj.projectTasks.length} Tasks</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/50 bg-muted/5">
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Project Overview</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed bg-background p-4 rounded-xl border border-border/40 shadow-sm mb-4">
                                {proj.description || 'No detailed description.'}
                              </p>
                              
                              <div className="flex gap-4">
                                <div className="flex-1 bg-background border border-border/40 rounded-xl p-3 shadow-sm">
                                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Start Date</div>
                                  <div className="text-sm font-medium">{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'Not set'}</div>
                                </div>
                                <div className="flex-1 bg-background border border-border/40 rounded-xl p-3 shadow-sm">
                                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">End Date</div>
                                  <div className="text-sm font-medium">{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Not set'}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4 flex items-center justify-between">
                                Tasks Board
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px]">{proj.projectTasks.length} Total</span>
                              </h4>
                              
                              <div className="bg-background border border-border/40 rounded-xl shadow-sm overflow-hidden flex flex-col h-[300px]">
                                <div className="p-3 border-b border-border/40 flex gap-2">
                                  <input className="flex-1 px-3 py-1.5 bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-lg text-sm transition-all outline-none" placeholder="Add new task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask(proj.id)} />
                                  <button className="px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded-lg text-sm shadow-sm hover:bg-primary/90 transition-colors" onClick={() => handleAddTask(proj.id)}>Add</button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                  {proj.projectTasks.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                      {proj.projectTasks.map(t => (
                                        <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors group/task">
                                          <button onClick={() => handleToggleTask(t.id)} className={`shrink-0 transition-colors ${t.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'}`}>
                                            {t.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                          </button>
                                          <span className={`text-sm flex-1 transition-all ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>{t.title}</span>
                                          <button className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md opacity-0 group-hover/task:opacity-100 transition-all" onClick={() => handleDeleteTask(t.id)}>
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                                      <LayoutDashboard size={24} className="mb-2 opacity-20" />
                                      <span className="text-sm">No tasks mapped out yet.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/40">
                            <button className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors flex items-center gap-2" onClick={() => setEditingProject(proj)}>
                              <Edit3 size={16} /> Edit Settings
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2" onClick={() => handleDelete(proj.id)}>
                              <Trash2 size={16} /> Delete Project
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
            <Rocket size={40} className="text-blue-500/70" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Launch a new project</h2>
          <p className="text-muted-foreground max-w-md mb-8">Group tasks, track progress, and build something amazing step by step.</p>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Project
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {(showModal || editingProject) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => { setShowModal(false); setEditingProject(null); }} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-muted/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg"><Rocket size={18} className="text-blue-500" /></div>
                    {editingProject ? 'Edit Project' : 'New Project'}
                  </h2>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" onClick={() => { setShowModal(false); setEditingProject(null); }}><X size={18} /></button>
                </div>
                
                <form action={editingProject ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Project Name *</label>
                      <input name="name" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required defaultValue={editingProject?.name || ''} placeholder="What are you building?" autoFocus />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" defaultValue={editingProject?.description || ''} placeholder="Brief summary of this project..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                        <input name="category" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={editingProject?.category || ''} placeholder="e.g. App Dev" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
                        <div className="relative">
                          <select name="status" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer" defaultValue={editingProject?.status || 'Idea'}>
                            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Start Date</label>
                        <input name="startDate" type="date" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={editingProject?.startDate?.split('T')[0] || ''} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Target End Date</label>
                        <input name="endDate" type="date" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" defaultValue={editingProject?.endDate?.split('T')[0] || ''} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => { setShowModal(false); setEditingProject(null); }}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>
                      {loading ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
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
