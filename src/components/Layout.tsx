import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sidebar } from './Sidebar';

export function Layout() {
  const { auth, markCurrentUserOnline, markCurrentUserOffline } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser) return;

    markCurrentUserOnline();
    const heartbeatId = window.setInterval(() => {
      markCurrentUserOnline();
    }, 30000);

    const onFocus = () => markCurrentUserOnline();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markCurrentUserOnline();
      }
    };
    const onBeforeUnload = () => markCurrentUserOffline();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      markCurrentUserOffline();
    };
  }, [auth.isAuthenticated, auth.currentUser, markCurrentUserOnline, markCurrentUserOffline]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="md:ml-64 p-4 md:p-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div className="md:hidden h-12"></div>
        <Outlet />
      </main>
    </div>
  );
}
