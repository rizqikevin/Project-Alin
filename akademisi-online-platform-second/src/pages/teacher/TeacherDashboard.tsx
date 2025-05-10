
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { useEffect, useState } from "react";
import { getQuestionsByTeacher } from "@/services/question-service";
import { getExamsByTeacher, getExamResults } from "@/services/exam-service";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListChecks, CheckSquare } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    totalSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const questions = await getQuestionsByTeacher(user.id);
          const exams = await getExamsByTeacher(user.id);
          
          // Calculate total submissions across all exams
          let totalSubmissions = 0;
          for (const exam of exams) {
            const results = await getExamResults(exam.id);
            totalSubmissions += results.length;
          }
          
          setStats({
            totalQuestions: questions.length,
            totalExams: exams.length,
            totalSubmissions,
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <DashboardLayout requiredRole={UserRole.TEACHER}>
      <div className="space-y-6">
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Guru</h1>
        </div> */}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <PlusCircle className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Soal</h3>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent my-2"></div>
            ) : (
              <p className="text-3xl font-bold text-akademisi-purple">{stats.totalQuestions}</p>
            )}
            <Button 
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/dashboard/guru/kelola-soal")}
            >
              Kelola Soal
            </Button>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <ListChecks className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Ujian</h3>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent my-2"></div>
            ) : (
              <p className="text-3xl font-bold text-akademisi-purple">{stats.totalExams}</p>
            )}
            <Button 
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/dashboard/guru/atur-ujian")}
            >
              Atur Ujian
            </Button>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <CheckSquare className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Pengumpulan</h3>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent my-2"></div>
            ) : (
              <p className="text-3xl font-bold text-akademisi-purple">{stats.totalSubmissions}</p>
            )}
            <Button 
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/dashboard/guru/hasil-ujian")}
            >
              Lihat Hasil
            </Button>
          </Card>
        </div>

        <div className="grid gap-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Selamat Datang, {user?.name}!</h2>
            <p className="text-muted-foreground">
              Dari dashboard ini, Anda dapat mengelola bank soal, membuat ujian baru, dan melihat hasil ujian siswa.
            </p>
            <div className="grid gap-3 mt-6">
              <div className="flex items-start gap-2">
                <PlusCircle className="h-5 w-5 text-akademisi-purple mt-0.5" />
                <div>
                  <h3 className="font-medium">Kelola Soal</h3>
                  <p className="text-sm text-muted-foreground">Buat dan kelola bank soal pilihan ganda</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ListChecks className="h-5 w-5 text-akademisi-purple mt-0.5" />
                <div>
                  <h3 className="font-medium">Atur Ujian</h3>
                  <p className="text-sm text-muted-foreground">Buat ujian baru dengan memilih soal dari bank soal</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckSquare className="h-5 w-5 text-akademisi-purple mt-0.5" />
                <div>
                  <h3 className="font-medium">Hasil Ujian</h3>
                  <p className="text-sm text-muted-foreground">Lihat hasil dan nilai ujian siswa</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
