import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Difficulty } from '../types';

export function LearnPage() {
  const { getCurrentUserData, toggleItem, getTopicProgress } = useStore();
  const userData = getCurrentUserData();
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

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

  // Flatten all items with context
  const allItems = courses.flatMap((course) =>
    course.topics.flatMap((topic) =>
      topic.items.map((item) => ({
        ...item,
        courseId: course.id,
        courseName: course.title,
        topicId: topic.id,
        topicName: topic.title,
        topicProgress: getTopicProgress(course.id, topic.id),
      }))
    )
  );

  // Filter items
  const filteredItems = allItems.filter((item) => {
    if (filterDifficulty !== 'all' && item.difficulty !== filterDifficulty) return false;
    if (filterStatus === 'completed' && !item.completed) return false;
    if (filterStatus === 'pending' && item.completed) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const stats = {
    total: allItems.length,
    completed: allItems.filter((i) => i.completed).length,
    easy: allItems.filter((i) => i.difficulty === 'easy').length,
    medium: allItems.filter((i) => i.difficulty === 'medium').length,
    hard: allItems.filter((i) => i.difficulty === 'hard').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Learn</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Track and complete your learning items</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Items</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-green-600">{stats.easy}</p>
          <p className="text-xs text-slate-500 mt-1">Easy</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.medium}</p>
          <p className="text-xs text-slate-500 mt-1">Medium</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-red-600">{stats.hard}</p>
          <p className="text-xs text-slate-500 mt-1">Hard</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Difficulty</label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | 'all')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Items</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Items Found</h3>
          <p className="text-slate-500 mb-4">
            {allItems.length === 0
              ? 'Start by creating courses and adding topics with items.'
              : 'Try adjusting your filters.'}
          </p>
          {allItems.length === 0 && (
            <Link
              to="/courses"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Go to Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <button
                  onClick={() => toggleItem(item.courseId, item.topicId, item.id)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {item.completed && '✓'}
                </button>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/course/${item.courseId}/topic/${item.topicId}/item/${item.id}`}
                    className={`font-medium block ${
                      item.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-400 truncate">
                    {item.courseName} › {item.topicName}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(
                    item.difficulty
                  )}`}
                >
                  {item.difficulty}
                </span>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    🔗
                  </a>
                )}

                <Link
                  to={`/course/${item.courseId}/topic/${item.topicId}/item/${item.id}`}
                  className="text-slate-400 hover:text-blue-600"
                >
                  📝
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
