import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, ExamResult, Exam, ExamQuestion } from "@/types";
import { getStudentResults, getExamById } from "@/services/exam-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function StudentResults() {
  const { resultId } = useParams<{ resultId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResultsAndExam = async () => {
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      try {
        const rawResults = await getStudentResults(user.id);
        setResults(rawResults);
        
        const selected = resultId
          ? rawResults.find((r) => r.id === resultId) ||
            rawResults[0]
          : rawResults[0];
        setSelectedResult(selected);

        if (selected) {
          const examIdToFetch = selected.examId;
          if (examIdToFetch) {
            const examData = await getExamById(examIdToFetch);
            if (examData) {
              setSelectedExam(examData);
            }
          } else {
            console.error("Invalid examId:", selected.examId);
            setSelectedExam(null);
          }
        } else {
          setSelectedExam(null);
        }
      } catch (error) {
        console.error("Error fetching results or exam:", error);
        toast.error("Gagal mengambil data hasil ujian");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResultsAndExam();
  }, [user, resultId, navigate]);

  const handleSelectResult = async (result: ExamResult) => {
    setSelectedResult(result);
    navigate(`/dashboard/siswa/hasil-ujian/${result.id}`);

    try {
      const examIdToFetch = result.examId;
      if (examIdToFetch) {
        const examData = await getExamById(examIdToFetch);
        if (examData) {
          setSelectedExam(examData);
        }
      } else {
        console.error("Invalid examId:", result.examId);
        setSelectedExam(null);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      toast.error("Gagal mengambil data ujian");
      setSelectedExam(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAnswerStatus = (selectedAnswer: number, correctAnswer: number) => {
    return selectedAnswer === correctAnswer
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Fungsi untuk menghitung skor berdasarkan jawaban dan kunci jawaban
  const calculateScore = () => {
    if (!selectedResult || !selectedExam) return 0;
    const total = selectedResult.answers.length;
    const correct = selectedResult.answers.filter((a) => {
      const q = selectedExam.questions.find(q => q.id === a.questionId);
      return q && q.correctAnswer === a.selectedAnswer;
    }).length;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Hasil Ujian</h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : results.length === 0 ? (
          <Card className="p-6 text-center">
            <p>Anda belum mengikuti ujian manapun.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exam List */}
            <div className="md:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Daftar Ujian</h2>
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedResult?.id === result.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {selectedExam?.id === result.examId
                              ? selectedExam.title
                              : "Ujian"}
                          </p>
                          <p className="text-xs opacity-80">
                            {formatDate(result.submittedAt)}
                          </p>
                        </div>
                        <Badge className={getScoreColor(
                          (() => {
                            if (!selectedExam) return 0;
                            const total = result.answers.length;
                            const correct = result.answers.filter((a) => {
                              const q = selectedExam.questions.find(q => q.id === a.questionId);
                              return q && q.correctAnswer === a.selectedAnswer;
                            }).length;
                            return total > 0 ? Math.round((correct / total) * 100) : 0;
                          })()
                        )}>
                          {(() => {
                            if (!selectedExam) return 0;
                            const total = result.answers.length;
                            const correct = result.answers.filter((a) => {
                              const q = selectedExam.questions.find(q => q.id === a.questionId);
                              return q && q.correctAnswer === a.selectedAnswer;
                            }).length;
                            return total > 0 ? Math.round((correct / total) * 100) : 0;
                          })()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Results Details */}
            {selectedResult && selectedExam && (
              <div className="md:col-span-2">
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedExam.title || "Hasil Ujian"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Dikerjakan pada:{" "}
                        {formatDate(selectedResult.submittedAt)}
                      </p>
                    </div>
                    <Badge className={getScoreColor(calculateScore())}>
                      Nilai: {calculateScore()}
                    </Badge>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted p-4 rounded-md text-center">
                      <p className="text-sm font-medium">Total Soal</p>
                      <p className="text-2xl font-bold">
                        {selectedResult.answers.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <p className="text-sm font-medium text-green-700">
                        Benar
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {
                          selectedResult.answers.filter((a) => 
                            selectedExam.questions.find(q => 
                              q.id === a.questionId
                            )?.correctAnswer === a.selectedAnswer
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-md text-center">
                      <p className="text-sm font-medium text-red-700">Salah</p>
                      <p className="text-2xl font-bold text-red-700">
                        {
                          selectedResult.answers.filter((a) => 
                            selectedExam.questions.find(q => 
                              q.id === a.questionId
                            )?.correctAnswer !== a.selectedAnswer
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Answers Detail */}
                  <h3 className="font-bold mb-4">Detail Jawaban</h3>
                  <div className="space-y-4">
                    {selectedResult.answers.map((answer, index) => {
                      const question = selectedExam.questions.find(
                        (q) => q.id === answer.questionId
                      );

                      if (!question) return null;

                      const isCorrect = question.correctAnswer === answer.selectedAnswer;

                      return (
                        <Card key={answer.questionId} className="p-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium mb-2">
                                {question.question}
                              </p>

                              {/* Student Answer */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">Jawaban Anda:</span>
                                <Badge
                                  className={getAnswerStatus(answer.selectedAnswer, question.correctAnswer)}
                                >
                                  {question.options[answer.selectedAnswer]}
                                </Badge>
                                {isCorrect ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                              </div>

                              {/* Correct Answer */}
                              {!isCorrect && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    Kunci Jawaban:
                                  </span>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {`(${"ABCD"[question.correctAnswer]}) ${
                                      question.options[question.correctAnswer]
                                    }`}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
