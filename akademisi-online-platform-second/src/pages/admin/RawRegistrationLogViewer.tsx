import { useEffect, useState } from "react";
import {
  getRawRegistrationLogs,
  deleteRawRegistrationLog,
  updateRawRegistrationLog,
} from "@/services/auth-service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export interface RawRegistration {
  _id: string; // penting untuk edit/delete
  name: string;
  email: string;
  password: string;
  role: UserRole;
  kelas?: string;
  createdAt: string;
}

export default function RawRegistrationLogViewer() {
  const [logs, setLogs] = useState<RawRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RawRegistration>>({});

  const fetchLogs = async () => {
    try {
      const data = await getRawRegistrationLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = async (id: string) => {
    try {
      await updateRawRegistrationLog(id, editData);
      toast.success("Log diperbarui");
      setEditingId(null);
      setEditData({});
      fetchLogs();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Gagal update data");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus log ini?");
    if (!confirmDelete) return;

    try {
      await deleteRawRegistrationLog(id);
      toast.success("Log dihapus");
      setLogs((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Log Registrasi</h2>

        {isLoading ? (
          <p>Memuat data...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">Tidak ada data log ditemukan.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isEditing = editingId === log._id;

              return (
                <div
                  key={log._id}
                  className="p-4 rounded border border-muted bg-muted/20 space-y-2"
                >
                  {isEditing ? (
                    <>
                      <input
                        value={editData.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="form-input w-full"
                        placeholder="Nama"
                      />
                      <input
                        value={editData.email || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="form-input w-full"
                        placeholder="Email"
                      />
                      <input
                        value={editData.password || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, password: e.target.value })
                        }
                        className="form-input w-full"
                        placeholder="Password"
                      />
                      <input
                        value={editData.kelas || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, kelas: e.target.value })
                        }
                        className="form-input w-full"
                        placeholder="Kelas (opsional)"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(log._id)}
                          className="px-4 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditData({});
                          }}
                          className="px-4 py-1 bg-gray-400 text-white rounded text-sm"
                        >
                          Batal
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Nama:</strong> {log.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {log.email}
                      </p>
                      <p>
                        <strong>Password:</strong> {log.password}
                      </p>
                      {log.kelas && (
                        <p>
                          <strong>Kelas:</strong> {log.kelas}
                        </p>
                      )}
                      <p>
                        <strong>Role:</strong> <Badge>{log.role}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingId(log._id);
                            setEditData(log);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
