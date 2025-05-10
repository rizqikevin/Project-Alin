
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LogOut, User, PlusCircle, ListChecks, CheckSquare, Book } from "lucide-react";

export function MobileDrawer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg font-semibold text-akademisi-purple">
            Akademisi <span className="text-akademisi-dark-purple">Online</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="justify-start w-full"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </nav>
        </div>
        <DrawerFooter className="border-t">
          <div className="flex items-center px-3">
            <User className="mr-2 h-4 w-4" />
            <div className="text-sm flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.role === UserRole.TEACHER ? "Guru" : "Siswa"}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="mt-2">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
