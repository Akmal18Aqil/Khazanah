'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BookOpen, CornerDownLeft } from 'lucide-react'

interface MaktabahPageJumperProps {
    bookId: number
    currentPage: number
    totalPages?: number
}

export default function MaktabahPageJumper({ bookId, currentPage, totalPages }: MaktabahPageJumperProps) {
    console.log('DEBUG JUMPER PROPS:', { bookId, currentPage, totalPages })
    const router = useRouter()
    const [page, setPage] = useState(currentPage.toString())
    const [isOpen, setIsOpen] = useState(false)

    // Sync local state when prop changes (e.g. navigation via arrow keys)
    useEffect(() => {
        setPage(currentPage.toString())
    }, [currentPage])

    const handleJump = (e?: React.FormEvent) => {
        e?.preventDefault()
        const pageNum = parseInt(page)
        if (!isNaN(pageNum) && pageNum > 0) {
            router.push(`/maktabah/${bookId}?page=${pageNum}`)
            setIsOpen(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>Hal. {currentPage} {totalPages ? `/ ${totalPages}` : ''}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" align="end">
                <form onSubmit={handleJump} className="flex flex-col gap-2">
                    <span className="text-sm font-medium leading-none">Loncat ke halaman</span>
                    <div className="flex gap-2">
                        <Input
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            className="h-8"
                            type="number"
                            min={1}
                            max={totalPages || undefined}
                            placeholder="Nomor halaman..."
                        />
                        <Button type="submit" size="sm" className="h-8 w-8 p-0">
                            <CornerDownLeft className="h-4 w-4" />
                        </Button>
                    </div>
                    {!!totalPages && totalPages > 0 && (
                        <div className="text-xs text-muted-foreground text-right">
                            Maksimal: {totalPages}
                        </div>
                    )}
                </form>
            </PopoverContent>
        </Popover>
    )
}
