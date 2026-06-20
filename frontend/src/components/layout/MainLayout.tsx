import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Home, LayoutDashboard, Users, BookOpen, User, Sun, Moon } from 'lucide-react';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home',      path: '/home',      icon: <Home size={22} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Groups',    path: '/groups',    icon: <Users size={22} /> },
    { name: 'Study',     path: '/study',     icon: <BookOpen size={22} /> },
    { name: 'Profile',   path: '/profile',   icon: <User size={22} /> },
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-60 border-r" style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Academia</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.username}</p>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/home' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                      isActive
                        ? 'bg-[#0f766e] text-white shadow-sm'
                        : 'hover:bg-[#cefad0] hover:text-[#0f766e]'
                    }`}
                    style={isActive ? {} : { color: 'var(--text-secondary)' }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Dark mode toggle + logout */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
          <button onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition text-sm font-medium hover:bg-[#cefad0] hover:text-[#0f766e]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition text-sm font-medium text-red-500 hover:bg-[#cefad0]"
          >
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
        <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto md:max-w-none md:px-8 md:py-6">
          <Outlet />
        </main>

        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around px-2 pt-2 pb-6 z-50"
          style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/home' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}
                className="flex flex-col items-center p-2 min-w-[52px]"
                style={{ color: isActive ? '#0f766e' : 'var(--text-muted)' }}
              >
                <div className={`p-1.5 rounded-xl mb-0.5 transition ${isActive ? 'bg-teal-50 dark:bg-teal-900/40' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
