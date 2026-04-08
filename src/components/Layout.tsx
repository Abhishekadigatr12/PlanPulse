import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, Flame } from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { cn } from './ProgressBar';

export const Layout: React.FC = () => {
  const { streak } = useStudyStore();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Nexus Learn</h1>
        </div>

        <div className="px-6 pb-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 flex items-center space-x-3 border border-orange-100 dark:border-orange-800/50">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{streak} Day Streak</p>
              <p className="text-xs text-orange-600/80 dark:text-orange-500/80">Keep it up!</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
              )
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                isActive || location.pathname.startsWith('/courses')
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
              )
            }
          >
            <BookOpen className="w-5 h-5" />
            <span>Study Tracker</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200 w-full transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
