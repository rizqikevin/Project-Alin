import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, Exam, ExamResult, User } from "@/types";
import {
  getExamsByTeacher,
  getExamResults,
  getExamById,
} from "@/services/exam-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExamResults() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [examDetail, setExamDetail] = useState<Exam | null>(null);

  const fetchExamResults = useCallback(async (examId: string) => {
    if (!examId) {
      setResults([]);
      return;
    }

    setIsResultsLoading(true);
    try {
      const fetchedResults = await getExamResults(examId);
      setResults(fetchedResults);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setResults([]);
    } finally {
      setIsResultsLoading(false);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const fetchedExams = await getExamsByTeacher(user.id);
      setExams(fetchedExams);

      // Only set selected exam and fetch results if we have exams
      if (fetchedExams.length > 0) {
        const firstExamId = fetchedExams[0].id;
        setSelectedExamId(firstExamId);
        await fetchExamResults(firstExamId);
        const detail = await getExamById(firstExamId);
        setExamDetail(detail);
      } else {
        setSelectedExamId(null);
        setResults([]);
        setExamDetail(null);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setSelectedExamId(null);
      setResults([]);
      setExamDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchExamResults]);

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user, fetchExams]);

  const handleExamChange = async (examId: string) => {
    if (!examId) {
      setSelectedExamId(null);
      setResults([]);
      setExamDetail(null);
      return;
    }
    setSelectedExamId(examId);
    await fetchExamResults(examId);
    const detail = await getExamById(examId);
    setExamDetail(detail);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // If no exams are available, show a message
  if (!isLoading && exams.length === 0) {
    return (
      <DashboardLayout requiredRole={UserRole.TEACHER}>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Hasil Ujian</h1>
          <Card className="p-6 text-center">
            <p>Belum ada ujian yang dibuat.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Buat ujian terlebih dahulu untuk melihat hasil.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If still loading or no selected exam, show loading state
  if (isLoading || !selectedExamId) {
    return (
      <DashboardLayout requiredRole={UserRole.TEACHER}>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Hasil Ujian</h1>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const topStudent = results
    .map((result) => {
      const correct = result.answers.filter((a) => {
        const q = examDetail?.questions.find((q) => q.id === a.questionId);
        return q && q.correctAnswer === a.selectedAnswer;
      }).length;
      const total = examDetail?.questions.length || 0;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      return {
        name: (result.studentId as User).name,
        kelas: (result.studentId as User).kelas || "-",
        score,
      };
    })
    .sort((a, b) => b.score - a.score)[0];

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Hasil Ujian</h1>

        <div>
          <Tabs value={selectedExamId} onValueChange={handleExamChange}>
            <TabsList className="mb-4 flex flex-nowrap overflow-x-auto">
              {exams.map((exam) => (
                <TabsTrigger key={exam.id} value={exam.id} className="text-sm">
                  {exam.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {exams.map((exam) => (
              <TabsContent key={exam.id} value={exam.id}>
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{exam.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        Waktu: {formatDate(exam.startTime)} • Durasi:{" "}
                        {exam.durationMinutes} menit
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-3 font-medium bg-muted/50">
                      <div key="number" className="col-span-1">
                        #
                      </div>
                      <div key="name" className="col-span-6 md:col-span-4">
                        Nama Siswa
                      </div>
                      <div
                        key="answers"
                        className="col-span-5 md:col-span-3 text-center"
                      >
                        Jawaban Benar
                      </div>
                      <div
                        key="score"
                        className="col-span-12 md:col-span-2 text-center"
                      >
                        Nilai
                      </div>
                      <div
                        key="time"
                        className="hidden md:block md:col-span-2 text-center"
                      >
                        Waktu Submit
                      </div>
                    </div>

                    {isResultsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        Belum ada siswa yang mengikuti ujian ini.
                      </div>
                    ) : (
                      results.map((result, index) => {
                        // Hitung jumlah benar dan nilai berdasarkan kunci jawaban
                        const correctAnswers = result.answers.filter((a) => {
                          const q = examDetail?.questions.find(
                            (q) => q.id === a.questionId
                          );
                          return q && q.correctAnswer === a.selectedAnswer;
                        }).length;
                        const totalQuestions =
                          examDetail?.questions.length || 0;
                        const score =
                          totalQuestions > 0
                            ? Math.round(
                                (correctAnswers / totalQuestions) * 100
                              )
                            : 0;
                        const users = JSON.parse(
                          localStorage.getItem("akademisi-users") || "[]"
                        ) as User[];
                        console.log(result.studentId);

                        return (
                          <div
                            key={result.id}
                            className="grid grid-cols-12 gap-4 p-3 border-t"
                          >
                            <div className="col-span-1">{index + 1}</div>
                            <div className="col-span-6 md:col-span-4">
                              <div className="font-medium">
                                {(result.studentId as User).name || "Siswa"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(result.studentId as User).kelas || "-"}
                              </div>
                            </div>
                            <div className="col-span-5 md:col-span-3 text-center">
                              {correctAnswers} / {totalQuestions}
                            </div>
                            <div className="col-span-12 md:col-span-2 text-center">
                              <Badge
                                className={`$${
                                  score >= 80
                                    ? "bg-green-500"
                                    : score >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              >
                                {score}
                              </Badge>
                            </div>
                            <div className="hidden md:block md:col-span-2 text-center text-sm">
                              {formatDate(result.submittedAt)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
                {/* Rangkuman Nilai */}

                <div className="mt-6 text-sm text-muted-foreground text-right">
                  <div className="mt-2 text-left">
                    {topStudent && (
                      <p>
                        Siswa Tertinggi:{" "}
                        <span className="font-medium text-black p-2">
                          {topStudent.name} ({topStudent.kelas}) -{" "}
                          {topStudent.score}
                        </span>
                      </p>
                    )}
                  </div>
                  <p>
                    Rata-rata Nilai:{" "}
                    <span className="font-medium text-black">
                      {results.length > 0
                        ? Math.round(
                            results.reduce((acc, result) => {
                              const correct = result.answers.filter((a) => {
                                const q = examDetail?.questions.find(
                                  (q) => q.id === a.questionId
                                );
                                return (
                                  q && q.correctAnswer === a.selectedAnswer
                                );
                              }).length;
                              const total = examDetail?.questions.length || 0;
                              const score =
                                total > 0 ? (correct / total) * 100 : 0;
                              return acc + score;
                            }, 0) / results.length
                          )
                        : 0}
                    </span>
                  </p>
                  <p>
                    Nilai Tertinggi:{" "}
                    <span className="font-medium text-black">
                      {results.length > 0
                        ? Math.max(
                            ...results.map((result) => {
                              const correct = result.answers.filter((a) => {
                                const q = examDetail?.questions.find(
                                  (q) => q.id === a.questionId
                                );
                                return (
                                  q && q.correctAnswer === a.selectedAnswer
                                );
                              }).length;
                              const total = examDetail?.questions.length || 0;
                              return total > 0
                                ? Math.round((correct / total) * 100)
                                : 0;
                            })
                          )
                        : 0}
                    </span>
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
