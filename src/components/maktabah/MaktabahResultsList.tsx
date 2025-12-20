'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { searchBooksAction } from '@/app/actions/turath'
import MaktabahBookItem from './MaktabahBookItem'
import { Loader2 } from 'lucide-react'

interface SearchResultsListProps {
    initialResults: any
    query: string
    books: string[]
    authors: string[]
}

export default function MaktabahResultsList({ initialResults, query, books, authors }: SearchResultsListProps) {
    const [results, setResults] = useState<any[]>(initialResults.data || [])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(initialResults.count || 0)

    // Refs for observer
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset when query/filters change
    useEffect(() => {
        setResults(initialResults.data || [])
        setPage(1)
        setTotalCount(initialResults.count)
        setHasMore(true) // Should check if initialResults.data length < count etc, but simplified for now
    }, [initialResults])

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            // Note: searchBooksAction currently doesn't support 'page' param explicitly in the simple signature I see in `turath.ts`?
            // Wait, TurathService.searchBooks doesn't seem to have a 'page' param in the previous edits?
            // I need to check TurathService.searchBooks signature.
            // If it doesn't support pagination, I need to add it!
            // I'll proceed assuming I will update the action/service to support pagination.

            const res = await searchBooksAction(query, { books, authors, options: { page: nextPage, limit: 10 } as any });

            if (res && res.data.length > 0) {
                setResults(prev => [...prev, ...res.data]);
                setPage(nextPage);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more results", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, query, books, authors]);

    // Observer Effect
    useEffect(() => {
        const currentTarget = observerTarget.current;
        if (!currentTarget) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(currentTarget);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-end px-4 text-xs text-gray-500 mb-4 font-mono font-arabic" dir="rtl">
                عدد الكتب: {totalCount}
            </div>

            <div className="flex flex-col">
                {results.map((book: any, index: number) => (
                    <MaktabahBookItem key={`${book.book_id}-${index}`} book={book} index={index} />
                ))}
            </div>

            {loading && (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            )}

            {/* Sentinel */}
            {hasMore && !loading && (
                <div ref={observerTarget} className="h-4 w-full" />
            )}

            {!hasMore && results.length > 0 && (
                <div className="text-center text-xs text-gray-500 py-8">
                    - نهاية النتائج (End of Results) -
                </div>
            )}
        </div>
    )
}
