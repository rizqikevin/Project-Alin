import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, Question } from "@/types";
import {
  getQuestionsByTeacher,
  deleteQuestion,
} from "@/services/question-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Check } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";

export default function ManageQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const fetchedQuestions = await getQuestionsByTeacher(user.id);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus soal ini?"
    );
    if (confirmDelete) {
      try {
        await deleteQuestion(questionId);
        await fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Kelola Soal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuestionForm
              teacherId={user?.id || ""}
              onSuccess={() => {
                fetchQuestions();
                setEditingQuestion(null); // reset setelah sukses
              }}
              editingQuestion={editingQuestion}
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Daftar Soal</h2>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada soal yang ditambahkan.</p>
                  <p className="mt-2 text-sm">
                    Tambahkan soal baru menggunakan form di samping.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {questions.map((question) => (
                    <Card
                      key={question.id}
                      className="p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        {/* Kiri: Soal dan Gambar */}
                        <div className="flex flex-col gap-2 max-w-md">
                          <h3 className="font-medium">{question.question}</h3>
                          {question.imageUrl && (
                            <img
                              src={`http://localhost:5000${question.imageUrl}`}
                              alt="Gambar Soal"
                              className="w-40 rounded border"
                            />
                          )}
                        </div>

                        {/* Kanan: Tombol Aksi */}
                        <div className="flex items-start space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Opsi Jawaban */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        {question.options?.map((option, index) => {
                          const letter = String.fromCharCode(65 + index);
                          const isCorrect = question.correctAnswer === index;

                          return (
                            <div
                              key={index}
                              className={`p-2 rounded border ${
                                isCorrect ? "bg-green-50 border-green-200" : ""
                              }`}
                            >
                              {letter}: {option}
                              {isCorrect && (
                                <Check className="h-4 w-4 inline ml-1 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
