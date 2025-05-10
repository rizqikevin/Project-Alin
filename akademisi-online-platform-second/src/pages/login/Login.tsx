import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const success = await authLogin(data.email.trim(), data.password);
      
      if (success) {
        toast.success("Login berhasil");
        
        // Navigate based on role
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('user_data') || '{}');
          if (user.role === UserRole.TEACHER) {
            navigate("/dashboard/guru", { replace: true });
          } else if (user.role === UserRole.STUDENT) {
            navigate("/dashboard/siswa", { replace: true });
          } else {
            toast.error("Role tidak dikenali");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || "Email atau password salah";
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan saat login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-akademisi-light-purple/30 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-akademisi-purple">
            Akademisi Online
          </h1>
          <p className="mt-2 text-gray-600">
            Platform ujian online untuk guru dan siswa
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Belum memiliki akun?{" "}
            <Link
              to="/register"
              className="font-medium text-akademisi-purple hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="text-center">
            <summary className="text-xs text-gray-500 cursor-pointer">
              Lihat Demo Akun
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-md bg-gray-50 p-2">
                <p>
                  <strong>Guru:</strong>
                </p>
                <p>Email: guru@example.com</p>
                <p>Password: password123</p>
              </div>
              <div className="rounded-md bg-gray-50 p-2">
                <p>
                  <strong>Siswa:</strong>
                </p>
                <p>Email: siswa@example.com</p>
                <p>Password: password123</p>
              </div>
            </div>
          </details>
        </div>
      </Card>
    </div>
  );
}
