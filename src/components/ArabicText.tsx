import React from 'react';

interface ArabicTextProps {
    content: string;
    className?: string; // Allow passing extra classes
    highlight?: string;
}

// Helper to convert English numerals to Arabic numerals
export const toArabicNumerals = (str: string) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicNumerals[+w]);
};

// Helper to remove Arabic diacritics (Tashkeel) including Tatweel
export const removeTashkeel = (str: string) => str.replace(/[\u0640\u064B-\u065F\u0670]/g, '');

// Helper to generate flexible regex for Arabic highlighting
export const getHighlightRegex = (query: string) => {
    if (!query || query.trim() === '') return null;

    const arabicQuery = removeTashkeel(toArabicNumerals(query)).normalize('NFC');
    const terms = arabicQuery.split(/\s+/).filter(t => t.length > 0);

    if (terms.length === 0) return null;

    const tashkeelRange = '\\u0640\\u064B-\\u065F\\u0670';
    const createFlexibleRegex = (term: string) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.split('').map(c => {
            let p = c;
            if (/[اأإآ]/.test(c)) p = '[اأإآ]';
            else if (/[يى]/.test(c)) p = '[يى]';
            else if (/[هة]/.test(c)) p = '[هة]';
            return p + `[${tashkeelRange}]*`;
        }).join('');
    };

    const flexiblePatterns = terms.map(createFlexibleRegex);
    return {
        loopRegex: new RegExp(`(${flexiblePatterns.join('|')})`, 'gi'),
        checkRegex: new RegExp(`^(${flexiblePatterns.join('|')})$`, 'i')
    };
};

const ArabicText: React.FC<ArabicTextProps> = ({ content, className, highlight }) => {
    if (!content) return null;

    // Helper to unescape HTML entities if they exist
    const unescapeHtml = (str: string) => {
        return str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&");
    };

    const decodedContent = unescapeHtml(content).normalize('NFC');

    // Helper to process text: Numerals -> Normalize -> Highlight
    const processTextContent = (text: string) => {
        const withNumerals = toArabicNumerals(text);

        if (!highlight || highlight.trim() === '') return withNumerals;

        const regexes = getHighlightRegex(highlight);
        if (!regexes) return withNumerals;

        const { loopRegex, checkRegex } = regexes;

        // We cannot return React Nodes here because this goes into dangerouslySetInnerHTML
        // So we return raw HTML string for the highlight span
        return withNumerals.split(loopRegex).map(part =>
            checkRegex.test(part)
                ? `<span class="text-red-500 font-bold bg-yellow-100/50 dark:bg-yellow-900/30 rounded px-0.5">${part}</span>`
                : part
        ).join('');
    };

    // Helper to safely convert numerals and Highlight in HTML string
    const convertHtmlContent = (html: string) => {
        // Regex to match text content: >text<
        // This ensures we don't mess up attributes or tags
        return html.replace(/>([^<]+)</g, (match, textContent) => {
            return `>${processTextContent(textContent)}<`;
        });
    };

    // Check if content looks like HTML (basic check)
    // Tiptap usually wraps content in <p> or other tags.
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(decodedContent);

    if (isHtml) {
        return (
            <div
                className={`prose dark:prose-invert max-w-none text-right font-arabic leading-loose text-lg ${className || ''}`}
                style={{ fontFamily: 'var(--font-arabic)', direction: 'rtl' }}
                dangerouslySetInnerHTML={{ __html: convertHtmlContent(decodedContent) }}
            />
        );
    }

    // LEGACY: Split content into paragraphs for markdown-like parsing
    const paragraphs = decodedContent.split('\n').filter((p) => p.trim() !== '');

    return (
        <div className={`space-y-4 ${className || ''}`} style={{ fontFamily: 'var(--font-arabic)' }}>
            {paragraphs.map((paragraph, pIndex) => {
                const trimmed = paragraph.trim();

                // Handle centered separator
                if (trimmed === '***') {
                    return (
                        <div key={pIndex} className="text-center text-xl my-4 text-muted-foreground">
                            ***
                        </div>
                    );
                }

                // Parse formatting within paragraph
                const parts = parseFormatting(toArabicNumerals(paragraph), highlight);

                return (
                    <p key={pIndex} className={`font-arabic rtl leading-loose text-right text-lg ${className || ''}`}>
                        {parts}
                    </p>
                );
            })}
        </div>
    );
};

// ... existing code ...

const normalizeArabic = (text: string): string => {
    return text
        .normalize('NFC')
        .replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z\s])/g, '');
};

// Helper to parse formatting and then highlight
const parseFormatting = (text: string, query?: string): React.ReactNode[] => {

    // Helper to highlight matching text with normalization
    const highlightText = (text: string, query?: string): React.ReactNode[] => {
        if (!query || query.trim() === '') return [<span key="0">{text}</span>];

        const regexes = getHighlightRegex(query);
        if (!regexes) return [<span key="0">{text}</span>];

        const { loopRegex, checkRegex } = regexes;

        const parts = text.split(loopRegex);
        return parts.map((part, i) =>
            checkRegex.test(part) ? (
                <span key={i} className="text-red-500 font-bold bg-yellow-100/50 dark:bg-yellow-900/30 rounded px-0.5">
                    {part}
                </span>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    const regex = /(\[.*?\]|\*\*.*?\*\*|\*.*?\*)/g;
    const split = text.split(regex);
    const results: React.ReactNode[] = [];

    split.forEach((part, index) => {
        if (!part) return;

        if (part.startsWith('[') && part.endsWith(']')) {
            // Formatting: Red/Bold (Reference)
            const inner = part.slice(1, -1);
            results.push(
                <span key={index} className="text-red-600 font-bold">
                    {highlightText(inner, query)}
                </span>
            );
        } else if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2);
            results.push(
                <strong key={index} className="font-bold">
                    {highlightText(inner, query)}
                </strong>
            );
        } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            const inner = part.slice(1, -1);
            results.push(
                <em key={index} className="italic">
                    {highlightText(inner, query)}
                </em>
            );
        } else {
            results.push(
                <span key={index}>
                    {highlightText(part, query)}
                </span>
            );
        }
    });

    return results;
};

export default ArabicText;
