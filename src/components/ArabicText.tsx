import React from 'react';

interface ArabicTextProps {
    content: string;
    className?: string; // Allow passing extra classes
}

const ArabicText: React.FC<ArabicTextProps> = ({ content, className }) => {
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

    const decodedContent = unescapeHtml(content);

    // Helper to convert English numerals to Arabic numerals
    const toArabicNumerals = (str: string) => {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return str.replace(/[0-9]/g, (w) => arabicNumerals[+w]);
    };

    // Helper to safely convert numerals in HTML string
    const convertHtmlNumerals = (html: string) => {
        // Regex to match text content: >text<
        // This ensures we don't mess up attributes or tags
        return html.replace(/>([^<]+)</g, (match, textContent) => {
            // Reconstruct the match with converted text
            const convertedText = toArabicNumerals(textContent);
            return `>${convertedText}<`;
        });
    };

    // Check if content looks like HTML (basic check)
    // Tiptap usually wraps content in <p> or other tags.
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(decodedContent);

    if (isHtml) {
        return (
            <div
                className={`prose prose-lg max-w-none text-right font-arabic leading-loose ${className || ''}`}
                style={{ fontFamily: 'var(--font-arabic)', direction: 'rtl' }}
                dangerouslySetInnerHTML={{ __html: convertHtmlNumerals(decodedContent) }}
            />
        );
    }

    // LEGACY: Split content into paragraphs for markdown-like parsing
    const paragraphs = content.split('\n').filter((p) => p.trim() !== '');

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
                const parts = parseFormatting(toArabicNumerals(paragraph));

                return (
                    <p key={pIndex} className="font-arabic rtl text-2xl leading-loose text-right">
                        {parts}
                    </p>
                );
            })}
        </div>
    );
};

// Helper to parse bold, italic, and red brackets
const parseFormatting = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Regex explanation:
    // 1. \[.*?\] -> Matches text inside brackets (referensi) including brackets
    // 2. \*\*.*?\*\* -> Matches bold markdown
    // 3. \*.*?\* -> Matches italic markdown
    // 4. (text) -> Captures everything else

    // We'll process sequentially. For simplicity and robustness given the likely input structure:
    // We can use a single regex to split the token stream.

    // Strategy: match one of the special tokens, or plain text.
    // Order matters. Check brackets first.

    const regex = /(\[.*?\]|\*\*.*?\*\*|\*.*?\*)/g;
    const split = text.split(regex);

    split.forEach((part, index) => {
        if (!part) return;

        if (part.startsWith('[') && part.endsWith(']')) {
            // Red and Bold Reference
            elements.push(
                <span key={index} className="text-red-600 font-bold">
                    {part.slice(1, -1)}
                </span>
            );
        } else if (part.startsWith('**') && part.endsWith('**')) {
            // Bold
            elements.push(
                <strong key={index} className="font-bold">
                    {part.slice(2, -2)}
                </strong>
            );
        } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) { // length check to avoid single *
            // Italic
            elements.push(
                <em key={index} className="italic">
                    {part.slice(1, -1)}
                </em>
            );
        } else {
            // Plain text
            elements.push(<span key={index}>{part}</span>);
        }
    });

    return elements;
};

export default ArabicText;
