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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Zap size={24} className="text-rose-400" />
          </div>
          Focus Mode
        </h1>
        <p className="text-gray-400 font-medium">Deep work state. One task at a time.</p>
      </motion.div>

      {/* Timer Circle */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative mb-16 flex justify-center items-center group"
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-[60px] opacity-[0.15] transition-all duration-1000 ${timerState === 'running' ? 'bg-rose-500 scale-125 opacity-30' : timerState === 'completed' ? 'bg-emerald-500 scale-110' : 'bg-transparent scale-100'}`} />
        
        <svg width={size} height={size} className="-rotate-90 relative z-10 filter drop-shadow-2xl">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-white/5" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="currentColor" className={`${timerState === 'running' ? 'text-rose-500' : timerState === 'completed' ? 'text-emerald-500' : 'text-rose-500/50'}`}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white mb-2 drop-shadow-lg">
            {timeDisplay}
          </div>
          <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${timerState === 'running' ? 'text-rose-400 animate-pulse' : timerState === 'completed' ? 'text-emerald-400' : 'text-gray-500'}`}>
            {timerState === 'idle' ? 'Ready to Focus' : timerState === 'running' ? 'Focusing...' : timerState === 'paused' ? 'Paused' : 'Session Complete! 🎉'}
          </div>
        </div>
      </motion.div>

      {/* Controls & Presets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {timerState === 'idle' ? (
            <motion.div key="presets" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col items-center gap-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {TIMER_PRESETS.map(mins => (
                  <button key={mins} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-1 active:scale-95 ${selectedMinutes === mins ? 'bg-rose-500 text-white shadow-[0_4px_20px_rgba(244,63,94,0.3)]' : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-rose-500/50 hover:bg-white/10 hover:text-rose-400'}`} onClick={() => selectPreset(mins)}>
                    {mins}m
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 items-center bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 shadow-sm transition-all hover:border-white/20">
                <Clock size={16} className="text-gray-400 ml-3" />
                <input type="number" min="1" max="180" placeholder="Custom" value={customMinutes} onChange={e => setCustomMinutes(e.target.value)} onKeyDown={e => e.key === 'Enter' && selectCustom()} className="w-24 px-2 py-1.5 bg-transparent text-white text-sm font-bold outline-none text-center placeholder-gray-600" />
                <span className="text-sm font-bold text-gray-500 mr-2">min</span>
                <button className="px-5 py-2 bg-white/10 text-white font-bold text-sm rounded-xl hover:bg-rose-500 transition-colors" onClick={selectCustom}>Set</button>
              </div>
              
              <button className="flex items-center gap-3 px-12 py-5 bg-rose-500 text-white rounded-3xl font-black text-lg shadow-[0_4px_25px_rgba(244,63,94,0.4)] hover:bg-rose-600 transition-all hover:-translate-y-1 active:scale-95 mt-4" onClick={start}>
                <Play size={24} fill="currentColor" /> Start Focus Session
              </button>
            </motion.div>
          ) : (
            <motion.div key="controls" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-4 justify-center">
              {timerState === 'running' && (
                <>
                  <button className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-white rounded-3xl font-bold text-lg shadow-[0_4px_25px_rgba(245,158,11,0.4)] hover:bg-amber-600 transition-all hover:-translate-y-1 active:scale-95" onClick={pause}>
                    <Pause size={22} fill="currentColor" /> Pause
                  </button>
                  <button className="flex items-center justify-center w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 rounded-3xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:-translate-y-1 active:scale-95" onClick={reset}>
                    <RotateCcw size={22} />
                  </button>
                </>
              )}
              {timerState === 'paused' && (
                <>
                  <button className="flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-3xl font-bold text-lg shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95" onClick={start}>
                    <Play size={22} fill="currentColor" /> Resume
                  </button>
                  <button className="flex items-center justify-center w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 rounded-3xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:-translate-y-1 active:scale-95" onClick={reset}>
                    <RotateCcw size={22} />
                  </button>
                </>
              )}
              {timerState === 'completed' && !showComplete && (
                <button className="flex items-center gap-3 px-10 py-5 bg-rose-500 text-white rounded-3xl font-bold text-lg shadow-[0_4px_25px_rgba(244,63,94,0.4)] hover:bg-rose-600 transition-all hover:-translate-y-1 active:scale-95" onClick={reset}>
                  <RotateCcw size={22} /> Start New Session
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0f0f11] border border-emerald-500/20 rounded-[32px] shadow-[0_10px_50px_rgba(16,185,129,0.2)] w-full max-w-[500px] overflow-hidden pointer-events-auto flex flex-col relative">
                {/* Modal Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-emerald-500/10 relative z-10">
                  <h2 className="text-lg font-bold flex items-center gap-3 text-emerald-400">
                    <div className="p-2 bg-emerald-500/20 rounded-xl"><Target size={20} className="text-emerald-400" /></div>
                    Session Complete!
                  </h2>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" onClick={() => { setShowComplete(false); reset(); }}><X size={18} /></button>
                </div>
                
                <form action={handleSaveSession} className="flex flex-col relative z-10">
                  <div className="p-6 flex flex-col gap-6">
                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(16,185,129,0.05)_25%,transparent_25%,transparent_50%,rgba(16,185,129,0.05)_50%,rgba(16,185,129,0.05)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]" />
                      <div className="relative z-10 text-5xl font-black text-emerald-400 mb-2">{actualDurationRef.current} <span className="text-2xl font-bold">min</span></div>
                      <div className="relative z-10 text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Focused Time</div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">What did you accomplish? *</label>
                      <input name="activity" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-emerald-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none" required placeholder="e.g. Completed Chapter 4" autoFocus />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Link to Subject</label>
                      <select name="subjectId" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-emerald-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none appearance-none cursor-pointer">
                        <option value="" className="bg-[#0f0f11]">General (Uncategorized)</option>
                        {subjects.map(s => <option key={s.id} value={s.id} className="bg-[#0f0f11]">{s.title}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Notes</label>
                      <textarea name="description" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] focus:border-emerald-500/50 focus:bg-white/[0.05] rounded-xl text-sm text-white transition-all outline-none resize-y min-h-[80px]" placeholder="Any reflections or takeaways?" />
                    </div>
                  </div>
                  
                  <div className="p-5 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => { setShowComplete(false); reset(); }}>Skip</button>
                    <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95" disabled={loading}>
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
