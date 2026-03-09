/**
 * E-Learning API Service
 */
import apiClient from './apiClient';

export interface Course {
  id: string;
  level: 'basic' | 'intermediate' | 'advanced';
  title: string;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWithSections extends Course {
  sections: Section[];
}

export interface CourseProgress {
  course_id: string;
  course_title: string;
  course_level: string;
  total_sections: number;
  completed_sections: number;
  progress_percentage: number;
  quizzes_passed: number;
  exam_passed: boolean;
  certificate_id: string | null;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[];
  explanation?: string | null;
}

export interface QuizResult {
  quiz_number: number;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  correct_answers: Record<string, string>;
  explanations: Record<string, string | null>;
}

export interface ExamResult {
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  correct_answers: Record<string, string>;
  explanations: Record<string, string | null>;
  certificate_id: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  pdf_path: string | null;
  user_name?: string;
  user_email?: string;
  course_title?: string;
  course_level?: string;
}

// ====== Courses ======

export const listCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get('/elearning/courses');
  return response.data;
};

export const getCourse = async (courseId: string): Promise<CourseWithSections> => {
  const response = await apiClient.get(`/elearning/courses/${courseId}`);
  return response.data;
};

export const getMyProgress = async (): Promise<CourseProgress[]> => {
  const response = await apiClient.get('/elearning/courses/progress');
  return response.data;
};

// ====== Progress ======

export const markSectionComplete = async (sectionId: string): Promise<void> => {
  await apiClient.post('/elearning/progress/complete', { section_id: sectionId });
};

export const getCourseProgress = async (courseId: string): Promise<any[]> => {
  const response = await apiClient.get(`/elearning/progress/${courseId}`);
  return response.data;
};

// ====== Quiz ======

export const getQuizQuestions = async (
  courseId: string,
  quizNumber: number
): Promise<Question[]> => {
  const response = await apiClient.get(
    `/elearning/quiz/${courseId}/${quizNumber}`
  );
  return response.data;
};

export const submitQuiz = async (
  courseId: string,
  quizNumber: number,
  answers: Record<string, string>
): Promise<QuizResult> => {
  const response = await apiClient.post('/elearning/quiz/submit', {
    course_id: courseId,
    quiz_number: quizNumber,
    answers,
  });
  return response.data;
};

// ====== Exam ======

export const getExamQuestions = async (courseId: string): Promise<Question[]> => {
  const response = await apiClient.get(`/elearning/exam/${courseId}`);
  return response.data;
};

export const submitExam = async (
  courseId: string,
  answers: Record<string, string>
): Promise<ExamResult> => {
  const response = await apiClient.post('/elearning/exam/submit', {
    course_id: courseId,
    answers,
  });
  return response.data;
};

// ====== Certificates ======

export const getMyCertificates = async (): Promise<Certificate[]> => {
  const response = await apiClient.get('/elearning/certificates');
  return response.data;
};

export const getCertificate = async (certificateId: string): Promise<Certificate> => {
  const response = await apiClient.get(`/elearning/certificates/${certificateId}`);
  return response.data;
};

export const downloadCertificate = async (certificateId: string): Promise<void> => {
  const response = await apiClient.get(
    `/elearning/certificates/${certificateId}/download`,
    { responseType: 'blob' }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `certificate_${certificateId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ====== Admin ======

export const getStatsOverview = async (): Promise<any> => {
  const response = await apiClient.get('/elearning/admin/stats/overview');
  return response.data;
};

export const getUserStats = async (): Promise<any[]> => {
  const response = await apiClient.get('/elearning/admin/stats/users');
  return response.data;
};

export const getCourseStats = async (courseId: string): Promise<any> => {
  const response = await apiClient.get(`/elearning/admin/stats/course/${courseId}`);
  return response.data;
};
