import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Topic } from '../types';
import { ItemChecklist } from './ItemChecklist';

interface TopicListProps {
  courseId: string;
  topics: Topic[];
  getTopicProgress: (courseId: string, topicId: string) => number;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topicId: string) => void;
  onToggleItem: (courseId: string, topicId: string, itemId: string) => void;
  onDeleteItem: (courseId: string, topicId: string, itemId: string) => void;
  renderAddItem: (topicId: string) => ReactNode;
}

export function TopicList({
  courseId,
  topics,
  getTopicProgress,
  onEditTopic,
  onDeleteTopic,
  onToggleItem,
  onDeleteItem,
  renderAddItem,
}: TopicListProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => {
        const topicProgress = getTopicProgress(courseId, topic.id);
        const isExpanded = expandedTopics.has(topic.id);

        return (
          <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleExpand(topic.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{topic.title}</h3>
                  <p className="text-sm text-slate-500">{topic.items.filter((i) => i.completed).length}/{topic.items.length} completed</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-sm text-slate-600">{topicProgress}%</span>
                  <button onClick={() => onEditTopic(topic)} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => onDeleteTopic(topic.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-slate-200">
                <ItemChecklist
                  items={topic.items}
                  courseId={courseId}
                  topicId={topic.id}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
                {renderAddItem(topic.id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
