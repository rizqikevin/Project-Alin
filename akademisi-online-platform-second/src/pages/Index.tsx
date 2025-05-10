import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log('User authenticated, redirecting based on role:', user.role);
        // If user is already logged in, redirect to appropriate dashboard
        if (user.role === UserRole.TEACHER) {
          navigate("/dashboard/guru", { replace: true });
        } else {
          navigate("/dashboard/siswa", { replace: true });
        }
      } else {
        console.log('No user found, redirecting to login');
        // If no user, redirect to login page
        navigate("/login", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-akademisi-light-purple/30 to-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
