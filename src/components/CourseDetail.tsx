import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { calculateCourseProgress, calculateTopicProgress } from '../utils/progress';
import { ProgressBar, cn } from './ProgressBar';
import { ChevronLeft, Plus, ChevronDown, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, addTopic, deleteTopic, addSubtopic, deleteSubtopic, toggleSubtopic } = useStudyStore();
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  // Modals / forms state
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  const [addingSubtopicTo, setAddingSubtopicTo] = useState<string | null>(null);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [newSubtopicDesc, setNewSubtopicDesc] = useState('');

  const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);

  if (!course) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course not found</h2>
        <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-2">
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Tracker</span>
        </Link>
      </div>
    );
  }

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addTopic(course.id, { title: newTopicTitle, description: newTopicDesc });
    setNewTopicTitle('');
    setNewTopicDesc('');
    setAddingTopic(false);
  };

  const handleAddSubtopic = (e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    if (!newSubtopicTitle.trim()) return;
    addSubtopic(course.id, topicId, { title: newSubtopicTitle, description: newSubtopicDesc });
    setNewSubtopicTitle('');
    setNewSubtopicDesc('');
    setAddingSubtopicTo(null);
  };

  const courseProgress = calculateCourseProgress(course);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex flex-col space-y-4">
        <div>
          <Link to="/courses" className="inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{course.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{course.description}</p>
            </div>
            <div className="w-48 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <ProgressBar progress={courseProgress} showLabel barClassName="bg-indigo-600 h-3" />
            </div>
          </div>
        </div>
      </header>

      {/* Topics List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Curriculum</h2>
          <button
            onClick={() => setAddingTopic(!addingTopic)}
            className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>

        {addingTopic && (
          <form onSubmit={handleAddTopic} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 mb-6">
            <div className="space-y-4">
              <input
                autoFocus
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Topic Title (e.g. React Basics)"
              />
              <textarea
                value={newTopicDesc}
                onChange={(e) => setNewTopicDesc(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Topic Description"
                rows={2}
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setAddingTopic(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save Topic</button>
              </div>
            </div>
          </form>
        )}

        {course.topics.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No topics added yet.</p>
            <button
              onClick={() => setAddingTopic(true)}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Create your first topic
            </button>
          </div>
        ) : (
          course.topics.map((topic, index) => {
            const isExpanded = expandedTopics[topic.id];
            const topicProgress = calculateTopicProgress(topic);
            const isCompleted = topicProgress === 100;

            return (
              <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
                {/* Topic Header */}
                <div 
                  className={cn("p-5 flex items-center justify-between cursor-pointer select-none", isExpanded && "bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700")}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex items-center space-x-4 flex-1 pr-6">
                    <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400")}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={cn("text-lg font-bold transition-colors", isCompleted ? "text-gray-900 dark:text-gray-300" : "text-gray-900 dark:text-white")}>
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="hidden sm:flex items-center space-x-3 w-32">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{topicProgress}%</span>
                      <ProgressBar progress={topicProgress} />
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isExpanded && "transform rotate-180")} />
                  </div>
                </div>

                {/* Subtopics Area */}
                {isExpanded && (
                  <div className="p-5 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="space-y-3 mb-4">
                      {topic.subtopics.map(subtopic => (
                        <div key={subtopic.id} className="group flex items-start p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-sm">
                          <button
                            onClick={() => toggleSubtopic(course.id, topic.id, subtopic.id)}
                            className="flex-shrink-0 mt-0.5 mr-4 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                          >
                            {subtopic.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </button>
                          
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleSubtopic(course.id, topic.id, subtopic.id)}
                          >
                            <h4 className={cn("text-base font-semibold", subtopic.completed ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-white")}>
                              {subtopic.title}
                            </h4>
                            {subtopic.description && (
                              <p className={cn("text-sm mt-1", subtopic.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-400")}>
                                {subtopic.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                            <button 
                              onClick={() => { if(confirm('Delete this subtopic?')) deleteSubtopic(course.id, topic.id, subtopic.id) }}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {addingSubtopicTo === topic.id ? (
                      <form onSubmit={(e) => handleAddSubtopic(e, topic.id)} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <div className="space-y-3">
                          <input
                            autoFocus
                            type="text"
                            value={newSubtopicTitle}
                            onChange={(e) => setNewSubtopicTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder="Subtopic Title (e.g. JSX syntax)"
                          />
                          <input
                            type="text"
                            value={newSubtopicDesc}
                            onChange={(e) => setNewSubtopicDesc(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder="Brief description (optional)"
                          />
                          <div className="flex justify-end space-x-2 pt-2">
                            <button type="button" onClick={() => setAddingSubtopicTo(null)} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                            <button type="submit" className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setAddingSubtopicTo(topic.id)}
                        className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-500/50 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center justify-center space-x-2 transition-colors font-medium text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Subtopic</span>
                      </button>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                      <button 
                        onClick={() => { if(confirm('Delete this entire topic?')) deleteTopic(course.id, topic.id) }}
                        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 flex items-center space-x-1 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Topic</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
