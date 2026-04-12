import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sidebar } from './Sidebar';

export function Layout() {
  const { auth } = useStore();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
