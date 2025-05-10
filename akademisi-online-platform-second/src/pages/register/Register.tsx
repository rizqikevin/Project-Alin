
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types";
import { toast } from "sonner";

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
        if (role === UserRole.TEACHER) {
          toast.success("Pendaftaran guru berhasil");
          navigate("/login");
        } else {
          toast.success("Pendaftaran siswa berhasil");
          navigate("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-akademisi-light-purple/30 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-akademisi-purple">Daftar Akun</h1>
          <p className="mt-2 text-gray-600">Buat akun baru di Akademisi Online</p>
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
              <div className="flex items-center">
                <input
                  type="radio"
                  id="role-student"
                  name="role"
                  value={UserRole.STUDENT}
                  checked={role === UserRole.STUDENT}
                  onChange={() => setRole(UserRole.STUDENT)}
                  className="mr-2"
                />
                <label htmlFor="role-student">Siswa</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="role-teacher"
                  name="role"
                  value={UserRole.TEACHER}
                  checked={role === UserRole.TEACHER}
                  onChange={() => setRole(UserRole.TEACHER)}
                  className="mr-2"
                />
                <label htmlFor="role-teacher">Guru</label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="font-medium text-akademisi-purple hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
