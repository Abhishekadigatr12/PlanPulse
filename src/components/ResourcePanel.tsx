import { useState } from 'react';
import type { Resource } from '../types';

interface ResourcePanelProps {
  resources: Resource[];
  currentUser: string;
  allUsers: string[];
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'shareToken'>) => void;
  requestAccess: (resourceId: string) => void;
  requestAccessByToken: (token: string) => { success: boolean; message: string };
  approveAccess: (resourceId: string, username: string) => void;
  rejectAccess: (resourceId: string, username: string) => void;
  updateCourse?: (courseId: string, updates: unknown) => void;
}

export function ResourcePanel({ resources, currentUser, allUsers, addResource, requestAccessByToken, approveAccess, rejectAccess }: ResourcePanelProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'link' as Resource['type'],
    url: '',
    content: '',
    visibility: 'private' as Resource['visibility'],
  });
  const [shareUser, setShareUser] = useState<Record<string, string>>({});
  const [tokenInput, setTokenInput] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setRequestMessage('Token copied to clipboard.');
    } catch {
      setRequestMessage('Could not copy token. Please copy it manually.');
    }
  };

  const visibleResources = resources.filter((resource) =>
    resource.visibility === 'public' ||
    resource.createdBy === currentUser ||
    resource.accessList.includes(currentUser)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">Request Access by Token</h2>
        <div className="flex gap-2">
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Enter Resource Token"
          />
          <button
            onClick={() => {
              const result = requestAccessByToken(tokenInput);
              setRequestMessage(result.message);
              if (result.success) {
                setTokenInput('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Request Access
          </button>
        </div>
        {requestMessage && <p className="text-sm text-slate-600">{requestMessage}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="font-semibold text-slate-800">Add Resource</h2>
        <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Resource title" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })} className="px-3 py-2 border border-slate-300 rounded-lg">
            <option value="link">Link</option>
            <option value="video">Video</option>
            <option value="doc">Doc</option>
            <option value="note">Note</option>
          </select>
          <select value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Resource['visibility'] })} className="px-3 py-2 border border-slate-300 rounded-lg">
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
          <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" placeholder="URL" />
        </div>
        {formData.type === 'note' && (
          <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} placeholder="Resource note" />
        )}
        <button
          onClick={() => {
            if (!formData.title.trim()) return;
            addResource({
              title: formData.title,
              type: formData.type,
              url: formData.url || undefined,
              content: formData.content || undefined,
              createdBy: currentUser,
              visibility: formData.visibility,
              accessList: [currentUser],
              pendingRequests: [],
            });
            setFormData({ title: '', type: 'link', url: '', content: '', visibility: 'private' });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add Resource
        </button>
      </div>

      <div className="space-y-3">
        {visibleResources.map((resource) => {
          const isOwner = resource.createdBy === currentUser;
          const hasAccess =
            resource.visibility === 'public' || isOwner || resource.accessList.includes(currentUser);
          const pending = resource.pendingRequests.includes(currentUser);
          const targetUser = shareUser[resource.id] || '';

          return (
            <div key={resource.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">{resource.title}</h3>
                  <p className="text-sm text-slate-500">
                    {resource.type} • {resource.visibility} • owner: {resource.createdBy}
                  </p>
                </div>
                {pending && <span className="text-amber-600 text-sm">Request pending</span>}
              </div>

              {resource.url && hasAccess && (
                <a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm block mt-2">
                  Open link
                </a>
              )}

              {isOwner && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={resource.shareToken}
                      readOnly
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 w-full"
                    />
                    <button
                      onClick={() => handleCopyToken(resource.shareToken)}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
                    >
                      Copy Token
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select value={targetUser} onChange={(e) => setShareUser({ ...shareUser, [resource.id]: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Share with user</option>
                      {allUsers.filter((u) => u !== currentUser && !resource.accessList.includes(u)).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (!targetUser) return;
                        approveAccess(resource.id, targetUser);
                        setShareUser({ ...shareUser, [resource.id]: '' });
                      }}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
                    >
                      Share
                    </button>
                  </div>

                  {resource.pendingRequests.map((user) => (
                    <div key={user} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{user} requested access</span>
                      <div className="flex gap-2">
                        <button onClick={() => approveAccess(resource.id, user)} className="text-green-600 text-sm">Approve</button>
                        <button onClick={() => rejectAccess(resource.id, user)} className="text-red-600 text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
