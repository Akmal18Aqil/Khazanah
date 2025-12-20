'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info, Download, X, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { sanitizeSnippet } from '@/lib/utils/string'

interface BookItemProps {
    book: any
    index: number
}

import { getPageAction } from '@/app/actions/turath'
import { Loader2 } from 'lucide-react'

// ... imports

export default function MaktabahBookItem({ book, index }: BookItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [fullContent, setFullContent] = useState<string | null>(null)
    const [isLoadingContent, setIsLoadingContent] = useState(false)

    const handleExpand = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isExpanded && !fullContent) {
            // Fetch content if expanding and we don't have it yet
            setIsLoadingContent(true);
            try {
                // Parse page number safely
                const pageNum = parseInt(book.meta?.page || '0');
                if (book.book_id && pageNum) {
                    const res = await getPageAction(book.book_id, pageNum);
                    if (res && res.text) {
                        setFullContent(res.text);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch full content", err);
            } finally {
                setIsLoadingContent(false);
            }
        }

        setIsExpanded(!isExpanded);
    };

    return (
        <div className="group flex flex-row-reverse items-start justify-between p-4 border-b border-gray-800 hover:bg-white/5 transition-all text-right">
            {/* ... Numbering */}
            <div className="flex flex-col items-center justify-start pt-1 ml-4 text-gray-400 font-mono text-lg">
                {(index + 1).toLocaleString('ar-EG')}
            </div>

            {/* Content (Middle) */}
            <div className="flex-1 flex flex-col items-end gap-3 text-right w-full">
                <Link
                    href={`/maktabah/${book.book_id}?page=${book.meta?.page ?? 1}`}
                    className="block w-full"
                    onClick={() => console.log(`Navigating to book ${book.book_id} page ${book.meta?.page ?? 1}`)}
                >
                    <h4
                        className="font-bold text-xl text-blue-500 group-hover:text-blue-400 transition-colors font-arabic leading-relaxed mb-1"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: book.meta?.book_name || book.heading || 'Tanpa Judul' }}
                    />
                </Link>

                {/* Snippet or Full Content */}
                <div
                    className={`text-gray-300 text-lg leading-loose font-arabic dir-rtl turath-snippet transition-all relative ${isExpanded ? '' : 'line-clamp-3'}`}
                    dir="rtl"
                >
                    {isLoadingContent ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Memuat konten...</span>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{
                            __html: sanitizeSnippet(isExpanded && fullContent ? fullContent : (book.snip || book.text || ''))
                        }} />
                    )}
                </div>

                {/* Expand Button (Al-Mazid) */}
                <button
                    onClick={handleExpand}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1 font-arabic p-1 -mr-1"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-3 h-3" />
                            <span>الأقل (Al-Aqall)</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3" />
                            <span>المزيد (Al-Mazid)</span>
                        </>
                    )}
                </button>

                {/* Metadata Footer (Book - Author - Category) */}
                <div className="flex flex-wrap flex-row-reverse items-center gap-2 text-xs text-gray-500 mt-2 font-arabic" dir="rtl">
                    <span className="text-gray-400">{book.meta?.book_name || book.heading}</span>
                    {book.meta?.author_name && (
                        <>
                            <span className="text-gray-600">—</span>
                            <span className="text-blue-400/80">{book.meta.author_name}</span>
                        </>
                    )}
                    {book.cat_id && (
                        <>
                            <span className="text-gray-600">←</span>
                            <span className="text-gray-500">{book.cat_id}</span>
                        </>
                    )}
                    {(book.meta?.vol || book.meta?.page) && (
                        <>
                            <span className="text-gray-600">|</span>
                            <span className="text-orange-500 font-bold" dir="ltr">
                                {book.meta.vol && `Vol: ${book.meta.vol} `}
                                {book.meta.page && `Pg: ${book.meta.page}`}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions (Left Side) - Visual Left */}
            <div className="flex flex-col items-center gap-2 text-gray-400 ml-4 relative z-10">
                <button
                    className="p-1.5 hover:bg-white/10 rounded hover:text-white transition-colors border border-transparent"
                    title="Menu"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <MoreVertical className="w-5 h-5" />
                </button>

                {/* Sidebar Expand Button */}
                <button
                    className={`p-1.5 rounded transition-all mt-2 border ${isExpanded ? 'bg-white/10 text-blue-400 border-blue-400/50' : 'hover:bg-white/10 hover:text-blue-400 border-gray-700'}`}
                    title={isExpanded ? "Collapse" : "Expand"}
                    onClick={handleExpand}
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )
}
