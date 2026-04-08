import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyState, Subtopic } from '../types';

const calculateTopicCompletion = (subtopics: Subtopic[]) => {
  if (subtopics.length === 0) return false;
  return subtopics.every(sub => sub.completed);
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      courses: [
        {
          id: '1',
          title: 'Full Stack React & Node',
          description: 'Master web development with React, Node, Express, and MongoDB.',
          image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
          topics: [
            {
              id: 't1',
              title: 'React Fundamentals',
              description: 'Learn hooks, context, state management, and routing.',
              completed: false,
              subtopics: [
                { id: 'st1', title: 'React Hooks', description: 'useState, useEffect, useMemo', completed: true },
                { id: 'st2', title: 'Context API', description: 'Global state management', completed: false }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Data Structures & Algorithms',
          description: 'Prepare for technical interviews with DSA.',
          image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
          topics: [
            {
              id: 't2',
              title: 'Arrays & Strings',
              description: 'Basic operations and algorithms',
              completed: true,
              subtopics: [
                { id: 'st3', title: 'Two Pointers', description: 'Solving problems with two pointers', completed: true },
                { id: 'st4', title: 'Sliding Window', description: 'Optimizing O(n^2) to O(n)', completed: true }
              ]
            }
          ]
        }
      ],
      streak: 0,
      lastActiveDate: null,

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { ...course, id: crypto.randomUUID(), topics: [] }],
        })),

      deleteCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter(c => c.id !== courseId)
        })),

      addTopic: (courseId, topic) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: [...course.topics, { ...topic, id: crypto.randomUUID(), completed: false, subtopics: [] }]
              };
            }
            return course;
          })
        })),

      deleteTopic: (courseId, topicId) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: course.topics.filter(t => t.id !== topicId)
              };
            }
            return course;
          })
        })),

      addSubtopic: (courseId, topicId, subtopic) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: course.topics.map(topic => {
                  if (topic.id === topicId) {
                    const newSubtopics = [...topic.subtopics, { ...subtopic, id: crypto.randomUUID(), completed: false }];
                    return {
                      ...topic,
                      subtopics: newSubtopics,
                      completed: calculateTopicCompletion(newSubtopics)
                    };
                  }
                  return topic;
                })
              };
            }
            return course;
          })
        })),

      deleteSubtopic: (courseId, topicId, subtopicId) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: course.topics.map(topic => {
                  if (topic.id === topicId) {
                    const newSubtopics = topic.subtopics.filter(st => st.id !== subtopicId);
                    return {
                      ...topic,
                      subtopics: newSubtopics,
                      completed: calculateTopicCompletion(newSubtopics)
                    };
                  }
                  return topic;
                })
              };
            }
            return course;
          })
        })),

      toggleSubtopic: (courseId, topicId, subtopicId) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: course.topics.map(topic => {
                  if (topic.id === topicId) {
                    const newSubtopics = topic.subtopics.map(subtopic => 
                      subtopic.id === subtopicId ? { ...subtopic, completed: !subtopic.completed } : subtopic
                    );
                    return {
                      ...topic,
                      subtopics: newSubtopics,
                      completed: calculateTopicCompletion(newSubtopics)
                    };
                  }
                  return topic;
                })
              };
            }
            return course;
          })
        })),

      updateSubtopicNotes: (courseId, topicId, subtopicId, notes) =>
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                topics: course.topics.map(topic => {
                  if (topic.id === topicId) {
                    return {
                      ...topic,
                      subtopics: topic.subtopics.map(subtopic => 
                        subtopic.id === subtopicId ? { ...subtopic, notes } : subtopic
                      )
                    };
                  }
                  return topic;
                })
              };
            }
            return course;
          })
        })),

      updateStreak: () => {
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastActiveDate === today) return state; // Already updated today
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (state.lastActiveDate === yesterday.toDateString()) {
            return { streak: state.streak + 1, lastActiveDate: today };
          }
          
          return { streak: 1, lastActiveDate: today };
        });
      }
    }),
    {
      name: 'study-tracker-storage',
    }
  )
);
