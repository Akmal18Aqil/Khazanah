import SearchComponent from '@/components/SearchComponent'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Library } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            al-bahtsu
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih dari berbagai sumber terpercaya
          </p>
          <SearchComponent />
        </div>

        <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-backwards w-full">
          <div className="h-px bg-border flex-1 max-w-[100px]" />
          <span className="text-sm text-muted-foreground">Fitur Baru</span>
          <div className="h-px bg-border flex-1 max-w-[100px]" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-backwards">
          <Button asChild variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm">
            <Link href="/maktabah">
              <Library className="w-5 h-5" />
              Buka Maktabah Turath
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Akses ribuan kitab kuning dan literatur Islam klasik
          </p>
        </div>
      </div>
    </div>
  )
}