
import React, { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { UserRole } from "@/types";
import { MobileDrawer } from "./MobileDrawer";

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === UserRole.TEACHER ? "/dashboard/guru" : "/dashboard/siswa"} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* Desktop sidebar trigger - visible only on desktop */}
                <div className="hidden md:block">
                  <SidebarTrigger className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">
                  {user.role === UserRole.TEACHER ? 'Dashboard Guru' : 'Dashboard Siswa'}
                </h1>
              </div>
              {/* Mobile drawer trigger - visible only on mobile */}
              <div className="md:hidden">
                <MobileDrawer />
              </div>
            </div>
            <main>{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
