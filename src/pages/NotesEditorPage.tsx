import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NotesEditor } from '../components/NotesEditor';
import { useStore } from '../store/useStore';
import type { Note } from '../types';

const emptyNote: Note = {
  title: '',
  content: '',
  codeSnippets: [],
  videos: [],
  links: [],
  images: [],
};

export function NotesEditorPage() {
  const { courseId, topicId, itemId } = useParams();
  const { getCurrentUserData, updateNote, toggleItem } = useStore();
  const userData = getCurrentUserData();

  const course = userData?.courses.find((c) => c.id === courseId);
  const topic = course?.topics.find((t) => t.id === topicId);
  const item = topic?.items.find((i) => i.id === itemId);

  const [note, setNote] = useState<Note>(emptyNote);

  useEffect(() => {
    if (item?.notes) setNote(item.notes);
  }, [item]);

  if (!course || !topic || !item) {
    return <div className="text-slate-600">Note target not found.</div>;
  }

  const onSave = () => {
    updateNote(course.id, topic.id, item.id, note);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/courses" className="hover:text-blue-600">Courses</Link>
        <span>/</span>
        <Link to={`/course/${course.id}`} className="hover:text-blue-600">{course.title}</Link>
        <span>/</span>
        <span>{item.title}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notes Section</h1>
            <p className="text-sm text-slate-500">Structured notes for this subtopic.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleItem(course.id, topic.id, item.id)}
              className={`px-3 py-2 text-sm rounded-lg ${item.completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
            >
              {item.completed ? 'Completed' : 'Mark Complete'}
            </button>
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </div>

        <NotesEditor note={note} onChange={setNote} />
      </div>
    </div>
  );
}
