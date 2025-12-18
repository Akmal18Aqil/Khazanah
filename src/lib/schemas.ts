import { z } from 'zod';

export const sourceBookSchema = z.object({
    id: z.string().optional(),
    kitab_name: z.string().min(1, 'Nama kitab harus diisi'),
    details: z.string().optional(),
    order_index: z.number(),
});

export const fiqhEntrySchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, 'Judul harus minimal 3 karakter'),
    question_text: z.string().optional(),
    answer_summary: z.string().min(10, 'Ringkasan jawaban harus minimal 10 karakter'),
    ibarat_text: z.string().min(5, 'Teks ibarat harus diisi'),
    source_books: z.array(sourceBookSchema),
    musyawarah_source: z.string().optional(),
    entry_type: z.enum(['rumusan', 'ibarat']),
});

export type FiqhEntryValues = z.infer<typeof fiqhEntrySchema>;
