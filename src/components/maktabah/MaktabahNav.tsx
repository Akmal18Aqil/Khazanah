'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Book, User, Layers, Settings } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
    { icon: Search, label: 'بحث', path: '/maktabah' },
    // { icon: Book, label: 'كتب', path: '/maktabah/browse/books' },
    // { icon: User, label: 'مؤلفون', path: '/maktabah/browse/authors' },
    { icon: Layers, label: 'أقسام', type: 'dropdown' },
    // { icon: Settings, label: 'الإعدادات', path: '/maktabah/settings' },
]

const categories = [
    { id: 'hadith', label: 'الحديث' },
    { id: 'tafsir', label: 'التفسير' },
    { id: 'fiqh', label: 'الفقه' },
    { id: 'aqidah', label: 'العقيدة' },
    { id: 'tarikh', label: 'التاريخ' },
    { id: 'ulum', label: 'علوم القرآن' },
    { id: 'tazkiyah', label: 'التزكية' },
]

export default function MaktabahNav() {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Simple active check: strictly equal or starts with (if sub-routes exist)
    const isActive = (path: string) => pathname === path

    const handleCategorySelect = (categoryId: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('category', categoryId);
        router.push(`/maktabah?${current.toString()}`);
    }

    return (
        <div className="flex items-center gap-1 md:gap-8 overflow-x-auto no-scrollbar">
            {navItems.map((item, idx) => {
                if (item.type === 'dropdown') {
                    return (
                        <DropdownMenu key={idx}>
                            <DropdownMenuTrigger className="outline-none">
                                <div className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-200 cursor-pointer`}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[10px] md:text-xs font-arabic">{item.label}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-gray-800 text-gray-200">
                                {categories.map(cat => (
                                    <DropdownMenuItem
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="font-arabic text-right justify-end cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-gray-200"
                                    >
                                        {cat.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }

                return (
                    <Link
                        key={idx}
                        href={item.path!}
                        className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-lg transition-colors ${isActive(item.path!) ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] md:text-xs font-arabic">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
