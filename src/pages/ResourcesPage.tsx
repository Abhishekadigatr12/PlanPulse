import { ResourcePanel } from '../components/ResourcePanel';
import { useStore } from '../store/useStore';

export function ResourcesPage() {
  const {
    auth,
    users,
    globalResources,
    addResource,
    requestAccess,
    requestAccessByToken,
    approveAccess,
    rejectAccess,
  } = useStore();

  if (!auth.currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Resources</h1>
        <p className="text-slate-500 mt-1">Share by username, request access, and manage approvals.</p>
      </div>

      <ResourcePanel
        resources={globalResources}
        currentUser={auth.currentUser}
        allUsers={Object.keys(users)}
        addResource={addResource}
        requestAccess={requestAccess}
        requestAccessByToken={requestAccessByToken}
        approveAccess={approveAccess}
        rejectAccess={rejectAccess}
      />
    </div>
  );
}
