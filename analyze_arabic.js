
const query = "وَالْأَصْلُ";
const text = "وَالأَصْلُ"; // Potential target in text

function logChars(label, str) {
    console.log(`${label}: "${str}"`);
    str.split('').forEach((c, i) => {
        console.log(`  ${i}: ${c} \t(U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
    });
}

const normalize = (str) => str.normalize("NFC");

// 1. Strings to test
const qNorm = normalize(query);
const tNorm = normalize(text);

logChars("Query (NFC)", qNorm);
logChars("Text (NFC)", tNorm);

// 2. Logic simulation
const tashkeelRange = '\\u0640\\u064B-\\u065F\\u0670';
const removeTashkeel = (str) => str.replace(new RegExp(`[${tashkeelRange}]`, 'g'), '');
const toArabicNumerals = (str) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicNumerals[+w]);
};

// Process Query
const cleanQuery = removeTashkeel(toArabicNumerals(qNorm));
logChars("Cleaned Query", cleanQuery);

// Create Regex
const createFlexibleRegex = (term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.split('').map(c => {
        let p = c;
        if (/[اأإآ]/.test(c)) p = '[اأإآ]';
        else if (/[يى]/.test(c)) p = '[يى]';
        else if (/[هة]/.test(c)) p = '[هة]';
        // Allow tashkeel AFTER the character
        return p + `[${tashkeelRange}]*`;
    }).join('');
};

const terms = cleanQuery.split(/\s+/).filter(t => t.length > 0);
const pattern = terms.map(createFlexibleRegex).join('|');
console.log("\nRegex Pattern:", pattern);

const regex = new RegExp(`(${pattern})`, 'gi');
const checkRegex = new RegExp(`^(${pattern})$`, 'i');

// Test Split logic
console.log("\n--- Testing Split ---");
const parts = tNorm.split(regex);
console.log("Parts:", parts);

parts.forEach((part, i) => {
    const isMatch = checkRegex.test(part);
    console.log(`Part ${i}: "${part}" -> Match: ${isMatch}`);
    if (isMatch) {
        logChars(`Matched Part ${i}`, part);
    }
});
