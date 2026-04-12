// ============================================
// STUDY OS - TYPE DEFINITIONS
// ============================================

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Note {
  title: string;
  content: string;
  codeSnippets: string[];
  videos: string[];
  links: string[];
  images: string[];
}

export interface Item {
  id: string;
  title: string;
  completed: boolean;
  difficulty: Difficulty;
  link?: string;
  notes: Note;
  children: Item[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  items: Item[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgressLog {
  date: string;
  completedCount: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'link' | 'doc' | 'note';
  url?: string;
  content?: string;
  createdBy: string;
  visibility: 'public' | 'private';
  shareToken: string;
  accessList: string[];
  pendingRequests: string[];
  topicId?: string;
  courseId?: string;
  createdAt: string;
}

export interface UserData {
  courses: Course[];
  streak: number;
  lastActiveDate: string | null;
  progressLogs: ProgressLog[];
  notes: Record<string, Note>;
  resources: Resource[];
}

export interface User {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
}

export interface AppState {
  // Auth
  users: Record<string, User>;
  auth: AuthState;
  activeUser: string | null;
  
  // User Data
  userData: Record<string, UserData>;
  
  // Global Resources (shared across users)
  globalResources: Resource[];
  
  // Actions - Auth
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Actions - Courses
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  
  // Actions - Topics
  addTopic: (courseId: string, topic: Omit<Topic, 'id'>) => void;
  updateTopic: (courseId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (courseId: string, topicId: string) => void;
  
  // Actions - Items
  addItem: (courseId: string, topicId: string, item: Omit<Item, 'id'>) => void;
  updateItem: (courseId: string, topicId: string, itemId: string, updates: Partial<Item>) => void;
  deleteItem: (courseId: string, topicId: string, itemId: string) => void;
  toggleItem: (courseId: string, topicId: string, itemId: string) => void;
  
  // Actions - Notes
  updateNote: (courseId: string, topicId: string, itemId: string, note: Partial<Note>) => void;
  
  // Actions - Progress
  updateProgress: (completedIncrement?: number) => void;
  getStreak: () => number;
  
  // Actions - Resources
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'shareToken'>) => void;
  requestAccess: (resourceId: string) => void;
  requestAccessByToken: (token: string) => { success: boolean; message: string };
  approveAccess: (resourceId: string, username: string) => void;
  rejectAccess: (resourceId: string, username: string) => void;
  deleteResource: (resourceId: string) => void;
  
  // Getters
  getCurrentUserData: () => UserData | null;
  getCourseProgress: (courseId: string) => number;
  getTopicProgress: (courseId: string, topicId: string) => number;
  getProgressLogs: (filter: 'daily' | 'weekly' | 'monthly') => ProgressLog[];
  getPlatformStats: () => {
    totalUsers: number;
    activeUsersLast30Days: number;
    usersWithCourses: number;
  } | null;
}
