import React, { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { calculateCourseProgress } from '../utils/progress';
import { ProgressBar } from './ProgressBar';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Trash2 } from 'lucide-react';

export const CourseList: React.FC = () => {
  const { courses, addCourse, deleteCourse } = useStudyStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCourse({
      title: newTitle,
      description: newDesc,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' // default tech image
    });
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your learning paths and courses.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Course</span>
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Course</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                placeholder="e.g. Machine Learning A-Z"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                placeholder="What will you learn?"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Create Course
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const progress = calculateCourseProgress(course);
          return (
            <div key={course.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-40 overflow-hidden relative">
                <img
                  src={course.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Are you sure you want to delete this course?')) deleteCourse(course.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{course.topics.length} Topics</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
                  {course.description}
                </p>
                
                <div className="mt-auto space-y-4">
                  <ProgressBar progress={progress} showLabel />
                  <Link
                    to={`/courses/${course.id}`}
                    className="block w-full text-center bg-gray-50 hover:bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:hover:bg-indigo-500/10 dark:text-indigo-400 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
