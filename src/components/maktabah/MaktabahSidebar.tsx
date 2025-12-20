'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface IndexItem {
    title: string
    page: string | number
    id?: string
}

interface MaktabahSidebarProps {
    indexes: IndexItem[]
    bookId: number
    currentPage: number
    isOpen: boolean
    onClose: () => void
}

export default function MaktabahSidebar({ indexes, bookId, currentPage, isOpen, onClose }: MaktabahSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredIndexes = indexes.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:static inset-y-0 right-0 z-50 
                    w-80 bg-[#1e1e1e] border-l border-gray-800 
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                    flex flex-col h-full
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-gray-200 font-arabic">فهرس المحتوى</h2>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في الفهرس..."
                            className="bg-[#2a2a2a] border-gray-700 text-right pr-9 font-arabic h-9"
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Index List */}
                <ScrollArea className="flex-1">
                    <div className="py-2">
                        {filteredIndexes.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm font-arabic">
                                لا توجد نتائج
                            </div>
                        ) : (
                            filteredIndexes.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={`/maktabah/${bookId}?page=${item.page}`}
                                    className={`
                                        flex items-center justify-between py-2 px-4 hover:bg-white/5 transition-colors
                                        group border-r-2 border-transparent text-right
                                        ${currentPage === Number(item.page) ? 'bg-white/10 border-blue-500 text-blue-400' : 'text-gray-300'}
                                    `}
                                >
                                    <span className="text-sm font-arabic leading-relaxed line-clamp-2 w-full ml-2">
                                        {item.title}
                                    </span>
                                    <span className="text-xs text-gray-600 font-mono shrink-0 group-hover:text-gray-400">
                                        {item.page}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Footer Statistics */}
                <div className="p-3 bg-[#1a1a1a] border-t border-gray-800 text-center text-xs text-gray-500 font-arabic">
                    {filteredIndexes.length} عنوان
                </div>
            </aside>
        </>
    )
}
