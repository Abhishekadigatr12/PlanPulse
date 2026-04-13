import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'DS' },
  { path: '/learn', label: 'Learn', icon: 'LE' },
  { path: '/courses', label: 'Courses', icon: 'CR' },
  { path: '/resources', label: 'Resources', icon: 'RS' },
  { path: '/analytics', label: 'Analytics', icon: 'AN' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { logout, getStreak } = useStore();
  const streak = getStreak();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          PlanPlus
        </h1>
        <p className="text-slate-400 text-sm mt-1">Learn • Notes • Share</p>
      </div>

      {/* Streak Badge */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3">
          <span className="text-2xl">St</span>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Streak</p>
            <p className="text-xl font-bold text-orange-400">{streak} days</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">User</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
