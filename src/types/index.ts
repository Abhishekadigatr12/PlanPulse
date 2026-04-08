export interface Subtopic {
  id: string;
  title: string;
  description: string;
  image?: string;
  completed: boolean;
  notes?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  subtopics: Subtopic[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  topics: Topic[];
}

export interface StudyState {
  courses: Course[];
  streak: number;
  lastActiveDate: string | null;
  addCourse: (course: Omit<Course, 'id' | 'topics'>) => void;
  deleteCourse: (courseId: string) => void;
  addTopic: (courseId: string, topic: Omit<Topic, 'id' | 'completed' | 'subtopics'>) => void;
  deleteTopic: (courseId: string, topicId: string) => void;
  addSubtopic: (courseId: string, topicId: string, subtopic: Omit<Subtopic, 'id' | 'completed'>) => void;
  deleteSubtopic: (courseId: string, topicId: string, subtopicId: string) => void;
  toggleSubtopic: (courseId: string, topicId: string, subtopicId: string) => void;
  updateSubtopicNotes: (courseId: string, topicId: string, subtopicId: string, notes: string) => void;
  updateStreak: () => void;
}
