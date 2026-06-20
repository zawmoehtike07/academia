import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { groupApi } from '../api/groupApi';
import { Clock, Users } from 'lucide-react';

function fmtSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todaySecs, setTodaySecs] = useState<number | null>(null);
  const [groupCount, setGroupCount] = useState<number | null>(null);

  useEffect(() => {
    dashboardApi.get().then(d => {
      setTodaySecs(d.todaySeconds);
    }).catch(() => {});
    groupApi.getMyGroups().then(gs => setGroupCount(gs.length)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const cards = [
    {
      title: 'Dashboard',
      subtitle: todaySecs !== null ? `${fmtSeconds(todaySecs)} today` : 'View stats',
      icon: <Clock size={32} className="text-teal-600" />,
      path: '/dashboard',
    },
    {
      title: 'Groups',
      subtitle: groupCount !== null ? `${groupCount} group${groupCount !== 1 ? 's' : ''} joined` : 'Study together',
      icon: <Users size={32} className="text-blue-500" />,
      path: '/groups',
    },
    {
      title: 'Study',
      subtitle: 'Start a focus session',
      icon: (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Mini pomodoro clock */}
          <svg viewBox="0 0 48 48" className="w-12 h-12">
            <circle cx="24" cy="24" r="20" stroke="#0f766e" strokeWidth="3" fill="none" />
            <circle cx="24" cy="24" r="20" stroke="#ccfbf1" strokeWidth="3" fill="none"
              strokeDasharray="125.6" strokeDashoffset="31.4" strokeLinecap="round"
              className="opacity-60" style={{ transform: 'rotate(-90deg)', transformOrigin: '24px 24px' }} />
            <text x="24" y="29" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f766e" fontFamily="monospace">25:00</text>
          </svg>
        </div>
      ),
      path: '/study',
    },
    {
      title: 'Profile',
      subtitle: user?.username ?? 'Your account',
      icon: (
        <div className="w-10 h-10 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-xl">
          {user?.username?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      ),
      path: '/profile',
    },
  ];

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="mt-6 mb-8">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          {greeting},<br />
          <span className="text-[#0f766e]">{user?.username}</span> 👋
        </h1>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map(card => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="flex flex-col items-start p-5 rounded-3xl border text-left transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="mb-4">{card.icon}</div>
            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{card.title}</div>
            <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Quick tip */}
      <div className="mt-6 rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>TIP</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Use the Study timer to track focused work. Complete sessions count toward your daily streak!
        </p>
      </div>
    </div>
  );
}
