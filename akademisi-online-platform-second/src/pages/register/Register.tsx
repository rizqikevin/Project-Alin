import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log data yang dikirim
      console.log({ name, email, password, role, kelas });

      // Kirim data lengkap, termasuk kelas hanya jika student
      const success = await register(name, email, password, role, kelas);

      if (success) {
        toast.success(`Pendaftaran ${role.toLowerCase()} berhasil`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Gagal mendaftar. Periksa kembali data Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-akademisi-light-purple/30 to-white p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-akademisi-purple">
              Daftar Akun
            </h1>
            <p className="mt-2 text-gray-600">
              Buat akun baru di Akademisi Online
            </p>
          </div>

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
                className="form-input"
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
                className="form-input"
                placeholder="contoh@email.com"
                required
              />
            </div>

            {role === UserRole.STUDENT && (
              <div>
                <label htmlFor="kelas" className="form-label">
                  Kelas
                </label>
                <input
                  id="kelas"
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="form-input"
                  placeholder="Contoh: XII IPA 1"
                  required
                />
              </div>
            )}

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

            <div>
              <label className="form-label">Peran</label>
              <div className="flex space-x-4 mt-1">
                {Object.values(UserRole).map((r) => (
                  <div key={r} className="flex items-center">
                    <input
                      type="radio"
                      id={`role-${r}`}
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="mr-2"
                    />
                    <label htmlFor={`role-${r}`}>
                      {r === "STUDENT"
                        ? "Siswa"
                        : r === "TEACHER"
                        ? "Guru"
                        : "Admin"}
                    </label>
                  </div>
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
