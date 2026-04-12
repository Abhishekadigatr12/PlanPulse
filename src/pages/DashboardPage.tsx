import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function DashboardPage() {
  const { getCurrentUserData, getStreak } = useStore();
  const userData = getCurrentUserData();
  const streak = getStreak();

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">User data not available</h2>
        <p className="text-slate-500">Please sign in again to continue.</p>
      </div>
    );
  }

  const courses = userData.courses;
  const totalTopics = courses.reduce((acc, c) => acc + c.topics.length, 0);
  const totalItems = courses.reduce(
    (acc, c) => acc + c.topics.reduce((a, t) => a + t.items.length, 0),
    0
  );
  const completedItems = courses.reduce(
    (acc, c) =>
      acc +
      c.topics.reduce(
        (a, t) => a + t.items.filter((i) => i.completed).length,
        0
      ),
    0
  );

  const stats = [
    { label: 'Courses', value: courses.length, icon: '📚', color: 'from-blue-500 to-blue-600' },
    { label: 'Topics', value: totalTopics, icon: '📝', color: 'from-green-500 to-green-600' },
    { label: 'Completed', value: `${completedItems}/${totalItems}`, icon: '✅', color: 'from-purple-500 to-purple-600' },
    { label: 'Streak', value: `${streak} days`, icon: '🔥', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userData.courses.length > 0 ? 'Learner' : 'New Student'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg bg-linear-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Courses</h2>
          <Link
            to="/courses"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-slate-500 mb-4">No courses yet. Start your learning journey!</p>
            <Link
              to="/courses"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => {
              const completed = course.topics.reduce(
                (acc, t) => acc + t.items.filter((i) => i.completed).length,
                0
              );
              const total = course.topics.reduce((acc, t) => acc + t.items.length, 0);
              const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-slate-800 mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {course.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {course.topics.length} topics
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/courses"
          className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">➕</div>
          <h3 className="font-bold text-lg">Add Course</h3>
          <p className="text-blue-100 text-sm mt-1">Create a new learning path</p>
        </Link>

        <Link
          to="/resources"
          className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📤</div>
          <h3 className="font-bold text-lg">Share Resource</h3>
          <p className="text-green-100 text-sm mt-1">Upload and share materials</p>
        </Link>

        <Link
          to="/analytics"
          className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-bold text-lg">View Analytics</h3>
          <p className="text-purple-100 text-sm mt-1">Track your progress</p>
        </Link>
      </div>
    </div>
  );
}
