import { useAuth } from '../context/AuthContext';
import { Mail, Settings, LogOut, Clock, BookOpen, Flame, X, Eye, EyeOff, ChevronRight, Sun, Moon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dashboardApi, type DashboardResponse } from '../api/dashboardApi';
import { userApi } from '../api/userApi';
import { useTheme } from '../context/ThemeContext';

function fmtSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-4">
      <div className="rounded-3xl p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--bg-card)' }}>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4 text-teal-600">
          <Check size={22} />
        </div>
        <p className="text-center font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Confirm Change</p>
        <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-medium border transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-medium bg-[#0f766e] text-white hover:bg-teal-800 transition">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Account Settings Modal ───────────────────────────────────────────────────
type SettingKey = 'username' | 'email' | 'password' | null;

function AccountSettingsModal({ currentUsername, currentEmail, onClose, onSaved }: {
  currentUsername: string;
  currentEmail: string;
  onClose: () => void;
  onSaved: (username: string, email: string) => void;
}) {
  const [active, setActive] = useState<SettingKey>(null);
  const [confirm, setConfirm] = useState<(() => Promise<void>) | null>(null);
  const [confirmMsg, setConfirmMsg] = useState('');

  // Username
  const [username, setUsername] = useState(currentUsername);
  // Email
  const [email, setEmail] = useState(currentEmail);
  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => {
    setActive(null); setError(''); setSuccess('');
    setUsername(currentUsername); setEmail(currentEmail);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  const askConfirm = (msg: string, fn: () => Promise<void>) => {
    setError('');
    setConfirmMsg(msg);
    setConfirm(() => fn);
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setLoading(true); setError('');
    try {
      await confirm();
      setSuccess('Saved successfully!');
      setTimeout(() => { setSuccess(''); setActive(null); }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setConfirm(null);
    }
  };

  const settings: { key: SettingKey; label: string; value: string }[] = [
    { key: 'username', label: 'Change Username', value: `@${currentUsername}` },
    { key: 'email',    label: 'Change Email',    value: currentEmail },
    { key: 'password', label: 'Change Password', value: '••••••••' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      {confirm && (
        <ConfirmDialog
          message={confirmMsg}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="rounded-3xl w-full max-w-md shadow-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
          {active ? (
            <button onClick={reset} className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ← Back
            </button>
          ) : (
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Account Settings</h2>
          )}
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        {/* List view */}
        {!active && (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {settings.map(s => (
              <button key={s.key} onClick={() => { setActive(s.key); setError(''); setSuccess(''); }}
                className="w-full flex items-center justify-between px-6 py-4 transition text-left hover:opacity-80">
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.value}</div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        )}

        {/* Change Username */}
        {active === 'username' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Username</h3>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
            {success && <p className="text-teal-700 text-sm bg-teal-50 p-3 rounded-xl">{success}</p>}
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>New Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={50}
                placeholder={currentUsername}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <button
              disabled={loading || username === currentUsername || username.length < 3}
              onClick={() => askConfirm(
                `Change your username to "@${username}"?`,
                async () => { const u = await userApi.updateProfile({ username }); onSaved(u.username, u.email); }
              )}
              className="w-full bg-[#0f766e] text-white py-3 rounded-xl font-medium hover:bg-teal-800 disabled:opacity-40 transition">
              Save Username
            </button>
          </div>
        )}

        {/* Change Email */}
        {active === 'email' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Email</h3>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
            {success && <p className="text-teal-700 text-sm bg-teal-50 p-3 rounded-xl">{success}</p>}
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>New Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={currentEmail}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <button
              disabled={loading || email === currentEmail || !email.includes('@')}
              onClick={() => askConfirm(
                `Change your email to "${email}"?`,
                async () => { const u = await userApi.updateProfile({ email }); onSaved(u.username, u.email); }
              )}
              className="w-full bg-[#0f766e] text-white py-3 rounded-xl font-medium hover:bg-teal-800 disabled:opacity-40 transition">
              Save Email
            </button>
          </div>
        )}

        {/* Change Password */}
        {active === 'password' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
            {success && <p className="text-teal-700 text-sm bg-teal-50 p-3 rounded-xl">{success}</p>}
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} minLength={8}
                  className="w-full border rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minimum 8 characters.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match.</p>
              )}
            </div>
            <button
              disabled={loading || !currentPw || newPw.length < 8 || newPw !== confirmPw}
              onClick={() => askConfirm(
                'Are you sure you want to change your password?',
                async () => { await userApi.changePassword({ currentPassword: currentPw, newPassword: newPw }); }
              )}
              className="w-full bg-[#0f766e] text-white py-3 rounded-xl font-medium hover:bg-teal-800 disabled:opacity-40 transition">
              Change Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, login, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [localUsername, setLocalUsername] = useState(user?.username ?? '');
  const [localEmail, setLocalEmail] = useState(user?.email ?? '');

  useEffect(() => { dashboardApi.get().then(setStats).catch(() => {}); }, []);
  useEffect(() => {
    setLocalUsername(user?.username ?? '');
    setLocalEmail(user?.email ?? '');
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleProfileSaved = (username: string, email: string) => {
    setLocalUsername(username);
    setLocalEmail(email);
    if (token) login({ username, email }, token);
  };

  return (
    <div className="p-4 md:p-0 max-w-lg mx-auto">
      {showSettings && (
        <AccountSettingsModal
          currentUsername={localUsername}
          currentEmail={localEmail}
          onClose={() => setShowSettings(false)}
          onSaved={handleProfileSaved}
        />
      )}

      <div className="mb-6 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account.</p>
      </div>

      {/* Avatar card */}
      <div className="rounded-[2rem] border p-6 mb-5 shadow-sm flex items-center gap-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="w-16 h-16 bg-[#0f766e] text-white rounded-full flex items-center justify-center font-bold text-2xl">
          {localUsername.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{localUsername}</h2>
          <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={13} /> {localEmail}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <Clock size={18} className="text-teal-600" />, value: fmtSeconds(stats.totalSeconds), label: 'Total time' },
            { icon: <Flame size={18} className="text-orange-500" />, value: `${stats.currentStreakDays}d`, label: 'Streak' },
            { icon: <BookOpen size={18} className="text-blue-500" />, value: String(stats.totalSessions), label: 'Sessions' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-4 text-center shadow-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Settings list */}
      <div className="rounded-[2rem] border shadow-sm mb-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {/* Account Settings */}
        <button onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-5 py-4 border-b transition text-left hover:opacity-80"
          style={{ borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg)' }}>
            <Settings size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="flex-1">
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Account Settings</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Username, email, password</div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-5 py-4 transition text-left hover:opacity-80">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg)' }}>
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--text-secondary)' }} />
              : <Moon size={16} style={{ color: 'var(--text-secondary)' }} />}
          </div>
          <div className="flex-1">
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Currently {theme === 'dark' ? 'dark' : 'light'} — tap to switch
            </div>
          </div>
          {/* Toggle pill */}
          <div className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#0f766e]' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </button>
      </div>

      {/* Sign out */}
      <button onClick={handleLogout}
        className="w-full border text-red-500 rounded-[1.5rem] p-4 flex items-center justify-center gap-2 font-medium hover:opacity-80 transition shadow-sm"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
