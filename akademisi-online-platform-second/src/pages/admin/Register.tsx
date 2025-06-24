import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import RawRegistrationLogViewer from "./RawRegistrationLogViewer";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(name, email, password, role);
      if (success) {
        toast.success(`Pendaftaran ${role.toLowerCase()} berhasil`);
        navigate("/login");
      }
    } catch {
      toast.error("Gagal mendaftar. Periksa kembali data Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="grid grid-cols-1 lg:grid-cols-2 justify-center gap-6 p-4">
        {/* === Form Pendaftaran === */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-akademisi-purple mb-4">
            Form Pendaftaran Pengguna
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input w-full"
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full"
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
                className="form-input w-full"
                placeholder="Password"
                required
              />
            </div>

            <div>
              <label className="form-label">Peran</label>
              <div className="flex flex-wrap gap-4 mt-2">
                {Object.values(UserRole).map((r) => (
                  <label key={r} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                    <span>
                      {r === "STUDENT"
                        ? "Siswa"
                        : r === "TEACHER"
                        ? "Guru"
                        : "Admin"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
