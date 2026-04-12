import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function TopicPage() {
  const { topicId } = useParams();
  const { getCurrentUserData, toggleItem } = useStore();
  const userData = getCurrentUserData();

  const located = userData?.courses
    .flatMap((course) => course.topics.map((topic) => ({ course, topic })))
    .find((entry) => entry.topic.id === topicId);

  if (!located) {
    return <div className="text-slate-600">Topic not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{located.topic.title}</h1>
        <p className="text-slate-500">{located.course.title}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {located.topic.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0">
            <button
              onClick={() => toggleItem(located.course.id, located.topic.id, item.id)}
              className={`w-5 h-5 rounded border ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}
            />
            <span className={`flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.title}</span>
            <span className="text-xs text-slate-500 uppercase">{item.difficulty}</span>
            <Link to={`/course/${located.course.id}/topic/${located.topic.id}/item/${item.id}`} className="text-blue-600 text-sm">
              Notes
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
