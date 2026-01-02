import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, BookOpen, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ArabicText from '@/components/ArabicText'
import { supabase } from '@/lib/supabaseClient'

interface EntryDetailPageProps {
  params: Promise<{ id: string }>
}

interface FiqhEntry {
  id: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_books?: Array<{
    id: string
    kitab_name: string
    details?: string
    order_index: number
  }>
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
  created_at: string
}

export async function generateMetadata({ params }: EntryDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const { data: entry } = await supabase
    .from('fiqh_entries')
    .select('title')
    .eq('id', id)
    .single()

  if (!entry) {
    return {
      title: 'Entri Tidak Ditemukan - al-bahtsu',
    }
  }

  return {
    title: `${entry.title} - al-bahtsu`,
    description: entry.title,
  }
}

export default async function EntryDetailPage({ params, searchParams }: EntryDetailPageProps & { searchParams: Promise<{ q?: string }> }) {
  const { id } = await params
  const { q } = await searchParams

  const backLink = q ? `/search?q=${encodeURIComponent(q)}` : '/search'

  const { data: entry, error } = await supabase
    .from('fiqh_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    console.error('Entry fetch error:', error)
    notFound()
  }

  // Fetch source books
  const { data: sourceBooks } = await supabase
    .from('source_books')
    .select('*')
    .eq('entry_id', id)
    .order('order_index', { ascending: true })

  // Attach source books to entry
  const entryWithBooks = {
    ...entry,
    source_books: sourceBooks || []
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur py-4 mb-6 border-b -mx-4 px-4 md:mx-0 md:px-0 md:border-b-0">
          <Link href={backLink}>
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pencarian
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl md:text-3xl leading-tight">
                {entryWithBooks.title}
              </CardTitle>
              <Badge variant={entryWithBooks.entry_type === 'ibarat' ? 'default' : 'secondary'} className="shrink-0">
                {entryWithBooks.entry_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {entryWithBooks.question_text && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Pertanyaan
                </h3>
                <ArabicText
                  content={entryWithBooks.question_text}
                  dir="ltr"
                  className="leading-relaxed"
                />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">Ringkasan Jawaban</h3>
              <div className="prose prose-gray max-w-none">
                <ArabicText
                  content={entryWithBooks.answer_summary}
                  dir="ltr"
                  className="leading-relaxed"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Ibarat Fikih</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <ArabicText content={entryWithBooks.ibarat_text} />
              </div>
            </div>

            {/* Source Books Section */}
            {entryWithBooks.source_books && entryWithBooks.source_books.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Sumber Kitab
                </h3>
                <div className="space-y-3">
                  {entryWithBooks.source_books.map((book, index) => (
                    <div key={book.id || index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-blue-900">
                            {book.kitab_name}
                          </p>
                          {book.details && (
                            <p className="text-sm text-blue-700 mt-1">
                              {book.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-1 gap-4 pt-4 border-t">
              {entryWithBooks.musyawarah_source && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sumber Musyawarah
                  </h4>
                  <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {entryWithBooks.musyawarah_source}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Ditambahkan pada {formatDate(entryWithBooks.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}