import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Course } from '../types';
import { CourseCard } from '../components/CourseCard';

export function CoursesPage() {
  const { getCurrentUserData, addCourse, updateCourse, deleteCourse } = useStore();
  const userData = getCurrentUserData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

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

  const handleOpenAdd = () => {
    setFormData({ title: '', description: '' });
    setEditingCourse(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setFormData({ title: course.title, description: course.description });
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        title: formData.title,
        description: formData.description,
      });
    } else {
      addCourse({
        title: formData.title,
        description: formData.description,
        topics: [],
      });
    }

    setShowAddModal(false);
    setFormData({ title: '', description: '' });
    setEditingCourse(null);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
  };

  const addStriverTemplate = () => {
    addCourse({
      title: 'DSA Structured Sheet',
      description: 'Striver-style progression by topic with curated checklist items.',
      topics: [
        {
          id: crypto.randomUUID(),
          title: 'Arrays',
          description: 'Core array patterns',
          items: [
            {
              id: crypto.randomUUID(),
              title: 'Two Sum',
              completed: false,
              difficulty: 'easy',
              notes: { title: 'Two Sum', content: '', codeSnippets: [], videos: [], links: [], images: [] },
              children: [],
            },
            {
              id: crypto.randomUUID(),
              title: 'Kadane Algorithm',
              completed: false,
              difficulty: 'medium',
              notes: { title: 'Kadane', content: '', codeSnippets: [], videos: [], links: [], images: [] },
              children: [],
            },
          ],
        },
      ],
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Courses</h1>
          <p className="text-slate-500 mt-1">Manage your learning paths</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Course
        </button>
      </div>
      <button onClick={addStriverTemplate} className="mb-6 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
        Add Structured DSA Template
      </button>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Courses Yet</h2>
          <p className="text-slate-500 mb-6">
            Start building your knowledge base by creating your first course.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onEdit={handleOpenEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures & Algorithms"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description of the course..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
