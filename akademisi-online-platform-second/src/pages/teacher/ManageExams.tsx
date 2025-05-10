import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole, Exam } from "@/types";
import { getExamsByTeacher } from "@/services/exam-service";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExamForm from "@/components/ExamForm";

export default function ManageExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExams = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const fetchedExams = await getExamsByTeacher(user.id);
        setExams(fetchedExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

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

  // Get exam status
  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime.getTime() + exam.durationMinutes * 60000);
    
    if (now < startTime) {
      return { status: "upcoming", label: "Akan Datang" };
    } else if (now >= startTime && now <= endTime) {
      return { status: "active", label: "Aktif" };
    } else {
      return { status: "completed", label: "Selesai" };
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Atur Ujian</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExamForm onExamAdded={fetchExams} />
          </div>
          
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Daftar Ujian</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada ujian yang dibuat.</p>
                  <p className="mt-2 text-sm">Buat ujian baru menggunakan form di samping.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {exams.map((exam) => {
                    const { status, label } = getExamStatus(exam);
                    
                    return (
                      <Card key={exam.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Mulai: {formatDate(exam.startTime)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Durasi: {exam.durationMinutes} menit
                            </p>
                            <p className="text-sm mt-1">
                              Jumlah Soal: {exam.questions.length}
                            </p>
                          </div>
                          <Badge 
                            className={`
                              ${status === 'active' ? 'bg-green-500' : 
                                status === 'upcoming' ? 'bg-blue-500' : 
                                'bg-gray-500'}
                            `}
                          >
                            {label}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
