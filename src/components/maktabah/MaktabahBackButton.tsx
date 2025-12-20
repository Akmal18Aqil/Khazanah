'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft as ArrowPrev } from 'lucide-react'

export default function MaktabahBackButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="-ml-2"
            onClick={() => router.back()}
        >
            <ArrowPrev className="w-5 h-5" />
        </Button>
    )
}
