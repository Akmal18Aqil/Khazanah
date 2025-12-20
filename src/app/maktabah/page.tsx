import { Suspense } from 'react'
import Link from 'next/link'
import { Book, Library, ArrowLeft, Search, User, Layers, Settings, MoreVertical, ChevronDown } from 'lucide-react'
import MaktabahSearch from '@/components/maktabah/MaktabahSearch'
import { searchBooksAction } from '@/app/actions/turath'
import { Button } from '@/components/ui/button'
import { stripHtml, sanitizeSnippet } from '@/lib/utils/string'
import MaktabahNav from '@/components/maktabah/MaktabahNav'
import MaktabahResultsList from '@/components/maktabah/MaktabahResultsList'

export const dynamic = 'force-dynamic'

// Add custom styles for highlighting
const snippetStyles = `
    .turath-snippet em {
        color: #ef4444; /* red-500 */
        font-style: normal;
        font-weight: bold;
    }
`

interface PageProps {
    searchParams: Promise<{
        q?: string
        books?: string
        authors?: string
        sort?: string
        category?: string
        madhhab?: string
    }>
}

// ... styles

export default async function MaktabahPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || ''
    const sort = searchParams?.sort
    const category = searchParams?.category
    const madhhab = searchParams?.madhhab
    const books = searchParams?.books ? searchParams.books.split(',') : []
    const authors = searchParams?.authors ? searchParams.authors.split(',') : []

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-gray-200">
            {/* ... header ... */}
            <style dangerouslySetInnerHTML={{ __html: snippetStyles }} />
            {/* Top Navigation Bar */}
            <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Back Button */}
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Icons */}
                        <MaktabahNav />

                        <div className="w-10" /> {/* Spacer for balance */}
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
                {/* Search Section */}
                <div className="text-center space-y-6 pt-4 pb-8">
                    <MaktabahSearch initialQuery={query} />
                    {!query && !category && !madhhab && (
                        <div className="text-gray-500 font-arabic text-sm">
                            أدخل اسم الكتاب...
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <Suspense fallback={<ResultsSkeleton />}>
                    {(query || category || madhhab) && <SearchResults query={query} books={books} authors={authors} sort={sort} category={category} madhhab={madhhab} />}
                </Suspense>
            </main>
        </div>
    )
}

function ResultsSkeleton() {
    // ... skeleton code ...
    return (
        <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-row-reverse items-center justify-between p-4 border-b border-gray-800 animate-pulse">
                    <div className="w-2/3 space-y-2">
                        <div className="h-6 w-3/4 bg-gray-800 rounded ml-auto" />
                        <div className="h-4 w-1/2 bg-gray-800 rounded ml-auto" />
                    </div>
                    <div className="h-8 w-8 bg-gray-800 rounded-full" />
                </div>
            ))}
        </div>
    )
}

async function SearchResults({ query, books, authors, sort, category, madhhab }: { query: string, books: string[], authors: string[], sort?: string, category?: string, madhhab?: string }) {
    try {
        const results = await searchBooksAction(query, { books, authors, category, madhhab, options: { sort } as any })

        if (!results || results.data.length === 0) {
            return (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                    <p className="text-gray-500 text-lg font-arabic">
                        لا توجد نتائج
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                        Tidak ditemukan kitab dengan kata kunci "{query}"
                        {(books.length > 0 || authors.length > 0) && " dengan filter yang dipilih."}
                    </p>
                </div>
            )
        }

        return (
            <MaktabahResultsList
                initialResults={results}
                query={query}
                books={books}
                authors={authors}
            />
        )
    } catch (error) {
        return (
            <div className="p-6 rounded-lg border border-red-900/50 bg-red-900/10 text-center text-red-400">
                Terjadi kesalahan saat memuat data.
            </div>
        )
    }
}
