import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  onValue,
  ref,
  set,
  get,
  type Database,
} from 'firebase/database';
import type { Resource, User, UserData } from '../types';

export interface CloudState {
  users: Record<string, User>;
  userData: Record<string, UserData>;
  globalResources: Resource[];
  updatedAt: number;
}

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const CLOUD_STATE_PATH = 'planplus/sharedState';

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

const hasRequiredConfig = (): boolean => {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.databaseURL &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.appId
  );
};

const getDb = (): Database | null => {
  if (!hasRequiredConfig()) return null;
  if (!firebaseApp) {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    database = getDatabase(firebaseApp);
  }
  return database;
};

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
  return getDb() !== null;
};

export const fetchCloudState = async (): Promise<CloudState | null> => {
  const db = getDb();
  if (!db) return null;

  try {
    const snapshot = await get(ref(db, CLOUD_STATE_PATH));
    if (!snapshot.exists()) return null;
    const value = snapshot.val();
    return isValidCloudState(value) ? value : null;
  } catch {
    return null;
  }
};

export const pushCloudState = async (state: CloudState): Promise<void> => {
  const db = getDb();
  if (!db) return;

  await set(ref(db, CLOUD_STATE_PATH), state);
};

export const subscribeCloudState = (
  onState: (state: CloudState) => void
): (() => void) => {
  const db = getDb();
  if (!db) return () => undefined;

  const stateRef = ref(db, CLOUD_STATE_PATH);
  const unsubscribe = onValue(stateRef, (snapshot) => {
    const value = snapshot.val();
    if (isValidCloudState(value)) {
      onState(value);
    }
  });

  return unsubscribe;
};
