'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSession } from '@/actions/learning';
import { Play, Pause, RotateCcw, Check, X, Target, Zap, Clock } from 'lucide-react';
import { TIMER_PRESETS } from '@/lib/constants';

interface Props {
  subjects: Array<{ id: number; title: string }>;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function FocusClient({ subjects }: Props) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingMs, setRemainingMs] = useState(25 * 60 * 1000);
  const [showComplete, setShowComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const endTimeRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actualDurationRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = endTimeRef.current - now;
    if (remaining <= 0) {
      setRemainingMs(0);
      setTimerState('completed');
      setShowComplete(true);
      clearTimer();
    } else {
      setRemainingMs(remaining);
    }
  }, [clearTimer]);

  useEffect(() => {
    function handleVisibility() {
      if (timerState === 'running' && !document.hidden) {
        tick();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timerState, tick]);

  function selectPreset(mins: number) {
    setSelectedMinutes(mins);
    setRemainingMs(mins * 60 * 1000);
    setTimerState('idle');
    clearTimer();
  }

  function selectCustom() {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      setSelectedMinutes(mins);
      setRemainingMs(mins * 60 * 1000);
      setTimerState('idle');
      clearTimer();
    }
  }

  function start() {
    const duration = timerState === 'paused' ? pausedRemainingRef.current : selectedMinutes * 60 * 1000;
    endTimeRef.current = Date.now() + duration;
    actualDurationRef.current = selectedMinutes;
    setTimerState('running');
    clearTimer();
    intervalRef.current = setInterval(tick, 250);
  }

  function pause() {
    pausedRemainingRef.current = endTimeRef.current - Date.now();
    setTimerState('paused');
    clearTimer();
  }

  function reset() {
    setRemainingMs(selectedMinutes * 60 * 1000);
    setTimerState('idle');
    setShowComplete(false);
    clearTimer();
  }

  async function handleSaveSession(formData: FormData) {
    setLoading(true);
    formData.set('duration', actualDurationRef.current.toString());
    formData.set('date', new Date().toISOString());
    await createSession(formData);
    setShowComplete(false);
    setTimerState('idle');
    setRemainingMs(selectedMinutes * 60 * 1000);
    setLoading(false);
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const totalDuration = selectedMinutes * 60 * 1000;
  const progress = totalDuration > 0 ? ((totalDuration - remainingMs) / totalDuration) * 100 : 0;

  const size = 320;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto pb-10 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-xl"><Zap size={24} className="text-rose-500" /></div>
          Focus Mode
        </h1>
        <p className="text-muted-foreground font-medium">Deep work state. One task at a time.</p>
      </motion.div>

      {/* Timer Circle */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative mb-12 flex justify-center items-center group"
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${timerState === 'running' ? 'bg-rose-500 scale-110' : 'bg-transparent scale-100'}`} />
        
        <svg width={size} height={size} className="-rotate-90 relative z-10 filter drop-shadow-xl">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="currentColor" className={`${timerState === 'running' ? 'text-rose-500' : timerState === 'completed' ? 'text-emerald-500' : 'text-primary'}`}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="text-6xl font-black font-mono tracking-tighter text-foreground mb-2 drop-shadow-sm">
            {timeDisplay}
          </div>
          <div className={`text-sm font-bold uppercase tracking-widest ${timerState === 'running' ? 'text-rose-500 animate-pulse' : timerState === 'completed' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
            {timerState === 'idle' ? 'Ready to Focus' : timerState === 'running' ? 'Focusing...' : timerState === 'paused' ? 'Paused' : 'Session Complete! 🎉'}
          </div>
        </div>
      </motion.div>

      {/* Controls & Presets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
        <AnimatePresence mode="wait">
          {timerState === 'idle' ? (
            <motion.div key="presets" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col items-center gap-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {TIMER_PRESETS.map(mins => (
                  <button key={mins} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 ${selectedMinutes === mins ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/5'}`} onClick={() => selectPreset(mins)}>
                    {mins}m
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 items-center bg-card p-2 rounded-2xl border border-border/60 shadow-sm">
                <Clock size={16} className="text-muted-foreground ml-3" />
                <input type="number" min="1" max="180" placeholder="Custom" value={customMinutes} onChange={e => setCustomMinutes(e.target.value)} onKeyDown={e => e.key === 'Enter' && selectCustom()} className="w-20 px-2 py-1.5 bg-transparent text-sm font-bold outline-none text-center" />
                <span className="text-sm font-bold text-muted-foreground">min</span>
                <button className="px-4 py-1.5 bg-muted text-foreground font-bold text-sm rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors ml-2" onClick={selectCustom}>Set</button>
              </div>
              
              <button className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95" onClick={start}>
                <Play size={24} fill="currentColor" /> Start Focus Session
              </button>
            </motion.div>
          ) : (
            <motion.div key="controls" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-4 justify-center">
              {timerState === 'running' && (
                <>
                  <button className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-base shadow-lg hover:bg-amber-600 transition-all hover:-translate-y-0.5 active:scale-95" onClick={pause}>
                    <Pause size={20} fill="currentColor" /> Pause
                  </button>
                  <button className="flex items-center justify-center w-14 h-14 bg-card border border-border/60 text-muted-foreground rounded-2xl hover:bg-muted hover:text-foreground transition-all" onClick={reset}>
                    <RotateCcw size={20} />
                  </button>
                </>
              )}
              {timerState === 'paused' && (
                <>
                  <button className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg hover:bg-emerald-600 transition-all hover:-translate-y-0.5 active:scale-95" onClick={start}>
                    <Play size={20} fill="currentColor" /> Resume
                  </button>
                  <button className="flex items-center justify-center w-14 h-14 bg-card border border-border/60 text-muted-foreground rounded-2xl hover:bg-muted hover:text-foreground transition-all" onClick={reset}>
                    <RotateCcw size={20} />
                  </button>
                </>
              )}
              {timerState === 'completed' && !showComplete && (
                <button className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base shadow-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:scale-95" onClick={reset}>
                  <RotateCcw size={20} /> Start New Session
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Session Complete Modal */}
      <AnimatePresence>
        {showComplete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border/60 rounded-[28px] shadow-2xl w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-emerald-500/10">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Target size={20} /> Session Complete!
                  </h2>
                  <button className="p-2 text-emerald-600/50 hover:text-emerald-600 hover:bg-emerald-500/20 rounded-full transition-colors" onClick={() => { setShowComplete(false); reset(); }}><X size={18} /></button>
                </div>
                
                <form action={handleSaveSession} className="flex flex-col">
                  <div className="p-6 flex flex-col gap-5">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                      <div className="text-4xl font-black text-emerald-500 mb-1">{actualDurationRef.current} <span className="text-xl font-bold">min</span></div>
                      <div className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Focused Time</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">What did you accomplish? *</label>
                      <input name="activity" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none" required placeholder="e.g. Completed Chapter 4" autoFocus />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Link to Subject</label>
                      <select name="subjectId" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer">
                        <option value="">General (Uncategorized)</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Additional Notes</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none resize-y min-h-[80px]" placeholder="Any reflections or takeaways?" />
                    </div>
                  </div>
                  
                  <div className="p-5 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => { setShowComplete(false); reset(); }}>Skip</button>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-emerald-600 transition-all flex items-center gap-2" disabled={loading}>
                      <Check size={16} /> {loading ? 'Saving...' : 'Log Session'}
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
