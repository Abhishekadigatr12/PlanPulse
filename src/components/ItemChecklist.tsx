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
        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
          <button
            onClick={() => onToggle(courseId, topicId, item.id)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-400'
            }`}
          >
            {item.completed ? 'x' : ''}
          </button>
          <Link
            to={`/course/${courseId}/topic/${topicId}/item/${item.id}`}
            className={`flex-1 font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
          >
            {item.title}
          </Link>
          <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColor[item.difficulty]}`}>
            {item.difficulty}
          </span>
          <Link to={`/course/${courseId}/topic/${topicId}/item/${item.id}`} className="text-blue-600 text-sm">
            Notes
          </Link>
          <button onClick={() => onDelete(courseId, topicId, item.id)} className="text-red-500 text-sm">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
