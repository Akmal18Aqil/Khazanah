'use server'

import { TurathService } from '@/lib/turath';
import { SearchOptions } from 'turath-sdk';

/**
 * Server Action to search for books
 */
export async function searchBooksAction(query: string, filters?: { books?: string[], authors?: string[], category?: string, madhhab?: string, options?: SearchOptions }) {
    return await TurathService.searchBooks(query, filters);
}

/**
 * Server Action to get book info
 */
export async function getBookInfoAction(id: number) {
    return await TurathService.getBookInfo(id);
}

/**
 * Server Action to get a specific page
 */
export async function getPageAction(bookId: number, pageNumber: number) {
    return await TurathService.getPage(bookId, pageNumber);
}

export async function getBooksListAction(page: number, limit: number, query: string = '') {
    return await TurathService.getBooksList(page, limit, query);
}

export async function getAuthorsListAction(page: number, limit: number, query: string = '') {
    return await TurathService.getAuthorsList(page, limit, query);
}

export async function getBookIndexesAction(bookId: number) {
    try {
        return await TurathService.getBookIndexes(bookId);
    } catch (error) {
        console.error('getBookIndexesAction error:', error);
        return [];
    }
}
