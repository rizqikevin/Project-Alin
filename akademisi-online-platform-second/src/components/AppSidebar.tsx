import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import {
  Book,
  LogOut,
  User,
  PlusCircle,
  ListChecks,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const isTeacher = user.role === UserRole.TEACHER;
  const menuItems = isTeacher
    ? [
        {
          title: "Dashboard",
          icon: Book,
          path: "/dashboard/guru",
        },
        {
          title: "Kelola Soal",
          icon: PlusCircle,
          path: "/dashboard/guru/kelola-soal",
        },
        {
          title: "Atur Ujian",
          icon: ListChecks,
          path: "/dashboard/guru/atur-ujian",
        },
        {
          title: "Hasil Ujian",
          icon: CheckSquare,
          path: "/dashboard/guru/hasil-ujian",
        },
      ]
    : [
        {
          title: "Dashboard",
          icon: Book,
          path: "/dashboard/siswa",
        },
        {
          title: "Ujian Aktif",
          icon: ListChecks,
          path: "/dashboard/siswa/ujian-aktif",
        },
        {
          title: "Hasil Ujian",
          icon: CheckSquare,
          path: "/dashboard/siswa/hasil-ujian",
        },
      ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center py-4">
        <div className="flex flex-col px-2">
          <h2 className="text-lg font-semibold text-akademisi-purple">
            Akademisi <span className="text-akademisi-dark-purple">Online</span>
          </h2>
        </div>
        {/* <SidebarTrigger className="ml-auto h-8 w-8" /> */}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => navigate(item.path)}
                  >
                    <button className="flex w-full items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t py-4">
        <div className="flex items-center px-3">
          <User className="mr-2 h-4 w-4" />
          <div className="text-sm flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {user.role === UserRole.TEACHER ? "Guru" : "Siswa"}
            </span>
          </div>
          <button
            className="ml-auto rounded-full p-2 text-muted-foreground hover:bg-muted"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
