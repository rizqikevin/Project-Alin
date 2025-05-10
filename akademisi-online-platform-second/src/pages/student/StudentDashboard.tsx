
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { useEffect, useState } from "react";
import { getActiveExams } from "@/services/exam-service";
import { getStudentResults } from "@/services/exam-service";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListChecks, CheckSquare, ClipboardList } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeExams: 0,
    completedExams: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const active = await getActiveExams();
          const results = await getStudentResults(user.id);
          
          setStats({
            activeExams: active.length,
            completedExams: results.length,
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
    <DashboardLayout requiredRole={UserRole.STUDENT}>
      <div className="space-y-6">
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Siswa</h1>
        </div> */}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <ListChecks className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Ujian Aktif</h3>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent my-2"></div>
            ) : (
              <p className="text-3xl font-bold text-akademisi-purple">{stats.activeExams}</p>
            )}
            <Button 
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/dashboard/siswa/ujian-aktif")}
            >
              Lihat Ujian
            </Button>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <CheckSquare className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Ujian Selesai</h3>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent my-2"></div>
            ) : (
              <p className="text-3xl font-bold text-akademisi-purple">{stats.completedExams}</p>
            )}
            <Button 
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/dashboard/siswa/hasil-ujian")}
            >
              Lihat Hasil
            </Button>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className="p-4 bg-akademisi-light-purple/30 rounded-full mb-2">
              <ClipboardList className="h-6 w-6 text-akademisi-purple" />
            </div>
            <h3 className="text-lg font-medium">Profil</h3>
            <p className="text-xl font-bold text-akademisi-purple mt-2">{user?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </Card>
        </div>

        <div className="grid gap-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Selamat Datang, {user?.name}!</h2>
            <p className="text-muted-foreground">
              Dari dashboard ini, Anda dapat melihat ujian yang aktif, mengikuti ujian, dan melihat hasil ujian Anda.
            </p>
            <div className="grid gap-3 mt-6">
              <div className="flex items-start gap-2">
                <ListChecks className="h-5 w-5 text-akademisi-purple mt-0.5" />
                <div>
                  <h3 className="font-medium">Ujian Aktif</h3>
                  <p className="text-sm text-muted-foreground">Lihat dan ikuti ujian yang sedang berlangsung</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckSquare className="h-5 w-5 text-akademisi-purple mt-0.5" />
                <div>
                  <h3 className="font-medium">Hasil Ujian</h3>
                  <p className="text-sm text-muted-foreground">Lihat hasil dan nilai ujian yang telah Anda selesaikan</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
