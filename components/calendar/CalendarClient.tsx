'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScheduleEvent, deleteScheduleEvent, completeScheduleEvent } from '@/actions/schedule';
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, CalendarDays, Clock, MapPin, AlignLeft } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/lib/constants';

interface ScheduleEvent {
  id: number; title: string; description: string; startTime: string; endTime: string;
  date: string; category: string; color: string; completed: boolean;
}

export default function CalendarClient({ initialEvents }: { initialEvents: ScheduleEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const events = initialEvents;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: Array<{ date: number; isToday: boolean; events: ScheduleEvent[] }> = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    d.setHours(0, 0, 0, 0);
    const dayEvents = events.filter(e => {
      const ed = new Date(e.date);
      ed.setHours(0, 0, 0, 0);
      return ed.getTime() === d.getTime();
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    days.push({ date: i, isToday: d.getTime() === today.getTime(), events: dayEvents });
  }

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function handleDayClick(day: number) {
    const d = new Date(Date.UTC(year, month, day));
    setSelectedDate(d.toISOString().split('T')[0]);
    setShowModal(true);
  }

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createScheduleEvent(formData);
    setShowModal(false);
    setLoading(false);
  }

  async function handleToggle(id: number) { await completeScheduleEvent(id); }
  async function handleDelete(id: number) { if (confirm('Delete this event?')) await deleteScheduleEvent(id); }

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const todayStr = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().split('T')[0];
  const todayEvents = events.filter(e => {
    const ed = new Date(e.date);
    ed.setHours(0, 0, 0, 0);
    return ed.getTime() === today.getTime();
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <CalendarDays size={24} className="text-indigo-400" />
            </div>
            Calendar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-lg inline-block">
            <strong className="text-white">{todayEvents.length}</strong> events scheduled for today
          </p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
          onClick={() => { setSelectedDate(todayStr); setShowModal(true); }}
        >
          <Plus size={16} /> New Event
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Calendar Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white ml-2">{monthName}</h2>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] p-1.5 rounded-xl">
              <button className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors text-gray-400 hover:text-white shadow-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
              <button className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors text-gray-400 hover:text-white shadow-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 rounded-2xl bg-white/[0.02] border border-transparent" />
            ))}
            {days.map(day => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={day.date}
                onClick={() => handleDayClick(day.date)}
                className={`
                  min-h-[100px] p-2.5 rounded-2xl cursor-pointer transition-all border flex flex-col gap-1.5
                  ${day.isToday ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05]'}
                `}
              >
                <div className={`text-sm mb-1 ml-1 ${day.isToday ? 'font-black text-indigo-400' : 'font-bold text-gray-300'}`}>
                  {day.date}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden flex-1">
                  {day.events.slice(0, 3).map(e => (
                    <div key={e.id} className="text-[10px] font-bold px-2 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap border border-white/[0.04]" style={{ backgroundColor: `${e.color}20`, color: e.color }}>
                      {e.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                     <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 px-2 pt-0.5">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's Events Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><Clock size={20} className="text-indigo-400" /></div>
            <h3 className="text-lg font-bold text-white">Today&apos;s Schedule</h3>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {todayEvents.length > 0 ? (
              todayEvents.map(e => {
                const start = new Date(e.startTime);
                const end = new Date(e.endTime);
                return (
                  <div key={e.id} className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] p-4 rounded-2xl transition-all">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full opacity-80 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: e.color, color: e.color }} />
                    <div className="pl-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold ${e.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {e.title}
                        </h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/[0.04] border border-white/[0.06] rounded-lg p-1 shrink-0 -mt-1 -mr-1">
                          <button className={`p-1.5 rounded-md transition-colors ${e.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400 hover:bg-white/5'}`} onClick={() => handleToggle(e.id)}>
                            {e.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                          </button>
                          <button className="p-1.5 rounded-md text-gray-500 hover:text-rose-400 hover:bg-white/5 transition-colors" onClick={() => handleDelete(e.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Clock size={12} className="opacity-70 text-indigo-400" />
                        {start.getHours().toString().padStart(2, '0')}:{start.getMinutes().toString().padStart(2, '0')} – {end.getHours().toString().padStart(2, '0')}:{end.getMinutes().toString().padStart(2, '0')}
                      </div>
                      
                      {e.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-2 pl-3 border-l-2 border-white/10 bg-white/[0.02] p-2 rounded-r-lg">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <CalendarDays size={24} className="text-gray-500" />
                </div>
                <p className="text-sm font-bold text-gray-300 mb-1">Your day is clear</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">No events scheduled for today.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-white/10 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl"><CalendarDays size={18} className="text-indigo-400" /></div>
                    Add New Event
                  </h2>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Event Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required placeholder="What's happening?" autoFocus />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Date *</label>
                      <input name="date" type="date" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" required defaultValue={selectedDate || ''} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Start Time *</label>
                        <input name="startTime" type="time" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" required defaultValue="09:00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">End Time *</label>
                        <input name="endTime" type="time" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none [color-scheme:dark]" required defaultValue="10:00" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" placeholder="Add notes, location, or details..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <select name="category" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer">
                          {EVENT_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0f0f11]">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Color Label</label>
                        <div className="h-[46px] p-1.5 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-xl overflow-hidden flex items-center justify-center transition-colors">
                          <input name="color" type="color" className="w-full h-full p-0 border-0 cursor-pointer rounded-lg overflow-hidden bg-transparent" defaultValue="#6366f1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95" disabled={loading}>
                      {loading ? 'Scheduling...' : 'Schedule Event'}
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
