'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask, completeTask, deleteTask, updateTask } from '@/actions/tasks';
import {
  Plus, Search, CheckCircle2, Circle, Trash2, Edit3,
  Clock, X, LayoutList, Target, Trophy, FolderKanban, ChevronDown
} from 'lucide-react';
import { TASK_CATEGORIES, PRIORITIES, TASK_STATUSES } from '@/lib/constants';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  deadline: string | null;
  category: string;
  estimatedTime: number;
  status: string;
  completedAt: string | null;
  goalId: number | null;
  competitionId: number | null;
  projectId: number | null;
}

interface Props {
  initialTasks: Task[];
  goals: Array<{ id: number; title: string }>;
  competitions: Array<{ id: number; title: string }>;
  projects: Array<{ id: number; title: string }>;
}

export default function TasksClient({ initialTasks, goals, competitions, projects }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const tasks = initialTasks;

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const todoCount = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createTask(formData);
    setShowModal(false);
    setLoading(false);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingTask) return;
    setLoading(true);
    await updateTask(editingTask.id, formData);
    setEditingTask(null);
    setLoading(false);
  }

  async function handleToggle(id: number) {
    await completeTask(id);
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <LayoutList size={24} className="text-blue-400" />
            </div>
            Tasks
          </h1>
          <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            <span className="text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg">
              <strong className="text-white">{todoCount}</strong> todo
            </span>
            <span className="text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg">
              <strong className="text-white">{inProgressCount}</strong> in progress
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <strong className="font-bold">{completedCount}</strong> completed
            </span>
          </div>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Add Task
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 mb-8 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white placeholder-gray-500 transition-all focus:outline-none"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select 
            className="w-full sm:w-auto py-2.5 pl-4 pr-10 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-white transition-colors focus:outline-none cursor-pointer appearance-none" 
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All" className="bg-[#0f0f11]">All Status</option>
            {TASK_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0f0f11]">{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            className="w-full sm:w-auto py-2.5 pl-4 pr-10 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-white transition-colors focus:outline-none cursor-pointer appearance-none" 
            value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All" className="bg-[#0f0f11]">All Priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0f0f11]">{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            className="w-full sm:w-auto py-2.5 pl-4 pr-10 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-white transition-colors focus:outline-none cursor-pointer appearance-none" 
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All" className="bg-[#0f0f11]">All Categories</option>
            {TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0f0f11]">{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Task List */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
            <AnimatePresence>
              {filtered.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={`
                    group bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center gap-4
                    ${task.status === 'Completed' ? 'opacity-50 hover:opacity-100' : 'hover:bg-white/[0.07] hover:border-white/20'}
                  `}
                >
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`shrink-0 transition-colors ${task.status === 'Completed' ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}
                    aria-label={task.status === 'Completed' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.status === 'Completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className={`text-base font-semibold mb-1.5 truncate transition-colors ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white group-hover:text-blue-400'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/[0.06]">
                        {task.category}
                      </span>
                      {task.deadline && (
                        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${new Date(task.deadline) < new Date() && task.status !== 'Completed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-gray-400 border border-white/[0.06]'}`}>
                          <Clock size={11} />
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {task.estimatedTime > 0 && (
                        <span className="text-[11px] font-medium text-gray-500">
                          ~{task.estimatedTime}m
                        </span>
                      )}
                      {(task.goalId || task.projectId || task.competitionId) && (
                        <span className="text-[11px] text-gray-600 px-1 hidden sm:inline-block">|</span>
                      )}
                      {task.goalId && <Target size={12} className="text-amber-400 opacity-70" aria-label="Linked to Goal" />}
                      {task.projectId && <FolderKanban size={12} className="text-violet-400 opacity-70" aria-label="Linked to Project" />}
                      {task.competitionId && <Trophy size={12} className="text-rose-400 opacity-70" aria-label="Linked to Competition" />}
                    </div>
                  </div>

                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${getPriorityColor(task.priority)}`} title={`Priority: ${task.priority}`} />

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      onClick={() => setEditingTask(task)}
                      aria-label="Edit task"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      onClick={() => handleDelete(task.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-emerald-500/40" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {search || filterStatus !== 'All' || filterPriority !== 'All' ? 'No matching tasks' : 'Semua Selesai! 🎉'}
            </h2>
            <p className="text-gray-400 max-w-sm mb-8 text-sm">
              {search || filterStatus !== 'All' ? 'Coba sesuaikan filter pencarianmu.' : 'Tidak ada task yang tersisa. Waktunya istirahat atau buat task baru!'}
            </p>
            {!search && filterStatus === 'All' && (
              <button 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 border border-white/[0.06]" 
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} /> Tambah Task Baru
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(showModal || editingTask) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
              onClick={() => { setShowModal(false); setEditingTask(null); }} 
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div 
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[560px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl"><LayoutList size={18} className="text-blue-400" /></div>
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <button 
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" 
                    onClick={() => { setShowModal(false); setEditingTask(null); }}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <form action={editingTask ? handleUpdate : handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-title">Title *</label>
                      <input id="task-title" name="title" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required defaultValue={editingTask?.title || ''} placeholder="What needs to be done?" autoFocus />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-desc">Description</label>
                      <textarea id="task-desc" name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" defaultValue={editingTask?.description || ''} placeholder="Add details..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-priority">Priority</label>
                        <div className="relative">
                          <select id="task-priority" name="priority" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingTask?.priority || 'Medium'}>
                            {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0f0f11]">{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-category">Category</label>
                        <div className="relative">
                          <select id="task-category" name="category" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer" defaultValue={editingTask?.category || 'Personal'}>
                            {TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0f0f11]">{c}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-deadline">Deadline</label>
                        <input id="task-deadline" name="deadline" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" defaultValue={editingTask?.deadline ? editingTask.deadline.split('T')[0] : ''} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-time">Estimated time (min)</label>
                        <input id="task-time" name="estimatedTime" type="number" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" min="0" defaultValue={editingTask?.estimatedTime || ''} placeholder="30" />
                      </div>
                    </div>

                    {editingTask && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4" htmlFor="task-status">Status</label>
                        <div className="relative">
                          <select id="task-status" name="status" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer font-bold" defaultValue={editingTask.status}>
                            {TASK_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0f0f11]">{s}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    )}
                    
                    {!editingTask && (goals.length > 0 || competitions.length > 0 || projects.length > 0) && (
                      <div className="pt-4 border-t border-white/[0.06] space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Link to existing items (Optional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {goals.length > 0 && (
                            <div className="relative">
                              <select name="goalId" className="w-full pl-8 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.06] focus:border-amber-500/50 rounded-xl text-xs text-white transition-all outline-none appearance-none cursor-pointer">
                                <option value="" className="bg-[#0f0f11]">No Goal</option>
                                {goals.map((g) => <option key={g.id} value={g.id} className="bg-[#0f0f11]">{g.title}</option>)}
                              </select>
                              <Target size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                          )}
                          {competitions.length > 0 && (
                            <div className="relative">
                              <select name="competitionId" className="w-full pl-8 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.06] focus:border-rose-500/50 rounded-xl text-xs text-white transition-all outline-none appearance-none cursor-pointer">
                                <option value="" className="bg-[#0f0f11]">No Comp</option>
                                {competitions.map((c) => <option key={c.id} value={c.id} className="bg-[#0f0f11]">{c.title}</option>)}
                              </select>
                              <Trophy size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                          )}
                          {projects.length > 0 && (
                            <div className="relative">
                              <select name="projectId" className="w-full pl-8 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.06] focus:border-violet-500/50 rounded-xl text-xs text-white transition-all outline-none appearance-none cursor-pointer">
                                <option value="" className="bg-[#0f0f11]">No Project</option>
                                {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#0f0f11]">{p.title}</option>)}
                              </select>
                              <FolderKanban size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none" />
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => { setShowModal(false); setEditingTask(null); }}>
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50" disabled={loading}>
                      {loading ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
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
