export function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
}

export function sanitizeSnippet(html: string): string {
    if (!html) return '';
    // Allow <em> tags, remove others but keep content
    // This is a simple regex approach. For production, a sanitizer library is better.
    // We want to keep <em> and </em>, but remove everything else.
    // Strategy: Replace <em> with temporary placeholder, strip tags, restore <em>.

    let temp = html.replace(/<em>/g, '[[EM]]').replace(/<\/em>/g, '[[/EM]]');
    temp = temp.replace(/<[^>]*>/g, '');
    return temp.replace(/\[\[EM\]\]/g, '<em>').replace(/\[\[\/EM\]\]/g, '</em>');
}
