import { search, getBookInfo, getPage, type SearchOptions, type SearchResults, type PageResult } from 'turath-sdk';
import { TURATH_BOOKS, TURATH_AUTHORS } from './turath-data';
import { normalizeArabic } from './utils';

export type BookApiResponse = Awaited<ReturnType<typeof getBookInfo>>;

/**
 * Service Layer for Turath SDK
 * Wraps SDK calls to provide a consistent interface and centralized error handling.
 */
export class TurathService {
    /**
     * Search for books or content
     * @param query The search query string
     * @param filters Filters for books and authors
     */
    static async searchBooks(query: string, filters?: { books?: string[], authors?: string[], category?: string, madhhab?: string, options?: SearchOptions }): Promise<SearchResults> {
        try {
            // Ensure query is not empty to avoid SDK errors
            if (!query.trim()) {
                return { count: 0, data: [] };
            }

            // Ensure we fetch enough results for client-side filtering
            const searchOptions = { ...filters?.options, limit: 100 };
            const results = await search(query, searchOptions);

            // 1. Post-Filtering
            let filteredData = results.data;

            if (filters?.books && filters.books.length > 0) {
                // Filter where book name (or part of it) matches any of the selected books
                // Since API might return varied names, we check if the result's book identification loosely matches our selected book names
                filteredData = filteredData.filter(item => {
                    const itemName = item.meta?.book_name || (item as any).heading || '';
                    // Check if any selected book name is contained in the item name or vice versa
                    return filters.books!.some(selectedBook => itemName.includes(selectedBook) || selectedBook.includes(itemName));
                });
            }

            if (filters?.authors && filters.authors.length > 0) {
                filteredData = filteredData.filter(item => {
                    const itemName = item.meta?.author_name || '';
                    return filters.authors!.some(selectedAuthor => itemName.includes(selectedAuthor) || selectedAuthor.includes(itemName));
                });
            }

            if (filters?.category) {
                filteredData = filteredData.filter(item => {
                    const bookName = item.meta?.book_name || (item as any).heading || '';
                    const normBookName = normalizeArabic(bookName);

                    const matchedBook = TURATH_BOOKS.find(b => {
                        const normBName = normalizeArabic(b.name);
                        return normBookName.includes(normBName) || normBName.includes(normBookName);
                    });

                    return matchedBook?.category === filters.category;
                });
            }

            if (filters?.madhhab) {
                filteredData = filteredData.filter(item => {
                    const authorName = item.meta?.author_name || '';
                    const normAuthorName = normalizeArabic(authorName);

                    const matchedAuthor = TURATH_AUTHORS.find(a => {
                        const normAName = normalizeArabic(a.name);
                        return normAuthorName.includes(normAName) || normAName.includes(normAuthorName);
                    });
                    return matchedAuthor?.madhhab === filters.madhhab;
                });
            }

            // 2. Data Enrichment (Title/Author Correction from Static Data)
            const enrichedData = filteredData.map(item => {
                const bookName = item.meta?.book_name || (item as any).heading || '';

                // Try to find a "better" name from our static list if possible
                // This matches the user request: "ambil nama kitab dari list data ... agar datanya lengkap"
                // We find a matching entry in TURATH_BOOKS based on loose string matching
                const matchedBook = TURATH_BOOKS.find(b => bookName.includes(b.name) || b.name.includes(bookName));

                // If found, override/ensure the name is the full nice name from our list
                if (matchedBook) {
                    if (!item.meta) item.meta = {} as any;
                    item.meta!.book_name = matchedBook.name;
                }

                // Same for author
                const authorName = item.meta?.author_name || '';
                const matchedAuthor = TURATH_AUTHORS.find(a => authorName.includes(a.name) || a.name.includes(authorName));
                if (matchedAuthor) {
                    if (!item.meta) item.meta = {} as any;
                    item.meta!.author_name = matchedAuthor.name;
                }


                return item;
            });

            // 3. Sorting
            // "Zaman penulis yang terdahulu terlebih dahulu" = Ascending Death Date
            const sortOption = (filters?.options as any)?.sort;
            if (sortOption === 'death') {
                enrichedData.sort((a, b) => {
                    const nameA = a.meta?.author_name || '';
                    const nameB = b.meta?.author_name || '';
                    // Ideally we already matched them in enrichment step, but we didn't store the full author object on the item
                    // We only updated the string name. So we look up again or we could have stored it.
                    // For safety, let's lookup.
                    const authorA = TURATH_AUTHORS.find(auth => auth.name === nameA || nameA.includes(auth.name));
                    const authorB = TURATH_AUTHORS.find(auth => auth.name === nameB || nameB.includes(auth.name));

                    const deathA = authorA?.death || 9999;
                    const deathB = authorB?.death || 9999;

                    return deathA - deathB;
                });
            } else if (sortOption === 'book') {
                enrichedData.sort((a, b) => {
                    const nameA = a.meta?.book_name || '';
                    const nameB = b.meta?.book_name || '';
                    return nameA.localeCompare(nameB, 'ar');
                });
            } else if (sortOption === 'madhhab') {
                enrichedData.sort((a, b) => {
                    const nameA = a.meta?.author_name || '';
                    const nameB = b.meta?.author_name || '';
                    const authorA = TURATH_AUTHORS.find(auth => auth.name === nameA || nameA.includes(auth.name));
                    const authorB = TURATH_AUTHORS.find(auth => auth.name === nameB || nameB.includes(auth.name));

                    const madhhabA = authorA?.madhhab || 'z_unknown'; // 'z_' to put unknown last
                    const madhhabB = authorB?.madhhab || 'z_unknown';

                    return madhhabA.localeCompare(madhhabB);
                });
            } else if (sortOption === 'category') {
                enrichedData.sort((a, b) => {
                    const nameA = a.meta?.book_name || '';
                    const nameB = b.meta?.book_name || '';
                    const bookA = TURATH_BOOKS.find(b => b.name === nameA || nameA.includes(b.name));
                    const bookB = TURATH_BOOKS.find(b => b.name === nameB || nameB.includes(b.name));

                    const catA = bookA?.category || 'z_unknown';
                    const catB = bookB?.category || 'z_unknown';

                    return catA.localeCompare(catB);
                });
            }

            return {
                ...results,
                count: enrichedData.length, // Update count
                data: enrichedData
            };
        } catch (error) {
            console.error('TurathService.searchBooks error:', error);
            // Return empty results or rethrow based on strategy. 
            // For now, rethrowing with a user-friendly message is better for UI handling.
            throw new Error(`Gagal mencari kitab: ${(error as Error).message}`);
        }
    }

    /**
     * Get formatted information about a book
     * @param id Book ID
     */
    static async getBookInfo(id: number): Promise<BookApiResponse> {
        try {
            const book = await getBookInfo(id);
            return book;
        } catch (error) {
            console.error('TurathService.getBookInfo error:', error);
            throw new Error(`Gagal mengambil informasi kitab: ${(error as Error).message}`);
        }
    }

    /**
     * Fetch a specific page from a book
     * @param bookId Book ID
     * @param pageNumber Page Number
     */
    static async getPage(bookId: number, pageNumber: number): Promise<PageResult> {
        try {
            const page = await getPage(bookId, pageNumber);
            return page;
        } catch (error) {
            console.error('TurathService.getPage error:', error);
            throw new Error(`Gagal memuat halaman: ${(error as Error).message}`);
        }
    }

    /**
     * Get book indexes (Table of Contents)
     * @param bookId Book ID
     */
    /**
     * Get book indexes (Table of Contents)
     * @param bookId Book ID
     */
    static async getBookIndexes(bookId: number): Promise<any[]> {
        // Stub for now as SDK does not export getIndexes yet
        return [];
    }
    /**
     * Get paginated list of available books (from static data)
     */
    static async getBooksList(page: number = 1, limit: number = 20, query: string = ''): Promise<{ data: typeof TURATH_BOOKS, hasMore: boolean }> {
        let filtered = TURATH_BOOKS;
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = TURATH_BOOKS.filter(b => b.name.toLowerCase().includes(lowerQuery));
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const data = filtered.slice(start, end);
        return {
            data,
            hasMore: end < filtered.length
        };
    }

    /**
     * Get paginated list of authors (from static data)
     */
    static async getAuthorsList(page: number = 1, limit: number = 20, query: string = ''): Promise<{ data: typeof TURATH_AUTHORS, hasMore: boolean }> {
        let filtered = TURATH_AUTHORS;
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = TURATH_AUTHORS.filter(a => a.name.toLowerCase().includes(lowerQuery));
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const data = filtered.slice(start, end);
        return {
            data,
            hasMore: end < filtered.length
        };
    }
}
