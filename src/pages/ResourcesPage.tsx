import { ResourcePanel } from '../components/ResourcePanel';
import { useStore } from '../store/useStore';

export function ResourcesPage() {
  const {
    auth,
    users,
    globalResources,
    addResource,
    updateResource,
    requestAccess,
    requestAccessByToken,
    approveAccess,
    rejectAccess,
    deleteResource,
  } = useStore();

  if (!auth.currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Resources</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Share by username, request access, and manage approvals.</p>
      </div>

      <div className="bg-green-50 rounded-xl border border-green-200 p-4 mb-6">
        <h3 className="font-semibold text-green-900 mb-2">📋 How to Test Requests:</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ <strong>Create a public resource</strong> to make it visible to all users</li>
          <li>✓ <strong>Click "Request Access"</strong> on resources you don't have access to</li>
          <li>✓ <strong>Check "My Requests"</strong> section to see your pending requests</li>
          <li>✓ <strong>Check "Incoming Requests"</strong> section to approve/reject others' requests</li>
        </ul>
      </div>

      <ResourcePanel
        resources={globalResources}
        currentUser={auth.currentUser}
        allUsers={Object.keys(users)}
        addResource={addResource}
        updateResource={updateResource}
        requestAccess={requestAccess}
        requestAccessByToken={requestAccessByToken}
        approveAccess={approveAccess}
        rejectAccess={rejectAccess}
        deleteResource={deleteResource}
        canShareByUsername={auth.currentUser.toLowerCase() === 'admin' || auth.currentUser.toLowerCase() === 'abhishek'}
      />
    </div>
  );
}
