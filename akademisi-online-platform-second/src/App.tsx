import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { UserRole } from "./types";

// Auth pages
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ManageQuestions from "./pages/teacher/ManageQuestions";
import ManageExams from "./pages/teacher/ManageExams";
import ExamResults from "./pages/teacher/ExamResults";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import ActiveExams from "./pages/student/ActiveExams";
import TakeExam from "./pages/student/TakeExam";
import StudentResults from "./pages/student/StudentResults";

// Create a new QueryClient instance outside of the component to avoid recreation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Teacher routes */}
              <Route
                path="/dashboard/guru"
                element={
                  <PrivateRoute requiredRole={UserRole.TEACHER}>
                    <TeacherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/guru/kelola-soal"
                element={
                  <PrivateRoute requiredRole={UserRole.TEACHER}>
                    <ManageQuestions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/guru/atur-ujian"
                element={
                  <PrivateRoute requiredRole={UserRole.TEACHER}>
                    <ManageExams />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/guru/hasil-ujian"
                element={
                  <PrivateRoute requiredRole={UserRole.TEACHER}>
                    <ExamResults />
                  </PrivateRoute>
                }
              />

              {/* Student routes */}
              <Route
                path="/dashboard/siswa"
                element={
                  <PrivateRoute requiredRole={UserRole.STUDENT}>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/siswa/ujian-aktif"
                element={
                  <PrivateRoute requiredRole={UserRole.STUDENT}>
                    <ActiveExams />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/siswa/ujian/:examId"
                element={
                  <PrivateRoute requiredRole={UserRole.STUDENT}>
                    <TakeExam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/siswa/hasil-ujian"
                element={
                  <PrivateRoute requiredRole={UserRole.STUDENT}>
                    <StudentResults />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/siswa/hasil-ujian/:resultId"
                element={
                  <PrivateRoute requiredRole={UserRole.STUDENT}>
                    <StudentResults />
                  </PrivateRoute>
                }
              />

              {/* Redirect to the dashboard for authenticated users */}
              <Route
                path="/dashboard/admin"
                element={
                  <PrivateRoute requiredRole={UserRole.ADMIN}>
                    <Register />
                  </PrivateRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
