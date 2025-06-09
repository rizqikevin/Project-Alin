import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, Exam } from "@/types";
import {
  getExamById,
  submitExam,
  getStudentResults,
} from "@/services/exam-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Question } from "@/types";

export default function TakeExam() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D" | null>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [hasAlreadyTaken, setHasAlreadyTaken] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleSubmit = useCallback(async () => {
    if (!exam || !user) return;

    // Check if all questions are answered
    const unansweredQuestions = Object.values(answers).filter(
      (answer) => answer === null
    );
    if (unansweredQuestions.length > 0) {
      toast.error(`Ada ${unansweredQuestions.length} soal yang belum dijawab`);
      return;
    }

    setIsSubmitting(true);

    try {
      const submission = {
        examId: exam.id,
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer: selectedAnswer || "A", // Convert to string
          })
        ),
      };

      const result = await submitExam(user.id, submission);

      if (result) {
        toast.success("Jawaban berhasil dikirim");
        navigate(`/dashboard/siswa/hasil-ujian/${result.id}`);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Gagal mengirim jawaban");
    } finally {
      setIsSubmitting(false);
    }
  }, [exam, user, answers, navigate]);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId || !user) return;

      setIsLoading(true);
      try {
        // Check if student has already taken this exam
        const results = await getStudentResults(user.id);
        const alreadyTaken = results.some((result) => result.examId === examId);

        if (alreadyTaken) {
          setHasAlreadyTaken(true);
          toast.error("Anda sudah mengerjakan ujian ini sebelumnya");
          navigate("/dashboard/siswa/ujian-aktif");
          return;
        }

        const fetchedExam = await getExamById(examId);
        if (!fetchedExam) {
          toast.error("Ujian tidak ditemukan");
          navigate("/dashboard/siswa/ujian-aktif");
          return;
        }

        // Check if exam is active
        const now = new Date();
        const startTime = new Date(fetchedExam.startTime);
        const endTime = new Date(
          startTime.getTime() + fetchedExam.durationMinutes * 60000
        );

        if (now < startTime) {
          toast.error("Ujian belum dimulai");
          navigate("/dashboard/siswa/ujian-aktif");
          return;
        }

        if (now > endTime) {
          toast.error("Ujian sudah berakhir");
          navigate("/dashboard/siswa/ujian-aktif");
          return;
        }

        setExam(fetchedExam);

        // Initialize answers object
        const initialAnswers: Record<string, "A" | "B" | "C" | "D" | null> = {};
        fetchedExam.questions.forEach((question) => {
          initialAnswers[question.id] = null;
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [examId, user, navigate]);

  // Set up timer
  useEffect(() => {
    if (!exam) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const startTime = new Date(exam.startTime);
      const endTime = new Date(
        startTime.getTime() + exam.durationMinutes * 60000
      );

      if (now > endTime) {
        setTimeRemaining("Waktu Habis");
        toast.error("Waktu ujian telah habis! Jawaban akan dikirim otomatis.");
        handleSubmit();
        return;
      }

      const remainingMs = endTime.getTime() - now.getTime();
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);

      setTimeRemaining(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [exam, handleSubmit]);

  const handleAnswerChange = (
    questionId: string,
    answer: "A" | "B" | "C" | "D"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole={UserRole.STUDENT}>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (hasAlreadyTaken || !exam) {
    return (
      <DashboardLayout requiredRole={UserRole.STUDENT}>
        <div className="text-center py-8">
          <p>Ujian tidak tersedia.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="text-lg font-mono bg-akademisi-purple text-white px-3 py-1 rounded">
            {timeRemaining}
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6 text-sm">
            <p>Jumlah Soal: {exam.questions.length}</p>
            <p className="text-red-500 font-medium">
              Perhatian: Jawablah semua soal sebelum mengirim.
            </p>
          </div>

          <div className="space-y-8">
            {exam.questions.map((question) => (
              <div key={question.id} className="border-b pb-6 last:border-b-0">
                <h3 className="font-medium mb-4">{question.question}</h3>
                {question.imageUrl && (
                  <img
                    src={`http://localhost:5000${question.imageUrl}`}
                    alt="Soal Gambar"
                    className="mt-2 rounded-md max-h-48 object-contain mb-4"
                  />
                )}

                <div className="space-y-2 ml-6">
                  {question.options.map((option, index) => {
                    const answerLetter = String.fromCharCode(65 + index) as
                      | "A"
                      | "B"
                      | "C"
                      | "D";
                    return (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question.id}-${answerLetter}`}
                          name={question.id}
                          checked={answers[question.id] === answerLetter}
                          onChange={() =>
                            handleAnswerChange(question.id, answerLetter)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`${question.id}-${answerLetter}`}
                          className="text-sm"
                        >
                          {answerLetter}. {option}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || Object.values(answers).some((a) => a === null)
              }
              className="px-6"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
