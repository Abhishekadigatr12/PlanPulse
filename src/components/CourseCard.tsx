import { Link } from 'react-router-dom';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const completed = course.topics.reduce((acc, t) => acc + t.items.filter((i) => i.completed).length, 0);
  const total = course.topics.reduce((acc, t) => acc + t.items.length, 0);
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link
            to={`/course/${course.id}`}
            className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(course)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description || 'No description'}</p>

        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-slate-400">{course.topics.length} topics</span>
          <span className="font-medium text-slate-600">{progress}% complete</span>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
