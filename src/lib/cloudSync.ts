import type { Resource, User, UserData } from '../types';

export interface CloudState {
  users: Record<string, User>;
  userData: Record<string, UserData>;
  globalResources: Resource[];
  updatedAt: number;
}

const CLOUD_ENDPOINT = '/api/cloud-state';
const POLL_INTERVAL_MS = 4000;

const isValidCloudState = (value: unknown): value is CloudState => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<CloudState>;
  return (
    typeof data.updatedAt === 'number' &&
    typeof data.users === 'object' &&
    data.users !== null &&
    typeof data.userData === 'object' &&
    data.userData !== null &&
    Array.isArray(data.globalResources)
  );
};

export const isCloudSyncEnabled = (): boolean => {
  return true;
};

export const fetchCloudState = async (): Promise<CloudState | null> => {
  try {
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { state?: unknown };
    const value = payload.state;
    if (!value) return null;
    return isValidCloudState(value) ? value : null;
  } catch {
    return null;
  }
};

export const pushCloudState = async (state: CloudState): Promise<void> => {
  await fetch(CLOUD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });
};

export const subscribeCloudState = (
  onState: (state: CloudState) => void
): (() => void) => {
  let active = true;
  let lastSeenUpdate = 0;

  const tick = async () => {
    if (!active) return;
    const state = await fetchCloudState();
    if (state && state.updatedAt > lastSeenUpdate) {
      lastSeenUpdate = state.updatedAt;
      onState(state);
    }
  };

  void tick();
  const intervalId = window.setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);

  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
};
