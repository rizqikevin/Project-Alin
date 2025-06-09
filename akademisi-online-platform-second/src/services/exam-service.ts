import api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ExamResult, RawExamResult } from "@/types";

// Types
interface RawQuestion {
  _id?: string;
  id?: string;
  question: string;
  options?: string[];
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  imageUrl?: string;
  teacherId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawExam {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  questions?: RawQuestion[];
  teacherId?: string | { _id: string } | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExamSubmission {
  examId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
}

// Validate exam data
const validateExam = (exam: RawExam): boolean => {
  if (!exam) {
    console.error("Exam is null or undefined");
    return false;
  }

  // Validate required fields
  if (!exam._id) {
    console.error("Missing exam ID");
    return false;
  }

  if (!exam.title) {
    console.error("Missing exam title");
    return false;
  }

  if (!exam.startTime) {
    console.error("Missing start time");
    return false;
  }

  if (typeof exam.durationMinutes !== "number" || exam.durationMinutes <= 0) {
    console.error("Invalid duration:", exam.durationMinutes);
    return false;
  }

  // Validate questions if present
  if (exam.questions && Array.isArray(exam.questions)) {
    for (const question of exam.questions) {
      if (!question) continue; // Skip null/undefined questions

      // Validate question text
      if (!question.question) {
        console.error("Missing question text:", question);
        return false;
      }

      // Check if question has either options array or individual options
      if (Array.isArray(question.options)) {
        if (question.options.length < 4) {
          console.error("Question must have at least 4 options:", question);
          return false;
        }
      } else {
        // Check individual options
        const requiredOptions = ["optionA", "optionB", "optionC", "optionD"];
        const hasAllOptions = requiredOptions.every(
          (option) =>
            question[option] !== undefined && question[option] !== null
        );

        if (!hasAllOptions) {
          console.error("Question missing required options:", question);
          return false;
        }
      }
    }
  }

  return true;
};

// Transform raw exam data to Exam type
const transformExam = (rawExam: RawExam): Exam => {
  // Handle teacherId which could be string, object, or null
  let teacherId = "";
  const teacherIdData = rawExam.teacherId;

  if (teacherIdData) {
    if (
      typeof teacherIdData === "object" &&
      teacherIdData !== null &&
      "_id" in teacherIdData
    ) {
      teacherId = teacherIdData._id;
    } else if (typeof teacherIdData === "string") {
      teacherId = teacherIdData;
    }
  }

  // Transform questions
  const transformedQuestions = Array.isArray(rawExam.questions)
    ? rawExam.questions.map((q) => {
        // Handle both array and individual options format
        let options: string[] = [];

        if (Array.isArray(q.options)) {
          options = q.options;
        } else {
          options = [
            q.optionA || "",
            q.optionB || "",
            q.optionC || "",
            q.optionD || "",
          ];
        }

        let correctAnswer = 0;

        if (typeof q.correctAnswer === "string") {
          const index = "ABCD".indexOf(q.correctAnswer.toUpperCase());
          if (index !== -1) {
            correctAnswer = index;
          }
        } else if (typeof q.correctAnswer === "number") {
          correctAnswer = q.correctAnswer;
        }

        return {
          id: q._id || q.id || "",
          question: q.question || "",
          options,
          imageUrl: q.imageUrl || "",
          correctAnswer,
        };
      })
    : [];

  return {
    id: rawExam._id,
    title: rawExam.title,
    description: rawExam.description || "",
    startTime: rawExam.startTime,
    durationMinutes: rawExam.durationMinutes,
    questions: transformedQuestions,
    teacherId,
    createdAt: rawExam.createdAt,
    updatedAt: rawExam.updatedAt,
  };
};

// Transform raw exam result data to ExamResult type
const transformExamResult = (rawResult: RawExamResult): ExamResult => {
  // Handle examId which could be string or RawExam object
  let examId = "";
  if (typeof rawResult.examId === "string") {
    examId = rawResult.examId;
  } else if (
    rawResult.examId &&
    typeof rawResult.examId === "object" &&
    "_id" in rawResult.examId
  ) {
    examId = rawResult.examId._id;
  }

  // Transform answers and calculate score
  const transformedAnswers = Array.isArray(rawResult.answers)
    ? rawResult.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: "ABCD".indexOf(answer.selectedAnswer),
      }))
    : [];

  // Calculate score based on correct answers
  const totalQuestions = transformedAnswers.length;
  const correctAnswers = transformedAnswers.filter((answer, index) => {
    const originalAnswer = rawResult.answers[index];
    return originalAnswer.isCorrect;
  }).length;

  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return {
    id: rawResult._id || rawResult.id || "",
    examId,
    studentId: rawResult.studentId,
    score,
    answers: transformedAnswers,
    submittedAt: rawResult.submittedAt,
  };
};

// Get all exams for a teacher
export const getExamsByTeacher = async (teacherId: string): Promise<Exam[]> => {
  try {
    const { data } = await api.get<RawExam[]>(`/exams/teacher/${teacherId}`);
    console.log("Teacher exams received:", data);

    return data.map((exam) => transformExam(exam));
  } catch (error) {
    console.error("Error fetching teacher exams:", error);
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Gagal mengambil data ujian"
      );
    } else {
      toast.error("Terjadi kesalahan saat mengambil data ujian");
    }
    return [];
  }
};

// Get exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
  try {
    const { data } = await api.get<RawExam>(`/exams/${examId}`);
    console.log("Exam received:", data);

    if (!validateExam(data)) {
      console.error("Invalid exam data received:", data);
      return null;
    }

    return transformExam(data);
  } catch (error) {
    console.error("Error fetching exam:", error);
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Gagal mengambil data ujian"
      );
    } else {
      toast.error("Terjadi kesalahan saat mengambil data ujian");
    }
    return null;
  }
};

// Get active exams
export const getActiveExams = async (): Promise<Exam[]> => {
  try {
    const { data } = await api.get<RawExam[]>("/exams/active");
    console.log("Active exams received:", data);

    return data.map((exam) => transformExam(exam));
  } catch (error) {
    console.error("Error fetching active exams:", error);
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Gagal mengambil data ujian aktif"
      );
    } else {
      toast.error("Terjadi kesalahan saat mengambil data ujian aktif");
    }
    return [];
  }
};

// Get exam results for a specific student
export const getStudentResults = async (
  studentId: string
): Promise<ExamResult[]> => {
  if (!studentId) {
    console.error("Invalid student ID");
    return [];
  }

  try {
    console.log("Fetching results for student:", studentId);
    const { data } = await api.get<RawExamResult[]>(
      `/results/student/${studentId}`
    );
    console.log("Student results received:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid results format:", data);
      return [];
    }

    return data.map((result) => transformExamResult(result));
  } catch (error) {
    console.error("Error fetching student results:", error);
    if (error instanceof AxiosError) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    toast.error("Gagal mengambil hasil ujian siswa");
    return [];
  }
};

// Get all results for a specific exam
export const getExamResults = async (examId: string): Promise<ExamResult[]> => {
  if (!examId) {
    console.error("Invalid exam ID:", examId);
    return [];
  }

  try {
    console.log("Fetching results for exam:", examId);
    const { data } = await api.get<RawExamResult[]>(`/results/exam/${examId}`);
    console.log("Exam results received:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid results format:", data);
      return [];
    }

    return data.map((result) => transformExamResult(result));
  } catch (error) {
    console.error("Error fetching exam results:", error);
    if (error instanceof AxiosError) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    toast.error("Gagal mengambil hasil ujian");
    return [];
  }
};

// Submit exam answers
export const submitExam = async (
  studentId: string,
  submission: ExamSubmission
): Promise<ExamResult | null> => {
  if (!submission.examId) {
    console.error("Invalid exam ID");
    return null;
  }

  try {
    console.log("Submitting exam answers:", {
      studentId,
      examId: submission.examId,
      answers: submission.answers,
    });

    const { data } = await api.post<RawExamResult>(
      `/results/${submission.examId}/submit`,
      {
        studentId,
        answers: submission.answers,
      }
    );

    console.log("Exam submission response:", data);
    return transformExamResult(data);
  } catch (error) {
    console.error("Error submitting exam:", error);
    if (error instanceof AxiosError) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    toast.error("Gagal mengirim jawaban ujian");
    return null;
  }
};

// Create a new exam
export const createExam = async (
  title: string,
  description: string,
  startTime: string,
  durationMinutes: number,
  questions: string[],
  teacherId: string
): Promise<Exam | null> => {
  // Validate input
  if (!title || typeof title !== "string") {
    toast.error("Judul ujian tidak valid");
    return null;
  }

  if (!startTime || typeof startTime !== "string") {
    toast.error("Waktu mulai tidak valid");
    return null;
  }

  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    toast.error("Durasi ujian tidak valid");
    return null;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    toast.error("Pertanyaan tidak boleh kosong");
    return null;
  }

  if (!teacherId) {
    toast.error("ID guru tidak tersedia");
    return null;
  }

  try {
    const { data } = await api.post<RawExam>("/exams", {
      title,
      description,
      startTime,
      durationMinutes,
      questions,
      teacherId,
    });

    toast.success("Ujian berhasil dibuat");
    return transformExam(data);
  } catch (error) {
    console.error("Error creating exam:", error);
    if (error instanceof AxiosError) {
      console.error("Response data:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal membuat ujian");
    } else {
      toast.error("Terjadi kesalahan saat membuat ujian");
    }
    return null;
  }
};
