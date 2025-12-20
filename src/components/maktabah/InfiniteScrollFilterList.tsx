'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Check, Loader2 } from 'lucide-react'

interface Item {
    id: string
    name: string
}

interface InfiniteScrollFilterListProps {
    fetchAction: (page: number, limit: number, query: string) => Promise<{ data: Item[], hasMore: boolean }>
    selectedItems: string[]
    onToggle: (item: string) => void
    placeholder?: string
}

export default function InfiniteScrollFilterList({ fetchAction, selectedItems, onToggle, placeholder }: InfiniteScrollFilterListProps) {
    const [items, setItems] = useState<Item[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Refs
    const observerTarget = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    const [debouncedQuery, setDebouncedQuery] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Reset when search query changes
    useEffect(() => {
        setItems([])
        setPage(1)
        setHasMore(true)
    }, [debouncedQuery])

    // Key function to load data
    const loadData = useCallback(async (currentPage: number, currentQuery: string) => {
        if (loading) return; // Prevent duplicate concurrent fetches
        setLoading(true)
        console.log(`[InfiniteScroll] Loading page ${currentPage} for query "${currentQuery}"`)
        try {
            const res = await fetchAction(currentPage, 10, currentQuery)
            console.log(`[InfiniteScroll] Loaded ${res.data.length} items. Has more: ${res.hasMore}`)
            setItems(prev => currentPage === 1 ? res.data : [...prev, ...res.data])
            setHasMore(res.hasMore)
        } catch (error) {
            console.error("[InfiniteScroll] Failed to load list", error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Observer Effect
    useEffect(() => {
        const currentTarget = observerTarget.current;
        const currentContainer = containerRef.current; // Use container as root

        if (!currentTarget) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    console.log("[InfiniteScroll] Sentinel confirmed intersecting. Loading next page...")
                    setPage(prev => prev + 1)
                }
            },
            {
                threshold: 0.1, // Trigger when 10% visible
                root: currentContainer // Important: Observe relative to the scroll container!
            }
        );

        observer.observe(currentTarget);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading]) // Re-run when status changes to re-bind if needed

    // Effect to actually fetch when page or query changes
    useEffect(() => {
        loadData(page, debouncedQuery)
    }, [page, debouncedQuery, loadData])

    return (
        <div className="w-full">
            <div className="p-2 border-b border-gray-700">
                <div className="relative">
                    <Search className="absolute right-2 top-2.5 h-3 w-3 text-gray-500" />
                    <Input
                        placeholder={placeholder || "بحث..."}
                        className="h-8 text-xs pr-7 bg-[#1a1a1a] border-gray-600 text-right text-gray-200"
                        dir="rtl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
            <div
                ref={containerRef}
                className="max-h-64 overflow-y-auto p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700"
            >
                {items.map((item, idx) => (
                    <div
                        key={`${item.id}-${idx}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onToggle(item.name);
                        }}
                        className="flex flex-row-reverse items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer group transition-colors"
                    >
                        <div className={`w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition-colors ${selectedItems.includes(item.name) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-gray-400'}`}>
                            {selectedItems.includes(item.name) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-right flex-1 text-gray-300 font-arabic line-clamp-1" title={item.name}>{item.name}</span>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-center p-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    </div>
                )}

                {/* Invisible element to trigger scroll */}
                {hasMore && !loading && (
                    <div ref={observerTarget} className="h-4 w-full" style={{ background: 'transparent' }} />
                )}

                {!hasMore && items.length === 0 && !loading && (
                    <div className="text-center text-xs text-gray-500 p-2">لا توجد نتائج</div>
                )}
            </div>
        </div>
    )
}
