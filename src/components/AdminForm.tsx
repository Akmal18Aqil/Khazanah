'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fiqhEntrySchema, type FiqhEntryValues } from '@/lib/schemas'
import { createEntry, updateEntry } from '@/app/actions/entry'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ArabicText from '@/components/ArabicText'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import TiptapEditor from '@/components/TiptapEditor'
import mammoth from 'mammoth'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface SourceBook {
  id?: string
  kitab_name: string
  details?: string
  order_index: number
}

interface FiqhEntry {
  id?: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_books?: SourceBook[]
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
}

interface AdminFormProps {
  entry?: FiqhEntry
  isEdit?: boolean
}

export default function AdminForm({ entry, isEdit = false }: AdminFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Transform entry data to match FiqhEntryValues
  const defaultValues: Partial<FiqhEntryValues> = {
    title: entry?.title || '',
    question_text: entry?.question_text || '',
    answer_summary: entry?.answer_summary || '',
    ibarat_text: entry?.ibarat_text || '',
    musyawarah_source: entry?.musyawarah_source || '',
    entry_type: entry?.entry_type || 'rumusan',
    source_books: entry?.source_books?.map(book => ({
      id: book.id,
      kitab_name: book.kitab_name,
      details: book.details || '',
      order_index: book.order_index
    })),
  }

  const form = useForm<FiqhEntryValues>({
    resolver: zodResolver(fiqhEntrySchema),
    defaultValues,
    mode: 'onChange',
  })

  // Reset form when entry changes (unlikely in this context but good practice)
  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title || '',
        question_text: entry.question_text || '',
        answer_summary: entry.answer_summary || '',
        ibarat_text: entry.ibarat_text || '',
        musyawarah_source: entry.musyawarah_source || '',
        entry_type: entry.entry_type || 'ibarat',
        source_books: entry.source_books?.map(book => ({
          id: book.id,
          kitab_name: book.kitab_name,
          details: book.details || '',
          order_index: book.order_index
        })) || [{ kitab_name: '', details: '', order_index: 0 }],
      })
    }
  }, [entry, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'source_books',
  })

  const onSubmit = async (data: FiqhEntryValues) => {
    setError('')
    startTransition(async () => {
      try {
        let result
        if (isEdit && entry?.id) {
          result = await updateEntry(entry.id, data)
        } else {
          result = await createEntry(data)
        }

        if (result.error) {
          setError(result.error)
        } else {
          router.push('/admin')
          router.refresh()
        }
      } catch (err) {
        setError('Terjadi kesalahan yang tidak diketahui.')
      }
    })
  }


  const watchedIbarat = form.watch('ibarat_text')
  const watchedEntryType = form.watch('entry_type')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Entri' : 'Tambah Entri Baru'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Perbarui data rumusan atau ibarat fikih' : 'Masukkan data rumusan atau ibarat fikih baru'}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Baru</span>
            Import dari Word
          </h3>
          <p className="text-sm text-blue-600">
            Isi form otomatis dengan mengupload file .docx (Pertanyaan, Jawaban, Ibarat, Sumber).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/TEMPLATE_IMPORT.md" target="_blank" className="text-xs text-blue-600 underline hover:text-blue-800 mr-2">
            Lihat Format
          </a>
          <Input
            type="file"
            accept=".docx"
            className="hidden"
            id="word-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const { dismiss } = toast({
                title: "Membaca file Word...",
                description: "Mohon tunggu sebentar.",
              })

              try {
                const arrayBuffer = await file.arrayBuffer()
                // Use extractRawText for better text extraction
                const result = await mammoth.extractRawText({ arrayBuffer })
                const text = result.value

                console.log('Extracted text:', text)

                // Simple keyword-based extraction
                // We use regex to find content between headers
                // Headers we look for:
                // 1. Judul / Topik / Tema
                // 2. Sumber / Penyelenggara / Keputusan
                // 3. Pertanyaan / Deskripsi Masalah / Soal
                // 4. Jawaban / Rumusan
                // 5. Ibarat / Nash / Dasar Hukum

                const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

                // Helper to split by rough sections based on keywords
                // This is a naive implementation but works for structured docs
                const keywords = [
                  { key: 'title', patterns: ['judul', 'topik', 'tema'] },
                  { key: 'musyawarah_source', patterns: ['sumber', 'penyelenggara', 'keputusan', 'hasil'] },
                  { key: 'question_text', patterns: ['pertanyaan', 'deskripsimasalah', 'soal'] },
                  { key: 'answer_summary', patterns: ['jawaban', 'rumusan'] },
                  { key: 'ibarat_text', patterns: ['ibarat', 'nash', 'dasarhukum', 'referensi'] }
                ]

                // Split text into lines to process
                const lines = text.split('\n').map(l => l.trim()).filter(l => l)
                console.log('Lines to process:', lines.length)

                let currentKey: keyof FiqhEntryValues | null = null
                const extracted: Partial<Record<keyof FiqhEntryValues, string[]>> = {}

                for (const line of lines) {
                  const lowerLine = normalize(line)
                  let foundKey = false

                  // Check if line is a header
                  for (const { key, patterns } of keywords) {
                    // Check if line contains keyword and is short enough to be a header
                    // We also check if it starts with the keyword to avoid false positives in sentences
                    if (patterns.some(p => lowerLine.includes(p) && lowerLine.length < 50)) {
                      currentKey = key as keyof FiqhEntryValues
                      foundKey = true
                      console.log(`Found header: ${key} in line: "${line}"`)
                      break
                    }
                  }

                  if (!foundKey && currentKey) {
                    if (!extracted[currentKey]) extracted[currentKey] = []
                    extracted[currentKey]!.push(line)
                  }
                }

                console.log('Extracted data:', extracted)

                // Populate form
                if (extracted.title) form.setValue('title', extracted.title.join(' '), { shouldDirty: true, shouldValidate: true })
                if (extracted.musyawarah_source) form.setValue('musyawarah_source', extracted.musyawarah_source.join(' '), { shouldDirty: true, shouldValidate: true })
                if (extracted.question_text) form.setValue('question_text', extracted.question_text.join('<br>'), { shouldDirty: true, shouldValidate: true })
                if (extracted.answer_summary) form.setValue('answer_summary', extracted.answer_summary.join('\n'), { shouldDirty: true, shouldValidate: true })
                if (extracted.ibarat_text) form.setValue('ibarat_text', extracted.ibarat_text.join('<br>'), { shouldDirty: true, shouldValidate: true })

                dismiss()
                toast({
                  title: "Berhasil!",
                  description: `Berhasil mengimport ${lines.length} baris data.`,
                  variant: "default",
                })
              } catch (err) {
                console.error(err)
                dismiss()
                toast({
                  title: "Gagal",
                  description: "Terjadi kesalahan saat membaca file Word.",
                  variant: "destructive",
                })
              }

              // Reset input
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => {
              document.getElementById('word-upload')?.click()
            }}
          >
            Upload .docx
          </Button>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Form Entri Fikih</CardTitle>
          <CardDescription>
            Isi semua field yang diperlukan. Field dengan * wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul/Topik Masalah *</FormLabel>
                      <FormControl>
                        <Input placeholder="contoh: Hukum Asuransi Jiwa" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entry_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Entri *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe entri" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ibarat">Ibarat</SelectItem>
                          <SelectItem value="rumusan">Rumusan</SelectItem>
                          <SelectItem value="makalah">Makalah</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Rendering based on Entry Type */}
              {watchedEntryType !== 'makalah' && (
                <>
                  <FormField
                    control={form.control}
                    name="question_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teks Pertanyaan (Opsional)</FormLabel>
                        <FormControl>
                          <TiptapEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            disabled={isPending}
                            mode="standard"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="answer_summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ringkasan Jawaban *</FormLabel>
                        <FormControl>
                          <TiptapEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            disabled={isPending}
                            mode="standard"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="ibarat_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{watchedEntryType === 'makalah' ? 'Isi Makalah *' : 'Teks Ibarat *'}</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={isPending}
                        mode={watchedEntryType === 'makalah' ? 'mixed' : 'arabic'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview only for non-Makalah or if needed. Makalah has WYSIWYG Tiptap so maybe redundant but safe to keep if user wants to see raw arabic text? 
                  Actually ArabicText component forces Arabic font. Makalah users might strictly use Indonesian.
                  Let's hide it for Makalah to avoid confusion. */}
              {watchedIbarat && watchedEntryType !== 'makalah' && (
                <div className="mt-4 border rounded-lg p-4 bg-white/50">
                  <Label className="mb-2 block text-muted-foreground">Preview Hasil:</Label>
                  <ArabicText content={watchedIbarat} />
                </div>
              )}

              {watchedEntryType !== 'makalah' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Sumber Kitab (Opsional)</FormLabel>
                      <FormDescription>Tambahkan satu atau lebih sumber kitab beserta detailnya</FormDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ kitab_name: '', details: '', order_index: fields.length })}
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kitab
                    </Button>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                    {fields.length > 0 ? (
                      fields.map((field, index) => (
                        <div key={field.id} className="space-y-3 p-4 bg-white border rounded-lg relative">
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={isPending}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`source_books.${index}.kitab_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Nama Kitab {index + 1}</FormLabel>
                                <FormControl>
                                  <Input placeholder="contoh: Fathul Mu'in" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`source_books.${index}.details`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Detail Sumber</FormLabel>
                                <FormControl>
                                  <Input placeholder="contoh: Bab Buyu', Hal. 50" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground bg-white border border-dashed rounded-lg">
                        Belum ada sumber kitab. Klik "Tambah Kitab" untuk menambahkan.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="musyawarah_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{watchedEntryType === 'makalah' ? 'Sumber / Referensi *' : 'Sumber Musyawarah (Opsional)'}</FormLabel>
                    <FormControl>
                      <Input placeholder={watchedEntryType === 'makalah' ? 'contoh: Jurnal Ilmiah Fiqih, Vol 1, 2024' : 'contoh: LBMNU Jatim, 2023'} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEdit ? 'Perbarui Entri' : 'Simpan Entri'}
                </Button>
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div >
  )
}