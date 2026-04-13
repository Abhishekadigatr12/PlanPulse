// ============================================
// STUDY OS - ZUSTAND STORE
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Course, Topic, Item, Note, Resource, UserData, ProgressLog } from '../types';
import {
  fetchCloudState,
  isCloudSyncEnabled,
  pushCloudState,
  subscribeCloudState,
  type CloudState,
} from '../lib/cloudSync';

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const PRESENCE_STORAGE_KEY = 'planplus-presence-v1';
const ONLINE_TTL_MS = 90 * 1000;
const ADMIN_USERNAMES = new Set(['admin', 'abhishek']);
const CLOUD_PUSH_DEBOUNCE_MS = 800;

const loginAttempts = new Map<string, { count: number; firstAttemptAt: number; blockedUntil: number }>();

const createEmptyNote = (): Note => ({
  title: '',
  content: '',
  codeSnippets: [],
  videos: [],
  links: [],
  images: [],
});

const createDefaultUserData = (): UserData => ({
  courses: [],
  streak: 0,
  lastActiveDate: null,
  progressLogs: [],
  notes: {},
  resources: [],
});

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const normalizeCredential = (value: string): string => value.trim();

const isValidUsername = (username: string): boolean => {
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) return false;
  const lowered = username.toLowerCase();
  if (lowered === '__proto__' || lowered === 'constructor' || lowered === 'prototype') return false;
  return true;
};

const isValidPassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 128) return false;
  if (/\s/.test(password)) return false;
  return true;
};

const getIsBlocked = (username: string): boolean => {
  const attempt = loginAttempts.get(username);
  if (!attempt) return false;
  return Date.now() < attempt.blockedUntil;
};

const trackFailedLogin = (username: string): void => {
  const now = Date.now();
  const existing = loginAttempts.get(username);
  if (!existing || now - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(username, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });
    return;
  }

  const nextCount = existing.count + 1;
  const blockedUntil = nextCount >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_WINDOW_MS : existing.blockedUntil;
  loginAttempts.set(username, {
    count: nextCount,
    firstAttemptAt: existing.firstAttemptAt,
    blockedUntil,
  });
};

const clearFailedLogin = (username: string): void => {
  loginAttempts.delete(username);
};

const isAdminUser = (username: string | null): boolean => {
  if (!username) return false;
  return ADMIN_USERNAMES.has(username.toLowerCase());
};

const readPresenceMap = (): Record<string, number> => {
  try {
    const raw = globalThis.localStorage?.getItem(PRESENCE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number') {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
};

const writePresenceMap = (presence: Record<string, number>): void => {
  try {
    globalThis.localStorage?.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(presence));
  } catch {
    // Ignore storage failures.
  }
};

const getActivePresenceMap = (): Record<string, number> => {
  const now = Date.now();
  const presence = readPresenceMap();
  const activeEntries = Object.entries(presence).filter(([, lastSeenAt]) => now - lastSeenAt <= ONLINE_TTL_MS);
  const cleaned = Object.fromEntries(activeEntries);
  if (activeEntries.length !== Object.keys(presence).length) {
    writePresenceMap(cleaned);
  }
  return cleaned;
};

const setUserOnline = (username: string): void => {
  const presence = getActivePresenceMap();
  presence[username] = Date.now();
  writePresenceMap(presence);
};

const setUserOffline = (username: string): void => {
  const presence = getActivePresenceMap();
  if (presence[username]) {
    delete presence[username];
    writePresenceMap(presence);
  }
};

const createShareToken = (): string => {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  }
  return Math.random().toString(36).slice(2, 26);
};

const isWithinLastDays = (isoDate: string | null, days: number): boolean => {
  if (!isoDate) return false;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return parsed >= cutoff;
};

const toCloudState = (state: AppState): CloudState => ({
  users: state.users,
  userData: state.userData,
  globalResources: state.globalResources,
  updatedAt: Date.now(),
});

const buildUnifiedResourceList = (
  globalResources: Resource[],
  userData: Record<string, UserData>
): Resource[] => {
  const byId = new Map<string, Resource>();

  for (const resource of globalResources) {
    byId.set(resource.id, resource);
  }

  for (const user of Object.values(userData)) {
    for (const resource of user.resources) {
      if (!byId.has(resource.id)) {
        byId.set(resource.id, resource);
      }
    }
  }

  return Array.from(byId.values());
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      users: {},
      auth: {
        isAuthenticated: false,
        currentUser: null,
      },
      activeUser: null,
      userData: {},
      globalResources: [],

      // Auth Actions
      login: (username: string, password: string) => {
        const safeUsername = normalizeCredential(username);
        const safePassword = normalizeCredential(password);
        if (!isValidUsername(safeUsername) || !safePassword) return false;
        if (getIsBlocked(safeUsername)) return false;

        const { users } = get();
        const user = users[safeUsername];
        if (user && user.password === safePassword) {
          clearFailedLogin(safeUsername);
          setUserOnline(safeUsername);
          const userData = get().userData[safeUsername] || createDefaultUserData();

          set({
            auth: { isAuthenticated: true, currentUser: safeUsername },
            activeUser: safeUsername,
            userData: {
              ...get().userData,
              [safeUsername]: userData,
            },
          });
          return true;
        }
        trackFailedLogin(safeUsername);
        return false;
      },

      register: (username: string, password: string) => {
        const safeUsername = normalizeCredential(username);
        const safePassword = normalizeCredential(password);
        if (!isValidUsername(safeUsername) || !isValidPassword(safePassword)) {
          return false;
        }

        const { users } = get();
        if (users[safeUsername]) {
          return false;
        }
        set({
          users: {
            ...users,
            [safeUsername]: { username: safeUsername, password: safePassword },
          },
          userData: {
            ...get().userData,
            [safeUsername]: createDefaultUserData(),
          },
        });
        // Auto login after registration
        return get().login(safeUsername, safePassword);
      },

      logout: () => {
        const currentUser = get().auth.currentUser;
        if (currentUser) {
          setUserOffline(currentUser);
        }

        set({
          auth: { isAuthenticated: false, currentUser: null },
          activeUser: null,
        });
      },

      markCurrentUserOnline: () => {
        const currentUser = get().auth.currentUser;
        if (!currentUser) return;
        setUserOnline(currentUser);
      },

      markCurrentUserOffline: () => {
        const currentUser = get().auth.currentUser;
        if (!currentUser) return;
        setUserOffline(currentUser);
      },

      // Helper to get current user data
      getCurrentUserData: () => {
        const { auth, userData } = get();
        if (!auth.currentUser) return null;
        return userData[auth.currentUser] || createDefaultUserData();
      },

      // Course Actions
      addCourse: (courseData) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const newCourse: Course = {
          ...courseData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const currentUserData = userData[auth.currentUser] || createDefaultUserData();
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: [...currentUserData.courses, newCourse],
            },
          },
        });
      },

      updateCourse: (courseId, updates) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                  : c
              ),
            },
          },
        });
      },

      deleteCourse: (courseId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.filter((c) => c.id !== courseId),
            },
          },
        });
      },

      // Topic Actions
      addTopic: (courseId, topicData) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const newTopic: Topic = {
          ...topicData,
          id: uuidv4(),
        };

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? { ...c, topics: [...c.topics, newTopic], updatedAt: new Date().toISOString() }
                  : c
              ),
            },
          },
        });
      },

      updateTopic: (courseId, topicId, updates) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId ? { ...t, ...updates } : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      deleteTopic: (courseId, topicId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.filter((t) => t.id !== topicId),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      // Item Actions
      addItem: (courseId, topicId, itemData) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const newItem: Item = {
          ...itemData,
          id: uuidv4(),
          notes: itemData.notes || createEmptyNote(),
          children: itemData.children || [],
        };

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId
                          ? { ...t, items: [...t.items, newItem] }
                          : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      updateItem: (courseId, topicId, itemId, updates) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId
                          ? {
                              ...t,
                              items: t.items.map((i) =>
                                i.id === itemId ? { ...i, ...updates } : i
                              ),
                            }
                          : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      deleteItem: (courseId, topicId, itemId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId
                          ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
                          : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      toggleItem: (courseId, topicId, itemId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        const course = currentUserData.courses.find((c) => c.id === courseId);
        if (!course) return;

        const topic = course.topics.find((t) => t.id === topicId);
        if (!topic) return;

        const item = topic.items.find((i) => i.id === itemId);
        if (!item) return;

        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId
                          ? {
                              ...t,
                              items: t.items.map((i) =>
                                i.id === itemId ? { ...i, completed: !i.completed } : i
                              ),
                            }
                          : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });

        // Log progress only when an item is marked completed.
        get().updateProgress(item.completed ? 0 : 1);
      },

      // Note Actions
      updateNote: (courseId, topicId, itemId, noteUpdates) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              courses: currentUserData.courses.map((c) =>
                c.id === courseId
                  ? {
                      ...c,
                      topics: c.topics.map((t) =>
                        t.id === topicId
                          ? {
                              ...t,
                              items: t.items.map((i) =>
                                i.id === itemId
                                  ? { ...i, notes: { ...i.notes, ...noteUpdates } }
                                  : i
                              ),
                            }
                          : t
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            },
          },
        });
      },

      // Progress Actions
      updateProgress: (completedIncrement = 0) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        const today = formatDate(new Date());

        const todayLog = currentUserData.progressLogs.find((log) => log.date === today);
        const todayCompletedCount = (todayLog?.completedCount || 0) + Math.max(0, completedIncrement);

        const existingLogIndex = currentUserData.progressLogs.findIndex(
          (log) => log.date === today
        );

        let newLogs: ProgressLog[];
        if (existingLogIndex >= 0) {
          newLogs = currentUserData.progressLogs.map((log, index) =>
            index === existingLogIndex
              ? { ...log, completedCount: todayCompletedCount }
              : log
          );
        } else {
          newLogs = [
            ...currentUserData.progressLogs,
            { date: today, completedCount: todayCompletedCount },
          ];
        }

        // Streak updates only on completion activity.
        let nextStreak = currentUserData.streak;
        let nextLastActiveDate = currentUserData.lastActiveDate;
        if (completedIncrement > 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDate = formatDate(yesterday);

          if (currentUserData.lastActiveDate === today) {
            nextStreak = currentUserData.streak;
          } else if (currentUserData.lastActiveDate === yesterdayDate) {
            nextStreak = currentUserData.streak + 1;
          } else {
            nextStreak = 1;
          }
          nextLastActiveDate = today;
        }

        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              progressLogs: newLogs,
              streak: nextStreak,
              lastActiveDate: nextLastActiveDate,
            },
          },
        });
      },

      getStreak: () => {
        const { auth, userData } = get();
        if (!auth.currentUser) return 0;
        return userData[auth.currentUser]?.streak || 0;
      },

      // Resource Actions
      addResource: (resourceData) => {
        const { auth, userData, globalResources } = get();
        if (!auth.currentUser) return;

        const newResource: Resource = {
          ...resourceData,
          id: uuidv4(),
          shareToken: createShareToken(),
          createdAt: new Date().toISOString(),
        };

        // Add to user's resources
        const currentUserData = userData[auth.currentUser];
        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              resources: [...currentUserData.resources, newResource],
            },
          },
          globalResources: [...globalResources, newResource],
        });
      },

      requestAccess: (resourceId) => {
        const { auth, globalResources } = get();
        if (!auth.currentUser) return;

        set({
          globalResources: globalResources.map((r) =>
            r.id === resourceId &&
            r.createdBy !== auth.currentUser &&
            !r.pendingRequests.includes(auth.currentUser!) &&
            !r.accessList.includes(auth.currentUser!)
              ? { ...r, pendingRequests: [...r.pendingRequests, auth.currentUser!] }
              : r
          ),
        });
      },

      requestAccessByToken: (token) => {
        const { auth, globalResources, userData } = get();
        if (!auth.currentUser) {
          return { success: false, message: 'Please log in to request access.' };
        }
        const currentUser = auth.currentUser;
        const cleanedToken = token.trim();
        const unifiedResources = buildUnifiedResourceList(globalResources, userData);

        if (!/^[A-Za-z0-9]{8,64}$/.test(cleanedToken)) {
          return { success: false, message: 'Invalid token format.' };
        }

        const targetResource = unifiedResources.find((resource) => resource.shareToken === cleanedToken);
        if (!targetResource) {
          return { success: false, message: 'Token not found in shared resources. If your friend uses a different browser/device, this app needs backend sync to share data across devices.' };
        }

        const canAccess =
          targetResource.visibility === 'public' ||
          targetResource.createdBy === currentUser ||
          targetResource.accessList.includes(currentUser);

        if (canAccess) {
          return { success: false, message: 'You already have access to this resource.' };
        }

        if (targetResource.pendingRequests.includes(currentUser)) {
          return { success: false, message: 'Your request is already pending approval.' };
        }

        set({
          globalResources: unifiedResources.map((resource) =>
            resource.id === targetResource.id
              ? { ...resource, pendingRequests: [...resource.pendingRequests, currentUser] }
              : resource
          ),
        });

        return { success: true, message: 'Access request sent to the resource owner.' };
      },

      approveAccess: (resourceId, username) => {
        const { auth, globalResources } = get();
        if (!auth.currentUser) return;

        set({
          globalResources: globalResources.map((r) =>
            r.id === resourceId && r.createdBy === auth.currentUser
              ? {
                  ...r,
                  accessList: r.accessList.includes(username)
                    ? r.accessList
                    : [...r.accessList, username],
                  pendingRequests: r.pendingRequests.filter((u) => u !== username),
                }
              : r
          ),
        });
      },

      rejectAccess: (resourceId, username) => {
        const { auth, globalResources } = get();
        if (!auth.currentUser) return;

        set({
          globalResources: globalResources.map((r) =>
            r.id === resourceId && r.createdBy === auth.currentUser
              ? {
                  ...r,
                  pendingRequests: r.pendingRequests.filter((u) => u !== username),
                }
              : r
          ),
        });
      },

      deleteResource: (resourceId) => {
        const { auth, userData, globalResources } = get();
        if (!auth.currentUser) return;

        const currentUserData = userData[auth.currentUser];
        const ownedResource = globalResources.find(
          (resource) => resource.id === resourceId && resource.createdBy === auth.currentUser
        );
        if (!ownedResource) return;

        set({
          userData: {
            ...userData,
            [auth.currentUser]: {
              ...currentUserData,
              resources: currentUserData.resources.filter((r) => r.id !== resourceId),
            },
          },
          globalResources: globalResources.filter((r) => r.id !== resourceId),
        });
      },

      // Getters
      getCourseProgress: (courseId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return 0;

        const course = userData[auth.currentUser]?.courses.find((c) => c.id === courseId);
        if (!course) return 0;

        let completed = 0;
        let total = 0;

        course.topics.forEach((topic) => {
          topic.items.forEach((item) => {
            total++;
            if (item.completed) completed++;
          });
        });

        return total === 0 ? 0 : Math.round((completed / total) * 100);
      },

      getTopicProgress: (courseId, topicId) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return 0;

        const course = userData[auth.currentUser]?.courses.find((c) => c.id === courseId);
        if (!course) return 0;

        const topic = course.topics.find((t) => t.id === topicId);
        if (!topic) return 0;

        const completed = topic.items.filter((i) => i.completed).length;
        const total = topic.items.length;

        return total === 0 ? 0 : Math.round((completed / total) * 100);
      },

      getProgressLogs: (filter) => {
        const { auth, userData } = get();
        if (!auth.currentUser) return [];

        const logs = userData[auth.currentUser]?.progressLogs || [];
        const today = new Date();
        const todayKey = formatDate(today);
        const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

        switch (filter) {
          case 'daily': {
            return sortedLogs.filter((log) => log.date === todayKey);
          }
          case 'weekly': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            const weekAgoKey = formatDate(weekAgo);
            return sortedLogs.filter((log) => log.date >= weekAgoKey && log.date <= todayKey);
          }
          case 'monthly': {
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 29);
            const monthAgoKey = formatDate(monthAgo);
            return sortedLogs.filter((log) => log.date >= monthAgoKey && log.date <= todayKey);
          }
          default:
            return sortedLogs;
        }
      },

      getPlatformStats: () => {
        const { auth, users, userData } = get();
        if (!isAdminUser(auth.currentUser)) return null;

        const knownUsers = new Set([...Object.keys(users), ...Object.keys(userData)]);
        const totalUsers = knownUsers.size;
        const dataList = Object.values(userData);
        const activeUsersLast30Days = dataList.filter((ud) =>
          isWithinLastDays(ud.lastActiveDate, 30)
        ).length;
        const usersWithCourses = dataList.filter((ud) => ud.courses.length > 0).length;
        const onlineUsersNow = Object.keys(getActivePresenceMap()).filter((username) => knownUsers.has(username)).length;

        return {
          totalUsers,
          activeUsersLast30Days,
          usersWithCourses,
          onlineUsersNow,
        };
      },
    }),
    {
      name: 'planplus-storage',
      version: 2,
    }
  )
);

let suppressCloudPush = false;
let latestCloudTimestamp = 0;
let cloudPushTimer: ReturnType<typeof setTimeout> | null = null;

const applyCloudState = (remoteState: CloudState): void => {
  if (remoteState.updatedAt <= latestCloudTimestamp) return;

  suppressCloudPush = true;
  useStore.setState((state) => ({
    ...state,
    users: remoteState.users,
    userData: remoteState.userData,
    globalResources: remoteState.globalResources,
  }));
  suppressCloudPush = false;
  latestCloudTimestamp = remoteState.updatedAt;
};

const scheduleCloudPush = (): void => {
  if (cloudPushTimer) {
    clearTimeout(cloudPushTimer);
  }

  cloudPushTimer = setTimeout(() => {
    const state = useStore.getState();
    const payload = toCloudState(state);
    latestCloudTimestamp = payload.updatedAt;
    void pushCloudState(payload).catch(() => undefined);
  }, CLOUD_PUSH_DEBOUNCE_MS);
};

const initializeCloudSync = (): void => {
  if (!isCloudSyncEnabled()) return;

  void fetchCloudState().then((remoteState) => {
    if (remoteState) {
      applyCloudState(remoteState);
    }
  });

  subscribeCloudState((remoteState) => {
    applyCloudState(remoteState);
  });

  useStore.subscribe((state, previousState) => {
    if (suppressCloudPush) return;

    const hasRelevantChange =
      state.users !== previousState.users ||
      state.userData !== previousState.userData ||
      state.globalResources !== previousState.globalResources;

    if (!hasRelevantChange) return;
    scheduleCloudPush();
  });
};

initializeCloudSync();
