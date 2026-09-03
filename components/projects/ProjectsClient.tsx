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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <FolderKanban size={24} className="text-violet-400" />
            </div>
            Projects
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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
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
                <motion.div key={proj.id} layout variants={itemVariants} className={`bg-white/5 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-violet-500/50 ring-2 ring-violet-500/20 lg:col-span-2 xl:col-span-3' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'}`}>
                  <div className="p-6 sm:p-8 cursor-pointer" onClick={() => setExpandedProject(isExpanded ? null : proj.id)}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/10 shrink-0">
                          <Rocket size={26} className="text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">{proj.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/[0.06] px-2 py-0.5 rounded-md inline-block mt-1">{proj.category}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : proj.status === 'In Development' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/5 text-gray-400 border-white/[0.06]'}`}>
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-gray-400"><LayoutDashboard size={14} /> Progress</span>
                        <span className="font-bold text-white">{proj.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 pt-1 font-medium">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-400" /> {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'No deadline'}</span>
                        <span>{proj.projectTasks.filter(t => t.completed).length}/{proj.projectTasks.length} Tasks</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/[0.06] bg-white/[0.02]">
                        <div className="p-6 sm:p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><FolderKanban size={14}/> Project Overview</h4>
                              <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] mb-5">
                                {proj.description || 'No detailed description.'}
                              </p>
                              
                              <div className="flex gap-4">
                                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                                  <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 tracking-wider">Start Date</div>
                                  <div className="text-sm font-semibold text-white">{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'Not set'}</div>
                                </div>
                                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                                  <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 tracking-wider">End Date</div>
                                  <div className="text-sm font-semibold text-white">{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Not set'}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><LayoutDashboard size={14}/> Tasks Board</span>
                                <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 rounded-md text-[10px] border border-violet-500/20">{proj.projectTasks.length} Total</span>
                              </h4>
                              
                              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[320px]">
                                <div className="p-3.5 border-b border-white/[0.06] flex gap-2.5 bg-white/[0.02]">
                                  <input className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 focus:border-violet-500/50 rounded-xl text-sm text-white transition-all outline-none placeholder-gray-500" placeholder="Add new task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask(proj.id)} />
                                  <button className="px-4 py-2 bg-violet-500 text-white font-bold rounded-xl text-sm hover:bg-violet-600 transition-colors" onClick={() => handleAddTask(proj.id)}>Add</button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                  {proj.projectTasks.length > 0 ? (
                                    <div className="flex flex-col gap-1.5">
                                      {proj.projectTasks.map(t => (
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
                                      <LayoutDashboard size={28} className="mb-3 opacity-30" />
                                      <span className="text-sm font-medium">No tasks mapped out yet.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-white/[0.06]">
                            <button className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-white/[0.06]" onClick={() => setEditingProject(proj)}>
                              <Edit3 size={16} /> Edit Settings
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-rose-500/20" onClick={() => handleDelete(proj.id)}>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
            <Rocket size={32} className="text-violet-500/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Launch a new project</h2>
          <p className="text-gray-400 max-w-md mb-8">Group tasks, track progress, and build something amazing step by step.</p>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-0.5 active:scale-95" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Project
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {(showModal || editingProject) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setShowModal(false); setEditingProject(null); }} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-xl"><Rocket size={18} className="text-violet-400" /></div>
                    {editingProject ? 'Edit Project' : 'New Project'}
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => { setShowModal(false); setEditingProject(null); }}><X size={18} /></button>
                </div>
                
                <form action={editingProject ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Project Name *</label>
                      <input name="name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required defaultValue={editingProject?.name || ''} placeholder="What are you building?" autoFocus />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" defaultValue={editingProject?.description || ''} placeholder="Brief summary of this project..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <input name="category" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" defaultValue={editingProject?.category || ''} placeholder="e.g. App Dev" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <div className="relative">
                          <select name="status" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingProject?.status || 'Idea'}>
                            {PROJECT_STATUSES.map(s => <option key={s} value={s} className="bg-[#0f0f11]">{s}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                        <input name="startDate" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingProject?.startDate?.split('T')[0] || ''} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target End Date</label>
                        <input name="endDate" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingProject?.endDate?.split('T')[0] || ''} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => { setShowModal(false); setEditingProject(null); }}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-violet-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:bg-violet-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
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
