'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Settings, Filter, ArrowUpDown, Clock, Pencil, Save, Check, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import InfiniteScrollFilterList from './InfiniteScrollFilterList'
import { getBooksListAction, getAuthorsListAction } from '@/app/actions/turath'

export default function MaktabahSearch({ initialQuery = '' }: { initialQuery?: string }) {
    const [query, setQuery] = useState(initialQuery)
    const [sort, setSort] = useState("relevance")
    const [selectedBooks, setSelectedBooks] = useState<string[]>([])
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchHistory, setSearchHistory] = useState<string[]>([])
    const router = useRouter()

    const activeFilterCount = selectedBooks.length + selectedAuthors.length + (selectedCategory ? 1 : 0)

    const toggleBook = (book: string) => {
        setSelectedBooks(prev =>
            prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]
        )
    }

    const toggleAuthor = (author: string) => {
        setSelectedAuthors(prev =>
            prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]
        )
    }

    const toggleCategory = (catId: string) => {
        setSelectedCategory(prev => prev === catId ? null : catId)
    }

    // Categories Data
    const categories = [
        { id: 'hadith', label: 'الحديث' },
        { id: 'tafsir', label: 'التفسير' },
        { id: 'fiqh', label: 'الفقه' },
        { id: 'aqidah', label: 'العقيدة' },
        { id: 'tarikh', label: 'التاريخ' },
        { id: 'ulum', label: 'علوم القرآن' },
        { id: 'tazkiyah', label: 'التزكية' },
    ]

    // Load history on mount
    useEffect(() => {
        const history = localStorage.getItem('turath_search_history')
        if (history) {
            setSearchHistory(JSON.parse(history))
        }
    }, [])

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (query.trim()) {
            // Update History
            const newHistory = [query.trim(), ...searchHistory.filter(h => h !== query.trim())].slice(0, 10)
            setSearchHistory(newHistory)
            localStorage.setItem('turath_search_history', JSON.stringify(newHistory))

            // Navigate with Params
            const params = new URLSearchParams()
            params.set('q', query.trim())
            if (sort !== 'relevance') params.set('sort', sort)
            if (selectedBooks.length > 0) params.set('books', selectedBooks.join(','))
            if (selectedAuthors.length > 0) params.set('authors', selectedAuthors.join(','))
            if (selectedCategory) params.set('category', selectedCategory)

            router.push(`/maktabah?${params.toString()}`)
        }
    }

    const clearHistory = () => {
        setSearchHistory([])
        localStorage.removeItem('turath_search_history')
    }

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative z-10">
            <div className="relative flex gap-2 w-full">
                <Input
                    type="text"
                    placeholder="Cari..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 h-12 text-base px-4 pr-12 bg-[#2a2a2a] border-gray-700 text-right font-arabic focus-visible:ring-blue-500/50 rounded-lg text-gray-200 placeholder:text-gray-500"
                    dir="rtl"
                />

                {/* Advanced Search Options (Inside Input or Next to it) */}
                {/* Advanced Search Options (Inside Input or Next to it) */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
                    {/* Filter Tags */}
                    {(selectedBooks.length > 0 || selectedAuthors.length > 0 || selectedCategory) && (
                        <div className="flex gap-1 mr-2 px-2">
                            {selectedBooks.length > 0 && (
                                <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300">
                                    <button onClick={() => setSelectedBooks([])} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    <span>الكتاب ({selectedBooks.length})</span>
                                </div>
                            )}
                            {selectedAuthors.length > 0 && (
                                <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300">
                                    <button onClick={() => setSelectedAuthors([])} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    <span>المؤلف ({selectedAuthors.length})</span>
                                </div>
                            )}
                            {selectedCategory && (
                                <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300">
                                    <button onClick={() => setSelectedCategory(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    <span>القسم (1)</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History */}
                    {/* History */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="p-2 hover:text-white transition-colors" title="History">
                                <span className="sr-only">History</span>
                                <Clock className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic p-0">
                            <DropdownMenuLabel className="flex justify-between items-center text-xs text-gray-400 font-normal px-3 py-2">
                                <span>كلمات البحث (Recent)</span>
                                {searchHistory.length > 0 && (
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault()
                                            clearHistory()
                                        }}
                                        className="cursor-pointer hover:text-red-400"
                                    >
                                        مسح (Clear)
                                    </span>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700 m-0" />
                            <div className="max-h-64 overflow-y-auto">
                                {searchHistory.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">لا يوجد سجل بحث</div>
                                ) : (
                                    searchHistory.map((item, idx) => (
                                        <DropdownMenuItem
                                            key={idx}
                                            onClick={() => {
                                                setQuery(item);
                                                // Optional: Trigger search immediately
                                            }}
                                            className="justify-end cursor-pointer hover:bg-white/10 text-right px-4 py-2"
                                        >
                                            {item}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className={`p-2 hover:text-white transition-colors ${activeFilterCount > 0 ? 'text-blue-400' : ''}`} title="Filter">
                                <span className="sr-only">Filter</span>
                                <Filter className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic p-0">
                            {/* Top Categories */}
                            <div className="p-1 space-y-0.5">
                                {/* Book Submenu */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right w-full flex flex-row-reverse">
                                        <span className="mr-2">الكتاب</span>
                                        <span className="ml-auto text-xs text-gray-500">{selectedBooks.length > 0 ? `(${selectedBooks.length})` : ''}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-64 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic p-0 mr-1" alignOffset={-5}>
                                        <InfiniteScrollFilterList
                                            fetchAction={getBooksListAction}
                                            selectedItems={selectedBooks}
                                            onToggle={toggleBook}
                                            placeholder="بحث في الكتب..."
                                        />
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                {/* Author Submenu */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right w-full flex flex-row-reverse">
                                        <span className="mr-2">المؤلف</span>
                                        <span className="ml-auto text-xs text-gray-500">{selectedAuthors.length > 0 ? `(${selectedAuthors.length})` : ''}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-64 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic p-0 mr-1" alignOffset={-5}>
                                        <InfiniteScrollFilterList
                                            fetchAction={getAuthorsListAction}
                                            selectedItems={selectedAuthors}
                                            onToggle={toggleAuthor}
                                            placeholder="بحث في المؤلفين..."
                                        />
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                {/* Category Submenu (Searchable) */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="justify-between cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right w-full flex flex-row-reverse">
                                        <span className="mr-2">القسم</span>
                                        <span className="ml-auto text-xs text-gray-500">{selectedCategory ? '(1)' : ''}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-64 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic p-0 mr-1" alignOffset={-5}>
                                        <div className="p-2 border-b border-gray-800">
                                            <Input
                                                placeholder="بحث..."
                                                className="h-8 bg-gray-900 border-gray-700 text-gray-200 text-right dir-rtl font-arabic text-xs focus-visible:ring-1"
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                                            {categories.map(cat => (
                                                <DropdownMenuItem
                                                    key={cat.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleCategory(cat.id);
                                                    }}
                                                    className="font-arabic text-right justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-gray-200 gap-2 flex-row-reverse px-2"
                                                >
                                                    <div className={`w-4 h-4 border rounded border-gray-500 flex items-center justify-center ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600' : ''}`}>
                                                        {selectedCategory === cat.id && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="flex-1 mr-2">{cat.label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right">حال الطبع</DropdownMenuItem>
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right">نوع المحتوى</DropdownMenuItem>
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right">تاريخ الوفاة</DropdownMenuItem>
                            </div>

                            <DropdownMenuSeparator className="bg-gray-700 m-0" />

                            {/* Options */}
                            <div className="p-1">
                                <DropdownMenuCheckboxItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right" checked>
                                    بحث في الهامش والمقدمات
                                </DropdownMenuCheckboxItem>
                            </div>

                            <DropdownMenuSeparator className="bg-gray-700 m-0" />

                            {/* Pinned Options Header */}
                            <div className="flex items-center justify-between px-2 py-1.5 text-sm text-gray-400">
                                <Pencil className="w-3 h-3 hover:text-white cursor-pointer" />
                                <span>الخيارات المثبتة</span>
                            </div>

                            {/* Pinned Presets */}
                            <div className="p-1 space-y-0.5">
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right text-sm">الكتب التسعة</DropdownMenuItem>
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right text-sm">الحديث وشروحه</DropdownMenuItem>
                                <DropdownMenuItem className="justify-end cursor-pointer hover:bg-white/10 focus:bg-white/10 text-right text-sm">ابن تيمية وابن القيم</DropdownMenuItem>
                            </div>

                            <DropdownMenuSeparator className="bg-gray-700 m-0" />

                            {/* Footer Actions */}
                            <div className="p-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Switch id="quick-view" className="h-4 w-8" />
                                    <label htmlFor="quick-view" className="text-xs text-gray-400 cursor-pointer">العرض للوصول السريع</label>
                                </div>
                                <div className="flex items-center justify-between cursor-pointer hover:text-white text-gray-400 transition-colors">
                                    <Save className="w-4 h-4" />
                                    <span className="text-xs">تثبيت خيارات البحث</span>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="p-2 hover:text-white transition-colors" title="Sort">
                                <span className="sr-only">Sort</span>
                                <ArrowUpDown className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#2a2a2a] border-gray-700 text-gray-200 font-arabic">
                            <DropdownMenuLabel>ترتيب النتائج</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                                <DropdownMenuRadioItem value="relevance">حسب أقرب صلة كلمات البحث</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="death">حسب وفاة المؤلف</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="madhhab">حسب المذهب</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="category">حسب التصنيف</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="book">حسب ترتيب الكتاب</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Settings (Placeholder) */}
                    <button type="button" className="p-2 hover:text-white transition-colors" title="Settings">
                        <span className="sr-only">Settings</span>
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-4 bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 text-gray-400"
                >
                    <Search className="w-5 h-5" />
                </Button>
            </div>
        </form>
    )
}
