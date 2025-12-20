import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getBookInfoAction, getPageAction } from '@/app/actions/turath'
import { Button } from '@/components/ui/button'
import MaktabahBackButton from '@/components/maktabah/MaktabahBackButton'
import MaktabahPageJumper from '@/components/maktabah/MaktabahPageJumper'
import MaktabahReaderWrapper from '@/components/maktabah/MaktabahReaderWrapper'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ bookId: string }>
    searchParams: Promise<{ page?: string }>
}

export default async function BookReaderPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const bookId = parseInt(params.bookId)
    const currentPage = parseInt(searchParams.page || '1')

    if (isNaN(bookId)) notFound()

    const bookInfo = await getBookInfoAction(bookId)
        .catch(() => null)



    if (!bookInfo) notFound()

    // Prepare indexes for sidebar (fallback to empty if not compatible)
    let sidebarIndexes: any[] = [];
    if ((bookInfo as any).indexes) {
        // Attempt to convert whatever indexes data we have to a list or leave empty for now
    }

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-gray-200 overflow-hidden">
            {/* Header */}
            <header className="h-16 flex-none border-b border-gray-800 bg-[#1a1a1a] z-50">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MaktabahBackButton />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold font-arabic line-clamp-1 text-right text-gray-100" dir="rtl">
                                {bookInfo.meta.name}
                            </h1>
                            <span className="text-xs text-gray-400 line-clamp-1 text-right" dir="rtl">
                                {(bookInfo.meta as any).author_name || (bookInfo as any).author?.[0]?.name}
                            </span>
                        </div>
                    </div>
                    {/* Page Jumper */}
                    <MaktabahPageJumper
                        bookId={bookId}
                        currentPage={currentPage}
                        totalPages={
                            (bookInfo as any).indexes ? Object.keys((bookInfo as any).indexes).filter(k => !isNaN(Number(k))).length : 0
                        }
                    />
                </div>
            </header>

            {/* Main Layout (Wrapper + Content) */}
            <div className="flex-1 overflow-hidden">
                <MaktabahReaderWrapper
                    indexes={sidebarIndexes}
                    bookId={bookId}
                    currentPage={currentPage}
                    bookName={bookInfo.meta.name}
                >
                    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#1a1a1a]">
                        <div className="max-w-3xl mx-auto min-h-full flex flex-col">

                            <Suspense fallback={<ReaderSkeleton />}>
                                <PageContent bookId={bookId} page={currentPage} />
                            </Suspense>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between mt-12 py-6 border-t border-gray-800">
                                <Button
                                    variant="outline"
                                    className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                                    disabled={currentPage <= 1}
                                    asChild={currentPage > 1}
                                >
                                    {currentPage > 1 ? (
                                        <Link href={`/maktabah/${bookId}?page=${currentPage - 1}`} replace>
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <span>
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Previous
                                        </span>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                                    asChild
                                >
                                    <Link href={`/maktabah/${bookId}?page=${currentPage + 1}`} replace>
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </MaktabahReaderWrapper>
            </div>
        </div>
    )
}

function ReaderSkeleton() {
    return (
        <div className="space-y-6 animate-pulse py-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-4 bg-muted rounded w-full" style={{ width: `${Math.random() * 40 + 60}%`, marginLeft: 'auto' }} />
            ))}
        </div>
    )
}

async function PageContent({ bookId, page }: { bookId: number, page: number }) {
    try {
        const result = await getPageAction(bookId, page)

        return (
            <article className="prose dark:prose-invert max-w-none pt-8 pb-8 bg-[#1e1e1e] text-gray-200 p-8 md:p-12 rounded-xl shadow-2xl min-h-[800px] mx-auto border border-gray-800">
                <div
                    className="text-2xl md:text-3xl font-arabic leading-[2.8] text-right dir-rtl whitespace-pre-wrap font-medium text-gray-200"
                    dir="rtl"
                >
                    {result.text}
                </div>
            </article>
        )
    } catch (e) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 text-gray-400">
                <p>
                    Gagal memuat halaman {page}.
                </p>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                    <Link href={`/maktabah/${bookId}?page=${page}`}>
                        Coba Lagi
                    </Link>
                </Button>
            </div>
        )
    }
}
