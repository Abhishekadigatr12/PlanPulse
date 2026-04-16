import { Link } from 'react-router-dom';
import type { Item, Difficulty } from '../types';

interface ItemChecklistProps {
  items: Item[];
  courseId: string;
  topicId: string;
  onToggle: (courseId: string, topicId: string, itemId: string) => void;
  onDelete: (courseId: string, topicId: string, itemId: string) => void;
}

const difficultyColor: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export function ItemChecklist({ items, courseId, topicId, onToggle, onDelete }: ItemChecklistProps) {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 md:p-4 hover:bg-slate-50">
          <button
            onClick={() => onToggle(courseId, topicId, item.id)}
            className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-400'
            }`}
          >
            {item.completed ? '✓' : ''}
          </button>
          <Link
            to={`/course/${courseId}/topic/${topicId}/item/${item.id}`}
            className={`flex-1 font-medium text-sm md:text-base min-w-0 truncate ${item.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
          >
            {item.title}
          </Link>
          <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 whitespace-nowrap ${difficultyColor[item.difficulty]}`}>
            {item.difficulty}
          </span>
          <div className="flex gap-2 flex-shrink-0 ml-auto sm:ml-0">
            <Link to={`/course/${courseId}/topic/${topicId}/item/${item.id}`} className="text-blue-600 text-xs md:text-sm font-medium hover:text-blue-700">
              Notes
            </Link>
            <button onClick={() => onDelete(courseId, topicId, item.id)} className="text-red-500 text-xs md:text-sm font-medium hover:text-red-700">
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
