import { Course, Topic } from '../types';

export const calculateCourseProgress = (course: Course): number => {
  let totalSubtopics = 0;
  let completedSubtopics = 0;

  course.topics.forEach(topic => {
    topic.subtopics.forEach(subtopic => {
      totalSubtopics++;
      if (subtopic.completed) completedSubtopics++;
    });
  });

  if (totalSubtopics === 0) return 0;
  return Math.round((completedSubtopics / totalSubtopics) * 100);
};

export const calculateTopicProgress = (topic: Topic): number => {
  if (topic.subtopics.length === 0) return 0;
  const completed = topic.subtopics.filter(st => st.completed).length;
  return Math.round((completed / topic.subtopics.length) * 100);
};

export const getOverallStats = (courses: Course[]) => {
  let totalCourses = courses.length;
  let totalTopics = 0;
  let totalCompletedTopics = 0;
  let totalSubtopics = 0;
  let totalCompletedSubtopics = 0;

  courses.forEach(course => {
    course.topics.forEach(topic => {
      totalTopics++;
      if (topic.completed) totalCompletedTopics++;
      topic.subtopics.forEach(subtopic => {
        totalSubtopics++;
        if (subtopic.completed) totalCompletedSubtopics++;
      });
    });
  });

  const overallProgress = totalSubtopics === 0 
    ? 0 
    : Math.round((totalCompletedSubtopics / totalSubtopics) * 100);

  return {
    totalCourses,
    totalTopics,
    totalCompletedTopics,
    totalSubtopics,
    totalCompletedSubtopics,
    overallProgress
  };
};
