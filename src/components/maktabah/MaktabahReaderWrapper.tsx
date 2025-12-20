'use client'

import { useState } from 'react'
import MaktabahSidebar from './MaktabahSidebar'
import { Button } from '@/components/ui/button'
import { Menu, PanelRightClose, PanelRightOpen } from 'lucide-react'

interface WrapperProps {
    children: React.ReactNode
    indexes: any[]
    bookId: number
    currentPage: number
    bookName: string
}

export default function MaktabahReaderWrapper({ children, indexes, bookId, currentPage, bookName }: WrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
            {/* Sidebar Toggle (Mobile/Desktop overlay if needed, or just standard layout) */}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Floating Toggle Button (if sidebar closed or mobile) */}
                <div className="absolute top-4 right-4 z-40 md:hidden">
                    <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                {/* Desktop Toggle (Integrated in header in real app, but here absolute for now) */}
                {!isSidebarOpen && (
                    <div className="hidden md:block absolute top-4 right-4 z-40">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="bg-card shadow-sm border">
                            <PanelRightOpen className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto bg-[#faf9f6]/50 dark:bg-[#121212]">
                    {children}
                </div>
            </div>

            {/* Sidebar */}
            {/* We render sidebar but control its width/display based on state */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out border-l border-gray-800 bg-[#1e1e1e] flex flex-col relative`}>
                <div className="absolute top-2 left-2 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <PanelRightClose className="w-4 h-4" />
                    </Button>
                </div>

                <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex-1 h-full overflow-hidden`}>
                    <MaktabahSidebar
                        indexes={indexes}
                        bookId={bookId}
                        currentPage={currentPage}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>
            </div>
        </div>
    )
}
