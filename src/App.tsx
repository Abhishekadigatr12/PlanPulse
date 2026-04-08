import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { LoginPage } from './components/LoginPage';
import { useStudyStore } from './store/useStudyStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { updateStreak } = useStudyStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
