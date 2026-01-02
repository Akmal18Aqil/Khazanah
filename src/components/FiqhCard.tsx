'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { stripHtml } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ArabicText, { getHighlightRegex } from '@/components/ArabicText'

interface FiqhEntry {
  id: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_kitab?: string
  source_details?: string
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
  created_at: string
}

interface FiqhCardProps {
  entry: FiqhEntry
  searchQuery?: string
}

export default function FiqhCard({ entry, searchQuery }: FiqhCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCardClick = () => {
    const href = searchQuery
      ? `/entry/${entry.id}?q=${encodeURIComponent(searchQuery)}`
      : `/entry/${entry.id}`
    router.push(href)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  // Helper function for getting snippet
  const getSnippet = (htmlContent: string, query?: string) => {
    if (!query || !htmlContent) return htmlContent;

    // Strip HTML tags for processing text matching
    const text = stripHtml(htmlContent);

    let firstMatchIndex = -1;

    // 1. Try Arabic Regex Match
    const arabicRegexes = getHighlightRegex(query);
    if (arabicRegexes) {
      const match = arabicRegexes.loopRegex.exec(text);
      if (match) {
        firstMatchIndex = match.index;
        console.log('Arabic match found at:', firstMatchIndex, 'Query:', query);
      }
    }

    // 2. Fallback to Simple Normalization Match if no Arabic match
    if (firstMatchIndex === -1) {
      const normalizedText = text.normalize('NFC').toLowerCase();
      const normalizedQuery = query.normalize('NFC').toLowerCase();
      const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

      for (const term of terms) {
        const idx = normalizedText.indexOf(term);
        if (idx !== -1) {
          console.log('Simple match found for term:', term, 'at:', idx);
          if (firstMatchIndex === -1 || idx < firstMatchIndex) {
            firstMatchIndex = idx;
          }
        }
      }
    }

    if (firstMatchIndex === -1) {
      console.log('No match found for query:', query);
      return text;
    }

    // Calculate window
    const contextBefore = 60;
    const contextAfter = 140; // Total ~200 chars

    let start = Math.max(0, firstMatchIndex - contextBefore);
    let end = Math.min(text.length, firstMatchIndex + contextAfter);

    // Adjust to word boundaries
    if (start > 0) {
      const spaceIdx = text.indexOf(' ', start);
      if (spaceIdx !== -1 && spaceIdx < firstMatchIndex) start = spaceIdx + 1;
    }

    let snippet = text.slice(start, end);
    if (start > 0) snippet = '... ' + snippet;
    if (end < text.length) snippet = snippet + ' ...';

    return snippet;
  };

  // Helper function for highlighting text
  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text;

    // Normalize text and query to NFC
    const normalizedText = text.normalize('NFC');
    const normalizedQuery = query.normalize('NFC');

    const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (terms.length === 0) return text;

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const checkRegex = new RegExp(`^(${terms.join('|')})$`, 'i');

    return normalizedText.split(regex).map((part, i) =>
      checkRegex.test(part) ? (
        <span key={i} className="text-red-500 font-bold bg-yellow-100/50 dark:bg-yellow-900/30 rounded px-0.5">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <Card
      onClick={handleCardClick}
      className="hover:shadow-md transition-shadow cursor-pointer mb-6 relative group"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 leading-relaxed">
            {highlightText(entry.title, searchQuery)}
          </CardTitle>
          <Badge variant={entry.entry_type === 'ibarat' ? 'default' : 'secondary'} className="shrink-0">
            {entry.entry_type}
          </Badge>
        </div>
        {entry.question_text && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {highlightText(getSnippet(entry.question_text, searchQuery), searchQuery)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full inline-block"></span>
              Ringkasan Jawaban
            </h4>

            <div className={`prose prose-sm dark:prose-invert max-w-none text-foreground ${isExpanded ? "" : "line-clamp-3"}`}>
              <ArabicText
                content={isExpanded ? entry.answer_summary : getSnippet(entry.answer_summary, searchQuery)}
                highlight={searchQuery}
                dir="ltr"
                className="leading-relaxed"
              />
            </div>
          </div>


          {entry.ibarat_text && (
            <div>
              <h4 className="font-semibold text-sm text-green-600 dark:text-green-500 mb-3 uppercase tracking-wide flex items-center gap-2">
                {/* <span className="w-1 h-4 bg-green-600 dark:bg-green-500 rounded-full inline-block"></span> */}
                Teks kitab kuning (Ibarat)
              </h4>
              <div className={`text-lg text-right ${isExpanded ? "" : "max-h-[100px] overflow-hidden mask-linear-fade"}`}>
                <ArabicText content={isExpanded ? entry.ibarat_text : getSnippet(entry.ibarat_text, searchQuery)} className={isExpanded ? "" : ""} highlight={searchQuery} />
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="animate-in fade-in zoom-in duration-300 space-y-3 pt-2">
              {entry.musyawarah_source && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Sumber Musyawarah:
                  </h4>
                  <p className="text-sm text-muted-foreground">{entry.musyawarah_source}</p>
                </div>
              )}

              {entry.source_kitab && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Kitab:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {entry.source_kitab}
                    {entry.source_details && ` - ${entry.source_details}`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="gap-1 hover:bg-muted z-10"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Lihat Detail
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}