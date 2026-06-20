import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, type DashboardResponse } from '../api/dashboardApi';
import {
  Flame, Play, Clock, Calendar, CheckCircle2, Trophy, Users, BookOpen,
} from 'lucide-react';

function fmtSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtAvg(seconds: number): string {
  return `avg ${fmtSeconds(seconds)}/day`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const StatCard = ({ icon, value, label, sub }: { icon: React.ReactNode; value: string; label: string; sub?: string }) => (
    <div className="rounded-2xl p-4 shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="mb-3">{icon}</div>
      <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-[10px] text-teal-600 font-medium mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto">
      <div className="mb-6 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{greeting}, {user?.username}</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Here's your progress today.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-2xl p-4 mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Hero Card */}
          <div className="bg-[#0f766e] rounded-2xl p-5 text-white mb-8 shadow-lg shadow-teal-900/20">
            <div className="flex items-center gap-2 text-teal-100 mb-3">
              <Flame size={16} />
              <span className="text-sm font-medium">{stats.currentStreakDays}-day streak</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-4xl font-bold mb-1">{fmtSeconds(stats.todaySeconds)}</div>
                <div className="text-teal-100 text-sm">studied today · {stats.sessionsCompletedToday} session{stats.sessionsCompletedToday !== 1 ? 's' : ''}</div>
              </div>
              <Link to="/study"
                className="bg-white/20 hover:bg-white/30 transition p-4 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                <Play fill="currentColor" size={20} />
                <span className="text-xs font-medium">Start</span>
              </Link>
            </div>
          </div>

          {/* Study Overview */}
          <div className="mb-8">
            <h2 className="text-xs font-bold tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>STUDY OVERVIEW</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><Clock size={16} /></div>} value={fmtSeconds(stats.weekSeconds)} label="This Week" sub={fmtAvg(stats.weekAverageSecondsPerDay)} />
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Calendar size={16} /></div>} value={fmtSeconds(stats.monthSeconds)} label="This Month" sub={fmtAvg(stats.monthAverageSecondsPerDay)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500"><CheckCircle2 size={16} /></div>} value={String(stats.sessionsCompletedToday)} label="Sessions Today" />
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><Users size={16} /></div>} value={String(stats.groupsJoined)} label="Groups Joined" />
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-4">
            <h2 className="text-xs font-bold tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>STATISTICS</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500"><Flame size={16} /></div>} value={`${stats.currentStreakDays} days`} label="Current Streak" />
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Trophy size={16} /></div>} value={`${stats.longestStreakDays} days`} label="Longest Streak" />
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><BookOpen size={16} /></div>} value={String(stats.totalSessions)} label="Total Sessions" />
              <StatCard icon={<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Clock size={16} /></div>} value={fmtSeconds(stats.totalSeconds)} label="Total Study Time" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
