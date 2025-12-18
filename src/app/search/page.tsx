import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SearchComponent from '@/components/SearchComponent'
import FiqhCard from '@/components/FiqhCard'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = (await searchParams) as any
  const query = params?.q || ''
  return {
    title: query ? `Hasil Pencarian: "${query}" - Muara` : 'Pencarian - Muara',
    description: query ? `Hasil pencarian untuk "${query}" di Muara` : 'Cari rumusan dan ibarat fikih',
  }
}

export const revalidate = 3600

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) as any
  const query = params?.q || ''
  const page = parseInt(params?.page || '1', 10)
  const limit = 10

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Pencarian</h1>
          <SearchComponent />
          <p className="text-center text-muted-foreground mt-8">
            Masukkan kata kunci untuk mencari rumusan atau ibarat fikih
          </p>
        </div>
      </div>
    )
  }

  try {
    const from = (page - 1) * limit
    const { data: results, error } = await supabase.rpc('search_fiqh', {
      search_query: query,
      limit_count: limit,
      offset_count: from
    })

    if (error) {
      console.error('Search error:', error)
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Pencarian</h1>
            <SearchComponent />
            <div className="text-center text-destructive mt-8">
              Terjadi kesalahan saat melakukan pencarian. Silakan coba lagi.
            </div>
          </div>
        </div>
      )
    }

    // Since RPC doesn't easily return total count with pagination, we do a separate count
    const { count } = await supabase
      .from('fiqh_entries')
      .select('*', { count: 'exact', head: true })
      .textSearch('fts', query)

    const totalResults = count || 0
    const totalPages = Math.ceil(totalResults / limit)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 border-b mb-8 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-xl font-bold text-center mb-4 truncate">
                Hasil Pencarian: "{query}"
              </h1>
              <SearchComponent initialQuery={query} />
            </div>
          </div>

          {results && results.length > 0 ? (
            <div className="mt-8 space-y-8">
              <p className="text-muted-foreground">
                Menampilkan {results.length} dari {totalResults} hasil
              </p>
              {results.map((entry) => (
                <FiqhCard key={entry.id} entry={entry} searchQuery={query} />
              ))}
              <div className="flex items-center justify-between mt-8">
                <Button asChild variant="outline" disabled={page <= 1}>
                  <Link href={`/search?q=${query}&page=${page - 1}`}>Sebelumnya</Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {page} dari {totalPages}
                </span>
                <Button asChild variant="outline" disabled={page >= totalPages}>
                  <Link href={`/search?q=${query}&page=${page + 1}`}>Berikutnya</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-8">
              <p>Tidak ada hasil ditemukan untuk "{query}"</p>
              <p className="text-sm mt-2">
                Coba gunakan kata kunci yang berbeda atau periksa ejaan Anda
              </p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Search page error:', error)
    notFound()
  }
}