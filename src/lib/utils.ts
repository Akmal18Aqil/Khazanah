import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function unescapeHtml(str: string) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}

export function stripHtml(html: string) {
  if (!html) return ""
  // First unescape to handle cases where HTML might be escaped
  const unescaped = unescapeHtml(html)
  // Then strip tags
  return unescaped.replace(/<[^>]*>?/gm, "")
}

export function highlightText(text: string, query?: string): string {
  if (!query || query.trim() === '') return text

  const terms = query.split(/\s+/).filter(t => t.length > 0)
  if (terms.length === 0) return text

  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi')

  // We need to return a string with HTML tags for highlighting because 
  // we might want to use dangerouslySetInnerHTML or parse it afterwards.
  // But wait, React components usually render ReactNodes.
  // Ideally, this helper returns a string with <mark> tags, and we parse it?
  // OR we can't easily put JSX in utils unless it's a .tsx file.
  // Let's keep utils as logic only. 
  // Actually, let's keep the highlighting logic IN THE COMPONENT for now to avoid TSX issues in utils.ts if it's not setup for it.
  // I'll skip adding it to utils for now and just implement logical equivalent in FiqhCard.
  return text
}
