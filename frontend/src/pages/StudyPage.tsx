import { useEffect, useRef, useState } from 'react';
import { sessionApi, type SessionResponse } from '../api/sessionApi';
import { Timer, Play, Square, Coffee } from 'lucide-react';

type Phase = 'idle' | 'focus' | 'ended';

const PRESETS = {
  Pomodoro: { focus: 25, break: 5 },
  Custom: { focus: 30, break: 10 },
};

export default function StudyPage() {
  const [timerType, setTimerType] = useState<'Pomodoro' | 'Custom'>('Pomodoro');
  const [subject, setSubject] = useState('');
  const [focusMin, setFocusMin] = useState(PRESETS.Pomodoro.focus);
  const [breakMin, setBreakMin] = useState(PRESETS.Pomodoro.break);

  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.Pomodoro.focus * 60);
  const [elapsed, setElapsed] = useState(0);

  const [activeSession, setActiveSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Use a ref for the interval and a ref for the "secondsLeft" value
  // so the interval closure always has the latest value
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(secondsLeft);
  secondsRef.current = secondsLeft;
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  // When timer type changes (and idle), apply preset
  const handleTimerTypeChange = (t: 'Pomodoro' | 'Custom') => {
    if (phase !== 'idle') return;
    setTimerType(t);
    if (t === 'Pomodoro') {
      setFocusMin(PRESETS.Pomodoro.focus);
      setBreakMin(PRESETS.Pomodoro.break);
      setSecondsLeft(PRESETS.Pomodoro.focus * 60);
    } else {
      setFocusMin(PRESETS.Custom.focus);
      setBreakMin(PRESETS.Custom.break);
      setSecondsLeft(PRESETS.Custom.focus * 60);
    }
  };

  // Keep secondsLeft in sync when focusMin changes and idle
  useEffect(() => {
    if (phase === 'idle') setSecondsLeft(focusMin * 60);
  }, [focusMin, phase]);

  // Restore active session on mount
  useEffect(() => {
    sessionApi.getActive().then(s => {
      if (s) {
        setActiveSession(s);
        const plannedSecs = s.plannedStudySeconds ?? focusMin * 60;
        const started = new Date(s.startedAt).getTime();
        const elapsedSoFar = Math.floor((Date.now() - started) / 1000);
        const left = Math.max(plannedSecs - elapsedSoFar, 0);
        setSecondsLeft(left);
        setElapsed(elapsedSoFar);
        setPhase(left > 0 ? 'focus' : 'ended');
        if (left > 0) startCountdown();
      }
    }).catch(() => {});

    return () => stopCountdown();
  }, []);

  function startCountdown() {
    stopCountdown();
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          stopCountdown();
          setPhase('ended');
          return 0;
        }
        return prev - 1;
      });
      setElapsed(prev => prev + 1);
    }, 1000);
  }

  function stopCountdown() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handleStart = async () => {
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const session = await sessionApi.start({
        sessionType: timerType === 'Pomodoro' ? 'POMODORO' : 'CUSTOM',
        plannedStudySeconds: focusMin * 60,
        plannedBreakSeconds: breakMin * 60,
      });
      setActiveSession(session);
      setSecondsLeft(focusMin * 60);
      setElapsed(0);
      setPhase('focus');
      startCountdown();
    } catch {
      setError('Failed to start session. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async (status: 'COMPLETED' | 'ABANDONED') => {
    if (!activeSession) return;
    setLoading(true); setError('');
    stopCountdown();
    try {
      await sessionApi.end(activeSession.id, {
        actualSecondsStudied: elapsedRef.current,
        endStatus: status,
      });
      setActiveSession(null);
      setPhase('idle');
      setSecondsLeft(focusMin * 60);
      setElapsed(0);
      setSuccessMsg(status === 'COMPLETED' ? '✓ Session completed! Great work.' : 'Session ended.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setError('Failed to end session.');
    } finally {
      setLoading(false);
    }
  };

  // SVG ring
  const totalSecs = focusMin * 60;
  const progress = phase === 'idle' ? 0 : Math.max(0, Math.min(1, (totalSecs - secondsLeft) / totalSecs));
  const r = 116;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const phaseColor = phase === 'focus' ? 'bg-teal-50 text-teal-700'
    : phase === 'ended' ? 'bg-amber-50 text-amber-700'
    : 'bg-slate-100 text-slate-500';

  const phaseLabel = phase === 'focus' ? 'Focus time'
    : phase === 'ended' ? "Time's up!"
    : 'Ready';

  const isRunning = phase === 'focus';
  const canEdit = phase === 'idle';

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto">
      <div className="mb-6 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Study</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Focus and track your sessions.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-2xl p-4 mb-4 text-sm">{error}</div>}
      {successMsg && <div className="bg-teal-50 text-teal-700 rounded-2xl p-4 mb-4 text-sm">{successMsg}</div>}

      {/* Timer card */}
      <div className="rounded-3xl border shadow-sm mb-4 overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {/* Mode tabs */}
        <div className="flex border-b p-1.5" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          {(['Pomodoro', 'Custom'] as const).map(t => (
            <button key={t} onClick={() => handleTimerTypeChange(t)}
              disabled={!canEdit}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${!canEdit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                background: timerType === t ? 'var(--bg-card)' : 'transparent',
                color: timerType === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: timerType === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t === 'Pomodoro' ? <Timer size={15} /> : <Coffee size={15} />} {t}
            </button>
          ))}
        </div>

        {/* Ring + clock */}
        <div className="p-8 flex flex-col items-center">
          <div className={`text-xs font-medium px-3 py-1 rounded-full mb-8 ${phaseColor}`}>
            {phaseLabel}
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r={r} stroke="#e2e8f0" strokeWidth="14" fill="transparent" />
              <circle
                cx="128" cy="128" r={r}
                stroke={phase === 'ended' ? '#f59e0b' : '#0f766e'}
                strokeWidth="14" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-6xl font-bold tracking-tight font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>{mm}:{ss}</div>
              {subject && <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{subject}</div>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            {canEdit && (
              <button onClick={handleStart} disabled={loading}
                className="flex-1 bg-[#0f766e] disabled:opacity-60 hover:bg-teal-800 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition shadow-sm">
                <Play fill="currentColor" size={18} /> {loading ? 'Starting…' : 'Start'}
              </button>
            )}
            {isRunning && (
              <>
                <button onClick={() => handleEnd('COMPLETED')} disabled={loading}
                  className="flex-1 bg-[#0f766e] disabled:opacity-60 hover:bg-teal-800 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition">
                  <Square fill="currentColor" size={16} /> {loading ? '…' : 'Complete'}
                </button>
                <button onClick={() => handleEnd('ABANDONED')} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  End
                </button>
              </>
            )}
            {phase === 'ended' && (
              <button onClick={() => handleEnd('COMPLETED')} disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition">
                <Square fill="currentColor" size={16} /> {loading ? '…' : 'Save & Finish'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings card */}
      <div className="rounded-3xl border p-6 shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Session Settings</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Subject <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            type="text" value={subject} onChange={e => setSubject(e.target.value)}
            disabled={!canEdit}
            placeholder="e.g. Organic Chemistry"
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', opacity: canEdit ? 1 : 0.5 }}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Focus (min)</label>
            <input
              type="number" min={1} max={120} value={focusMin}
              onChange={e => setFocusMin(Math.max(1, Number(e.target.value)))}
              disabled={!canEdit || timerType === 'Pomodoro'}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', opacity: (!canEdit || timerType === 'Pomodoro') ? 0.5 : 1 }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Break (min)</label>
            <input
              type="number" min={1} max={60} value={breakMin}
              onChange={e => setBreakMin(Math.max(1, Number(e.target.value)))}
              disabled={!canEdit || timerType === 'Pomodoro'}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)', opacity: (!canEdit || timerType === 'Pomodoro') ? 0.5 : 1 }}
            />
          </div>
        </div>
        {timerType === 'Pomodoro' && canEdit && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Pomodoro uses fixed 25 min focus / 5 min break. Switch to <strong>Custom</strong> to set your own times.
          </p>
        )}
      </div>
    </div>
  );
}
