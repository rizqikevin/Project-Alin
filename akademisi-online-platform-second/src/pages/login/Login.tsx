import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { login } from "@/services/auth-service";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Validate input
      if (!email || !password) {
        toast.error("Email dan password harus diisi");
        return;
      }
  
      console.log("Submitting login form:", {
        email: email.trim(),
        hasPassword: !!password,
      });
  
      const response = await login({
        email: email.trim(),
        password,
      });
  
      console.log("User role:", response.user.role);
      console.log("Enum TEACHER:", UserRole.TEACHER);
      const role = response.user.role;
  
      if (response.user) {
        toast.success("Login berhasil");
        console.log("User after login:", response.user);
  
        // Set timeout before navigating
        setTimeout(() => {
          if (role === UserRole.TEACHER) {
            navigate("/dashboard/guru", { replace: true });
            window.location.reload();
            console.log("Navigating based on role:", role);
          } else if (role === UserRole.STUDENT) {
            navigate("/dashboard/siswa", { replace: true });
            console.log("Navigating based on role:", role);
            window.location.reload();
          } else {
            toast.error("Role tidak dikenali");
          }
        }, 2000); // Set timeout 2 detik (2000 ms)
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (error instanceof AxiosError) {
          const axiosError = error as AxiosError<ErrorResponse>;
          toast.error(
            axiosError.response?.data?.message || "Email atau password salah"
          );
        } else {
          toast.error(error.message || "Email atau password salah");
        }
      } else {
        toast.error("Email atau password salah");
      }
    } finally {
      setIsLoading(false); // Ensure loading state is reset after error or success
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="contoh@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk"}
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
          <p className="text-center text-xs text-gray-500">Demo Akun:</p>
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
        </div>
      </Card>
    </div>
  );
}
