
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, Exam } from "@/types";
import { getActiveExams, getExamById, getStudentResults } from "@/services/exam-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActiveExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExamIds, setCompletedExamIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const activeExams = await getActiveExams();
          setExams(activeExams);

          // Check which exams the student has already completed
          const results = await getStudentResults(user.id);
          const completedIds = results.map(result => result.examId);
          setCompletedExamIds(completedIds);
        } catch (error) {
          console.error("Error fetching active exams:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

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

  const calculateRemainingTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = new Date();
    
    if (now > end) return "Selesai";
    
    const remainingMs = end.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${remainingMinutes} menit ${remainingSeconds} detik`;
  };

  const handleTakeExam = (examId: string) => {
    navigate(`/dashboard/siswa/ujian/${examId}`);
  };

  return (
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ujian Aktif</h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : exams.length === 0 ? (
          <Card className="p-6 text-center">
            <p>Tidak ada ujian aktif saat ini.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => {
              const isCompleted = completedExamIds.includes(exam.id);
              
              return (
                <Card key={exam.id} className="p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{exam.title}</h2>
                    {isCompleted ? (
                      <Badge className="bg-green-500">Selesai</Badge>
                    ) : (
                      <Badge className="bg-blue-500">Aktif</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Mulai: {formatDate(exam.startTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Durasi: {exam.durationMinutes} menit</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      <span>Jumlah Soal: {exam.questions.length}</span>
                    </div>
                    
                    {!isCompleted && (
                      <div className="text-sm font-medium text-primary">
                        Sisa waktu: {calculateRemainingTime(exam.startTime, exam.durationMinutes)}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    disabled={isCompleted}
                    onClick={() => handleTakeExam(exam.id)}
                    className="w-full"
                  >
                    {isCompleted ? "Sudah Dikerjakan" : "Ikuti Ujian"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
