import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../store/useStore';
import type { Difficulty } from '../types';

export function AnalyticsPage() {
  const { getCurrentUserData, getProgressLogs, getPlatformStats } = useStore();
  const userData = getCurrentUserData();
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const platformStats = getPlatformStats();

  if (!userData) return null;

  const courses = userData.courses;
  const progressLogs = getProgressLogs(filter);

  // Course completion data for bar chart
  const courseData = courses.map((course) => {
    const completed = course.topics.reduce(
      (acc, t) => acc + t.items.filter((i) => i.completed).length,
      0
    );
    const total = course.topics.reduce((acc, t) => acc + t.items.length, 0);
    return {
      name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
      completed,
      pending: total - completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });

  // Difficulty distribution for pie chart
  const allItems = courses.flatMap((c) => c.topics.flatMap((t) => t.items));
  const difficultyData = [
    { name: 'Easy', value: allItems.filter((i) => i.difficulty === 'easy').length, color: '#22c55e' },
    { name: 'Medium', value: allItems.filter((i) => i.difficulty === 'medium').length, color: '#eab308' },
    { name: 'Hard', value: allItems.filter((i) => i.difficulty === 'hard').length, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: allItems.filter((i) => i.completed).length, color: '#22c55e' },
    { name: 'Pending', value: allItems.filter((i) => !i.completed).length, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  // Progress over time data
  const progressOverTime = progressLogs.map((log) => ({
    date: log.date.substring(5), // MM-DD format
    completed: log.completedCount,
  }));

  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) => i.completed).length;
  const overallProgress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const getDifficultyStats = (difficulty: Difficulty) => {
    const items = allItems.filter((i) => i.difficulty === difficulty);
    const completed = items.filter((i) => i.completed).length;
    return {
      total: items.length,
      completed,
      percentage: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    };
  };

  const easyStats = getDifficultyStats('easy');
  const mediumStats = getDifficultyStats('medium');
  const hardStats = getDifficultyStats('hard');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your learning progress</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Overall Progress</p>
          <p className="text-3xl font-bold text-slate-800">{overallProgress}%</p>
          <div className="mt-2 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-slate-800">{totalItems}</p>
          <p className="text-sm text-green-600 mt-2">{completedItems} completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Courses</p>
          <p className="text-3xl font-bold text-slate-800">{courses.length}</p>
          <p className="text-sm text-slate-500 mt-2">
            {courses.reduce((acc, c) => acc + c.topics.length, 0)} topics total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">Streak</p>
          <p className="text-3xl font-bold text-orange-500">{userData.streak} 🔥</p>
          <p className="text-sm text-slate-500 mt-2">Keep it going!</p>
        </div>
      </div>

      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Registered Users</p>
            <p className="text-3xl font-bold text-slate-800">{platformStats.totalUsers}</p>
            <p className="text-sm text-slate-500 mt-2">Total accounts in this app</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Online Now</p>
            <p className="text-3xl font-bold text-emerald-600">{platformStats.onlineUsersNow}</p>
            <p className="text-sm text-slate-500 mt-2">Users active right now</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Active Users (30d)</p>
            <p className="text-3xl font-bold text-slate-800">{platformStats.activeUsersLast30Days}</p>
            <p className="text-sm text-slate-500 mt-2">Users active in last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Users With Courses</p>
            <p className="text-3xl font-bold text-slate-800">{platformStats.usersWithCourses}</p>
            <p className="text-sm text-slate-500 mt-2">Accounts that created at least one course</p>
          </div>
        </div>
      )}

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 font-medium">Easy</span>
            <span className="text-2xl font-bold text-green-700">{easyStats.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${easyStats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-green-600 mt-2">
            {easyStats.completed}/{easyStats.total} completed
          </p>
        </div>

        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-700 font-medium">Medium</span>
            <span className="text-2xl font-bold text-yellow-700">{mediumStats.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full"
              style={{ width: `${mediumStats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            {mediumStats.completed}/{mediumStats.total} completed
          </p>
        </div>

        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-700 font-medium">Hard</span>
            <span className="text-2xl font-bold text-red-700">{hardStats.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${hardStats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-red-600 mt-2">
            {hardStats.completed}/{hardStats.total} completed
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progress Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Progress Over Time</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {progressOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              No progress data yet. Start completing items!
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Course Progress</h2>
          {courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#e2e8f0" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Create courses to see progress charts
            </div>
          )}
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Difficulty Distribution</h2>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Add items to see difficulty distribution
            </div>
          )}
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Completion Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Add items to see completion status
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
