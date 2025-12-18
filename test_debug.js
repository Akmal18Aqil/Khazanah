
const query = "وَالْأَصْلُ";
const text = "وَالأَصْلُ"; // From the text visible in FiqhCard

// Helper to remove Arabic diacritics (Tashkeel) including Tatweel
const removeTashkeel = (str) => str.replace(/[\u0640\u064B-\u065F\u0670]/g, '');

const toArabicNumerals = (str) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicNumerals[+w]);
};

// Logic from ArabicText.tsx
const highlightText = (text, query) => {
    console.log("Original Query:", query);
    const arabicQuery = removeTashkeel(toArabicNumerals(query));
    console.log("Processed Query (Arabic Numerals + No Tashkeel):", arabicQuery);

    // Check characters
    console.log("Query Chars:", arabicQuery.split('').map(c => c + ' (' + c.charCodeAt(0).toString(16) + ')'));

    const terms = arabicQuery.split(/\s+/).filter(t => t.length > 0);
    const tashkeelRange = '\\u0640\\u064B-\\u065F\\u0670';

    const createFlexibleRegex = (term) => {
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
    console.log("Flexible Patterns:", flexiblePatterns);

    const regex = new RegExp(`(${flexiblePatterns.join('|')})`, 'gi');
    console.log("Regex Source:", regex.source);

    // Simulate the split and map logic
    const parts = text.split(regex);
    console.log("Split parts:", parts);

    parts.forEach((part, i) => {
        const isMatch = regex.test(part);
        console.log(`Part ${i}: "${part}" - Match? ${isMatch} (lastIndex: ${regex.lastIndex})`);
    });

    const match = regex.test(text);
    console.log("\nMatch Result:", match);

    // Let's debug the text characters too
    console.log("\nTarget Text:", text);
    // Find where it SHOULD match
    // text starts with Wa Alif Lam...
    console.log("Text Chars:", text.split('').map(c => c + ' (' + c.charCodeAt(0).toString(16) + ')'));
};

highlightText(text, query);
```
