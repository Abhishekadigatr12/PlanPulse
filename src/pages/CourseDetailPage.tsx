import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Topic, Difficulty } from '../types';
import { TopicList } from '../components/TopicList';

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const {
    getCurrentUserData,
    getCourseProgress,
    getTopicProgress,
    addTopic,
    updateTopic,
    deleteTopic,
    addItem,
    toggleItem,
    deleteItem,
  } = useStore();

  const userData = getCurrentUserData();
  const course = userData?.courses.find((c) => c.id === courseId);

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [addingItemToTopic, setAddingItemToTopic] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    difficulty: 'medium' as Difficulty,
    link: '',
  });

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Not Found</h2>
        <Link to="/courses" className="text-blue-600 hover:text-blue-700">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const progress = getCourseProgress(course.id);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.title.trim()) return;

    if (editingTopic) {
      updateTopic(course.id, editingTopic.id, {
        title: topicForm.title,
        description: topicForm.description,
      });
    } else {
      addTopic(course.id, {
        title: topicForm.title,
        description: topicForm.description,
        items: [],
      });
    }

    setShowAddTopic(false);
    setEditingTopic(null);
    setTopicForm({ title: '', description: '' });
  };

  const handleEditTopic = (topic: Topic) => {
    setTopicForm({ title: topic.title, description: topic.description });
    setEditingTopic(topic);
    setShowAddTopic(true);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Delete this topic and all its items?')) {
      deleteTopic(course.id, topicId);
    }
  };

  const handleAddItem = (topicId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim()) return;

    addItem(course.id, topicId, {
      title: itemForm.title,
      completed: false,
      difficulty: itemForm.difficulty,
      link: itemForm.link || undefined,
      notes: {
        title: itemForm.title,
        content: '',
        codeSnippets: [],
        videos: [],
        links: [],
        images: [],
      },
      children: [],
    });

    setItemForm({ title: '', difficulty: 'medium', link: '' });
    setAddingItemToTopic(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 overflow-x-auto">
        <Link to="/courses" className="hover:text-blue-600 whitespace-nowrap">
          Courses
        </Link>
        <span>›</span>
        <span className="text-slate-800 font-medium truncate">{course.title}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">{course.title}</h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base line-clamp-2">{course.description || 'No description'}</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg whitespace-nowrap flex-shrink-0"
          >
            ← Back
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="text-slate-500">Overall Progress</span>
              <span className="font-semibold text-slate-800">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-2xl font-bold text-slate-800">{course.topics.length}</p>
            <p className="text-xs text-slate-500">Topics</p>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Topics</h2>
        <button
          onClick={() => {
            setTopicForm({ title: '', description: '' });
            setEditingTopic(null);
            setShowAddTopic(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span> Add Topic
        </button>
      </div>

      {course.topics.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
          <div className="text-5xl md:text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Topics Yet</h3>
          <p className="text-slate-500 mb-4 text-sm md:text-base">Add topics to organize your learning materials.</p>
          <button
            onClick={() => setShowAddTopic(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
          >
            Add Your First Topic
          </button>
        </div>
      ) : (
        <TopicList
          courseId={course.id}
          topics={course.topics}
          getTopicProgress={getTopicProgress}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItem}
          renderAddItem={(topicId) =>
            addingItemToTopic === topicId ? (
              <form onSubmit={(e) => handleAddItem(topicId, e)} className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="Item title *"
                    className="px-4 py-2 border border-slate-300 rounded-lg"
                    autoFocus
                  />
                  <select
                    value={itemForm.difficulty}
                    onChange={(e) => setItemForm({ ...itemForm, difficulty: e.target.value as Difficulty })}
                    className="px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <input
                    type="url"
                    value={itemForm.link}
                    onChange={(e) => setItemForm({ ...itemForm, link: e.target.value })}
                    placeholder="Link (optional)"
                    className="px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                    Add Item
                  </button>
                  <button type="button" onClick={() => setAddingItemToTopic(null)} className="px-4 py-2 text-slate-600 bg-slate-200 text-sm font-medium rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingItemToTopic(topicId)}
                className="w-full p-4 text-left text-blue-600 hover:bg-blue-50 text-sm font-medium"
              >
                + Add Item
              </button>
            )
          }
        />
      )}

      {/* Add/Edit Topic Modal */}
      {showAddTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </h2>
            </div>
            <form onSubmit={handleAddTopic} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Arrays, Dynamic Programming"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTopic(false);
                    setEditingTopic(null);
                  }}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  {editingTopic ? 'Save Changes' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
