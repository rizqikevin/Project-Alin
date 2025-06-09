import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createExam } from "@/services/exam-service";
import { getQuestionsByTeacher } from "@/services/question-service";
import { useAuth } from "@/contexts/AuthContext";
import { Question } from "@/types";
import { toast } from "sonner";

export default function ExamForm({ onExamAdded }: { onExamAdded: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedQuestions = await getQuestionsByTeacher(user.id);
          setQuestions(fetchedQuestions);
        } catch (error) {
          console.error("Error fetching questions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [user]);

  const handleCheckboxChange = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    if (!title) {
      toast.error("Nama ujian harus diisi");
      return;
    }

    if (!description) {
      toast.error("Deskripsi ujian harus diisi");
      return;
    }

    if (!startTime) {
      toast.error("Waktu mulai ujian harus diisi");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      toast.error("Pilih minimal satu soal");
      return;
    }

    setIsSubmitting(true);

    try {
      const exam = await createExam(
        title,
        description,
        startTime,
        durationMinutes,
        selectedQuestionIds,
        user.id
      );

      if (exam) {
        // Reset form
        setTitle("");
        setDescription("");
        setStartTime("");
        setDurationMinutes(60);
        setSelectedQuestionIds([]);

        onExamAdded();
        toast.success("Ujian berhasil dibuat");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Gagal membuat ujian");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate min datetime (now)
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Buat Ujian Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Nama Ujian
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan nama ujian"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Deskripsi Ujian
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Masukkan deskripsi ujian"
            required
          />
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Waktu Mulai
          </label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            min={minDateTime}
            required
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Durasi (menit)
          </label>
          <Input
            id="duration"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            min={1}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pilih Soal</label>
          {isLoading ? (
            <p>Memuat soal...</p>
          ) : questions.length === 0 ? (
            <p>Belum ada soal yang tersedia</p>
          ) : (
            <div className="space-y-2">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="space-y-2 border p-3 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestionIds.includes(question.id)}
                      onCheckedChange={() => handleCheckboxChange(question.id)}
                    />
                    <label
                      htmlFor={`question-${question.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {question.question}
                    </label>
                  </div>
                  {question.imageUrl && (
                    <img
                      src={`http://localhost:5000${question.imageUrl}`}
                      alt="Soal Gambar"
                      className="mt-2 rounded-md max-h-48 object-contain"
                    />
                  )}
                  <h1>{question.imageUrl}</h1>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Membuat..." : "Buat Ujian"}
        </Button>
      </form>
    </Card>
  );
}
