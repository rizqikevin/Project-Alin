/* eslint-disable @typescript-eslint/no-explicit-any */
export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  teacherId: string;
  createdAt: string;
}

export interface RawQuestion {
  _id?: string;
  id?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawExam {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  questions: RawQuestion[];
  teacherId: string | { _id: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  questions: ExamQuestion[];
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawExamResult {
  _id?: string;
  id?: string;
  examId: string | RawExam;
  studentId: string;
  score: number;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  startedAt: string;
  submittedAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: { id: string; name: string; email: string };
  answers: {
    questionId: string;
    selectedAnswer: number;
  }[];
  score: number;
  submittedAt: string;
}

export interface ExamSubmission {
  examId: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
  }[];
}

export interface ExamWithDetails extends Exam {
  questions: Question[];
  results: ExamResult[];
}

export interface ExamResultWithDetails extends ExamResult {
  exam: Exam;
  student: User;
  correctAnswers: number;
  totalQuestions: number;
}
