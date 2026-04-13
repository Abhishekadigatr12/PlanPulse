import { useState } from 'react';
import type { Resource } from '../types';

interface ResourcePanelProps {
  resources: Resource[];
  currentUser: string;
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'shareToken'>) => void;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  deleteResource: (resourceId: string) => void;
  requestAccess: (resourceId: string) => void;
  requestAccessByToken: (token: string) => { success: boolean; message: string };
  approveAccess: (resourceId: string, username: string) => void;
  rejectAccess: (resourceId: string, username: string) => void;
  canShareByUsername: boolean;
}

export function ResourcePanel({
  resources,
  currentUser,
  addResource,
  updateResource,
  deleteResource,
  requestAccessByToken,
  approveAccess,
  rejectAccess,
  canShareByUsername,
}: ResourcePanelProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'link' as Resource['type'],
    url: '',
    content: '',
    visibility: 'private' as Resource['visibility'],
  });
  const [tokenInput, setTokenInput] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'owned' | 'shared'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'link' as Resource['type'],
    url: '',
    content: '',
    visibility: 'private' as Resource['visibility'],
  });

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

  const filteredResources = visibleResources
    .filter((resource) => {
      if (viewFilter === 'owned') return resource.createdBy === currentUser;
      if (viewFilter === 'shared') return resource.createdBy !== currentUser;
      return true;
    })
    .filter((resource) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        resource.createdBy.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime() || 0;
      const bTime = new Date(b.createdAt).getTime() || 0;

      switch (sortBy) {
        case 'oldest':
          return aTime - bTime;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return bTime - aTime;
      }
    });

  const startEditing = (resource: Resource) => {
    setEditingResourceId(resource.id);
    setEditForm({
      title: resource.title,
      type: resource.type,
      url: resource.url || '',
      content: resource.content || '',
      visibility: resource.visibility,
    });
  };

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

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value as 'all' | 'owned' | 'shared')}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="all">All Resources</option>
            <option value="owned">Owned by Me</option>
            <option value="shared">Shared with Me</option>
          </select>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Search by name, type, or owner"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name-asc' | 'name-desc')}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="newest">Time Added: Newest</option>
            <option value="oldest">Time Added: Oldest</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredResources.map((resource) => {
          const isOwner = resource.createdBy === currentUser;
          const hasAccess =
            resource.visibility === 'public' || isOwner || resource.accessList.includes(currentUser);
          const pending = resource.pendingRequests.includes(currentUser);
          const isEditing = editingResourceId === resource.id;

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

              <p className="text-xs text-slate-400 mt-1">
                Added: {resource.createdAt ? new Date(resource.createdAt).toLocaleString() : 'N/A'}
              </p>

              {isOwner && isEditing && (
                <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Resource title"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Resource['type'] })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="link">Link</option>
                      <option value="video">Video</option>
                      <option value="doc">Doc</option>
                      <option value="note">Note</option>
                    </select>
                    <select
                      value={editForm.visibility}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as Resource['visibility'] })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                    <input
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="URL"
                    />
                  </div>
                  {editForm.type === 'note' && (
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      rows={3}
                      placeholder="Resource note"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!editForm.title.trim()) return;
                        updateResource(resource.id, {
                          title: editForm.title,
                          type: editForm.type,
                          visibility: editForm.visibility,
                          url: editForm.url || undefined,
                          content: editForm.content || undefined,
                        });
                        setEditingResourceId(null);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingResourceId(null)}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {resource.url && hasAccess && (
                <a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm block mt-2">
                  Open link
                </a>
              )}

              {isOwner && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(resource)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this resource?')) {
                          deleteResource(resource.id);
                        }
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>

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

                  {canShareByUsername && (
                    <button
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
                    >
                      Share
                    </button>
                  )}

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
