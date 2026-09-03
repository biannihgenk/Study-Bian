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
    <div className="max-w-7xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl"><CalendarDays size={24} className="text-indigo-500" /></div>
            Calendar
          </h1>
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-md inline-block">
            {todayEvents.length} events scheduled for today
          </p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 shrink-0" 
          onClick={() => { setSelectedDate(todayStr); setShowModal(true); }}
        >
          <Plus size={16} /> New Event
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Calendar Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/60 rounded-[28px] p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground ml-2">{monthName}</h2>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
              <button className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground shadow-sm" onClick={prevMonth}><ChevronLeft size={20} /></button>
              <button className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground shadow-sm" onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 rounded-2xl bg-muted/10 border border-transparent" />
            ))}
            {days.map(day => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={day.date}
                onClick={() => handleDayClick(day.date)}
                className={`
                  min-h-[100px] p-2.5 rounded-2xl cursor-pointer transition-all border flex flex-col gap-1
                  ${day.isToday ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-inner' : 'bg-background border-border/40 hover:border-primary/30 hover:shadow-sm'}
                `}
              >
                <div className={`text-sm mb-1 ml-1 ${day.isToday ? 'font-black text-primary' : 'font-bold text-foreground/80'}`}>
                  {day.date}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden flex-1">
                  {day.events.slice(0, 3).map(e => (
                    <div key={e.id} className="text-[10px] font-bold px-2 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap" style={{ backgroundColor: `${e.color}15`, color: e.color }}>
                      {e.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-[10px] font-bold text-muted-foreground px-2 pt-0.5">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's Events Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border/60 rounded-[28px] p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Clock size={20} className="text-amber-500" /></div>
            <h3 className="text-lg font-bold">Today&apos;s Schedule</h3>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {todayEvents.length > 0 ? (
              todayEvents.map(e => {
                const start = new Date(e.startTime);
                const end = new Date(e.endTime);
                return (
                  <div key={e.id} className="group relative bg-background border border-border/40 hover:border-border p-4 rounded-2xl transition-all hover:shadow-sm">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full" style={{ backgroundColor: e.color }} />
                    <div className="pl-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold ${e.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {e.title}
                        </h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50 rounded-lg p-1 shrink-0 -mt-1 -mr-1">
                          <button className={`p-1 rounded-md transition-colors ${e.completed ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500 hover:bg-background'}`} onClick={() => handleToggle(e.id)}>
                            {e.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                          </button>
                          <button className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-background transition-colors" onClick={() => handleDelete(e.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Clock size={12} className="opacity-70" />
                        {start.getHours().toString().padStart(2, '0')}:{start.getMinutes().toString().padStart(2, '0')} – {end.getHours().toString().padStart(2, '0')}:{end.getMinutes().toString().padStart(2, '0')}
                      </div>
                      
                      {e.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 pl-4 border-l border-border/50">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <CalendarDays size={24} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Your day is clear</p>
                <p className="text-xs text-muted-foreground">No events scheduled for today.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-muted/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg"><CalendarDays size={18} className="text-indigo-500" /></div>
                    Add New Event
                  </h2>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                
                <form action={handleCreate} className="flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Event Title *</label>
                      <input name="title" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required placeholder="What's happening?" autoFocus />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date *</label>
                      <input name="date" type="date" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required defaultValue={selectedDate || ''} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Start Time *</label>
                        <input name="startTime" type="time" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required defaultValue="09:00" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">End Time *</label>
                        <input name="endTime" type="time" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required defaultValue="10:00" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" placeholder="Add notes, location, or details..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                        <select name="category" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer">
                          {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Color Label</label>
                        <div className="h-[46px] p-1.5 bg-background border border-border/60 rounded-xl overflow-hidden flex items-center justify-center">
                          <input name="color" type="color" className="w-full h-full p-0 border-0 cursor-pointer rounded-lg overflow-hidden bg-transparent" defaultValue="#6366f1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50" disabled={loading}>
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
