import api from './api';
import { Question } from "../types";
import { toast } from "sonner";

const QUESTIONS_STORAGE_KEY = "akademisi-questions";

// Initialize local storage with empty questions array if it doesn't exist
const initializeStorage = () => {
  const storedQuestions = localStorage.getItem(QUESTIONS_STORAGE_KEY);
  if (!storedQuestions) {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all questions
export const getQuestions = async (): Promise<Question[]> => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Get questions by teacher ID
export const getQuestionsByTeacher = async (teacherId: string): Promise<Question[]> => {
  try {
    console.log('Fetching questions for teacher:', teacherId);
    const response = await api.get(`/questions?teacherId=${teacherId}`);
    console.log('Questions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Get a single question
export const getQuestion = async (id: string): Promise<Question> => {
  try {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

// Add a new question
export const addQuestion = async (questionData: {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  teacherId: string;
}): Promise<Question> => {
  try {
    console.log('Adding new question:', questionData);

    // Validate data before sending
    if (!questionData.question || !questionData.options || 
        questionData.correctAnswer === undefined || !questionData.explanation || !questionData.teacherId) {
      throw new Error('Missing required fields');
    }

    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    if (questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
      throw new Error('Correct answer must be between 0 and 3');
    }

    const response = await api.post('/questions', {
      question: questionData.question.trim(),
      options: questionData.options.map(opt => opt.trim()),
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation.trim(),
      teacherId: questionData.teacherId
    });

    console.log('Question added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

// Update a question
export const updateQuestion = async (id: string, questionData: {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}): Promise<Question> => {
  try {
    console.log('Updating question:', { id, questionData });

    // Validate data before sending
    if (!questionData.question || !questionData.options || 
        questionData.correctAnswer === undefined || !questionData.explanation) {
      throw new Error('Missing required fields');
    }

    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
      throw new Error('Question must have exactly 4 options');
    }

    if (questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
      throw new Error('Correct answer must be between 0 and 3');
    }
    
    const response = await api.put(`/questions/${id}`, {
      question: questionData.question.trim(),
      options: questionData.options.map(opt => opt.trim()),
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation.trim()
    });

    console.log('Question updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    console.log('Deleting question:', id);
    await api.delete(`/questions/${id}`);
    console.log('Question deleted successfully');
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
