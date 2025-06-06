import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addQuestion } from "@/services/question-service";
import { toast } from "sonner";

const questionSchema = z.object({
  question: z.string().min(1, "Pertanyaan harus diisi"),
  options: z.array(z.string().min(1, "Opsi harus diisi")).length(4, "Harus ada 4 opsi"),
  correctAnswer: z.number().min(0).max(3, "Pilih jawaban yang benar"),
  explanation: z.string().min(1, "Penjelasan harus diisi"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  teacherId: string;
  onSuccess: () => void;
}

export default function QuestionForm({ teacherId, onSuccess }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  });

  const options = watch("options");
  const correctAnswer = watch("correctAnswer");

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting question form:', data);
      
      await addQuestion({
        ...data,
        teacherId,
      });
      
      toast.success("Soal berhasil ditambahkan");
      onSuccess();
      reset();
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Gagal menambahkan soal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Tambah Soal Baru</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Pertanyaan</Label>
          <Textarea
            id="question"
            {...register("question")}
            placeholder="Masukkan pertanyaan"
          />
          {errors.question && (
            <p className="text-sm text-red-500">{errors.question.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Opsi Jawaban</Label>
          {options.map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                {...register(`options.${index}`)}
                placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
              />
              <RadioGroup
                value={correctAnswer.toString()}
                onValueChange={(value) => setValue("correctAnswer", parseInt(value))}
              >
                <RadioGroupItem value={index.toString()} id={`correct-${index}`} />
              </RadioGroup>
            </div>
          ))}
          {errors.options && (
            <p className="text-sm text-red-500">{errors.options.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="explanation">Penjelasan</Label>
          <Textarea
            id="explanation"
            {...register("explanation")}
            placeholder="Masukkan penjelasan untuk jawaban yang benar"
          />
          {errors.explanation && (
            <p className="text-sm text-red-500">{errors.explanation.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menambahkan..." : "Tambah Soal"}
        </Button>
      </form>
    </Card>
  );
}
