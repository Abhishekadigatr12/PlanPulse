import { useMemo, useState } from 'react';
import type { Note } from '../types';

interface NotesEditorProps {
  note: Note;
  onChange: (next: Note) => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
};

export function NotesEditor({ note, onChange }: NotesEditorProps) {
  const [newCode, setNewCode] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newImage, setNewImage] = useState('');

  const pdfLinks = useMemo(() => note.links.filter((link) => link.toLowerCase().includes('.pdf')), [note.links]);

  const pushValue = (key: keyof Pick<Note, 'codeSnippets' | 'videos' | 'links' | 'images'>, value: string) => {
    if (!value.trim()) return;
    onChange({ ...note, [key]: [...note[key], value] });
  };

  const removeValue = (key: keyof Pick<Note, 'codeSnippets' | 'videos' | 'links' | 'images'>, index: number) => {
    onChange({ ...note, [key]: note[key].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
        <input
          value={note.title}
          onChange={(e) => onChange({ ...note, title: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          placeholder="Subtopic note title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Main Notes</label>
        <textarea
          value={note.content}
          onChange={(e) => onChange({ ...note, content: e.target.value })}
          className="w-full h-56 px-4 py-3 border border-slate-300 rounded-lg resize-none"
          placeholder="Write key concepts, approach, and edge cases."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Code Snippets</label>
        <div className="flex gap-2">
          <textarea value={newCode} onChange={(e) => setNewCode(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" rows={3} />
          <button onClick={() => { pushValue('codeSnippets', newCode); setNewCode(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
        </div>
        <div className="space-y-2 mt-2">
          {note.codeSnippets.map((snippet, i) => (
            <div key={i} className="bg-slate-900 text-green-400 p-3 rounded-lg text-sm flex justify-between gap-3">
              <pre className="overflow-x-auto"><code>{snippet}</code></pre>
              <button onClick={() => removeValue('codeSnippets', i)} className="text-red-400">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Videos (YouTube)</label>
        <div className="flex gap-2">
          <input value={newVideo} onChange={(e) => setNewVideo(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" placeholder="https://www.youtube.com/watch?v=..." />
          <button onClick={() => { pushValue('videos', newVideo); setNewVideo(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {note.videos.map((video, i) => (
            <div key={i} className="space-y-1">
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                <iframe className="w-full h-full" src={getYouTubeEmbedUrl(video)} title={`video-${i}`} allowFullScreen />
              </div>
              <button onClick={() => removeValue('videos', i)} className="text-red-500 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Links</label>
        <div className="flex gap-2">
          <input value={newLink} onChange={(e) => setNewLink(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" placeholder="https://..." />
          <button onClick={() => { pushValue('links', newLink); setNewLink(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
        </div>
        <div className="mt-2 space-y-2">
          {note.links.map((link, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
              <a className="text-blue-600 truncate" href={link} target="_blank" rel="noreferrer">{link}</a>
              <button onClick={() => removeValue('links', i)} className="text-red-500 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {pdfLinks.length > 0 && (
        <div>
          <p className="block text-sm font-medium text-slate-700 mb-2">PDF Preview</p>
          <div className="space-y-3">
            {pdfLinks.map((pdf, index) => (
              <iframe key={pdf + index} src={pdf} className="w-full h-72 rounded-lg border border-slate-200" title={`pdf-${index}`} />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Images</label>
        <div className="flex gap-2">
          <input value={newImage} onChange={(e) => setNewImage(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" placeholder="https://image-url" />
          <button onClick={() => { pushValue('images', newImage); setNewImage(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {note.images.map((image, i) => (
            <div key={i}>
              <img src={image} alt={`note-${i}`} className="w-full h-28 object-cover rounded-lg" />
              <button onClick={() => removeValue('images', i)} className="text-red-500 text-sm mt-1">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
