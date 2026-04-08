import React, { useMemo } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { getOverallStats, calculateCourseProgress } from '../utils/progress';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Target, CheckCircle, TrendingUp } from 'lucide-react';

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#f3f4f6'];

export const Dashboard: React.FC = () => {
  const { courses } = useStudyStore();
  
  const stats = useMemo(() => getOverallStats(courses), [courses]);
  
  const courseChartData = useMemo(() => {
    return courses.map(c => ({
      name: c.title,
      progress: calculateCourseProgress(c),
      value: calculateCourseProgress(c) || 1, // min value for pie chart visibility
    }));
  }, [courses]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Track your learning journey and progress.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<BookOpen />} title="Total Courses" value={stats.totalCourses} />
        <StatCard icon={<Target />} title="Total Topics" value={stats.totalTopics} />
        <StatCard icon={<CheckCircle />} title="Completed Topics" value={stats.totalCompletedTopics} />
        <StatCard icon={<TrendingUp />} title="Overall Progress" value={`${stats.overallProgress}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Progress Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Progress Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="progress" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Course Completion</h2>
          {courses.length > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={courseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-8 space-y-4">
                {courseChartData.slice(0, 4).map((data, index) => (
                  <div key={data.name} className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{data.name}</span>
                    <span className="ml-auto font-medium">{data.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">No courses available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);
