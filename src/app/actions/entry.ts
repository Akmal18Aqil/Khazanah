'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { fiqhEntrySchema, FiqhEntryValues } from '@/lib/schemas'

export async function createEntry(data: FiqhEntryValues) {
    const session = await getServerSession()
    if (!session) {
        throw new Error('Unauthorized')
    }

    const result = fiqhEntrySchema.safeParse(data)
    if (!result.success) {
        return { error: 'Validation failed' }
    }

    const {
        title,
        question_text,
        answer_summary,
        ibarat_text,
        musyawarah_source,
        entry_type,
        source_books,
    } = result.data

    try {
        const { data: entryData, error: entryError } = await supabaseAdmin
            .from('fiqh_entries')
            .insert({
                title,
                question_text: question_text || null,
                answer_summary,
                ibarat_text,
                musyawarah_source: musyawarah_source || null,
                entry_type,
            })
            .select()
            .single()

        if (entryError) throw new Error(entryError.message)

        if (source_books && source_books.length > 0) {
            const booksToInsert = source_books
                .filter((book) => book.kitab_name.trim())
                .map((book, index) => ({
                    entry_id: entryData.id,
                    kitab_name: book.kitab_name,
                    details: book.details || null,
                    order_index: index,
                }))

            if (booksToInsert.length > 0) {
                const { error: booksError } = await supabaseAdmin
                    .from('source_books')
                    .insert(booksToInsert)

                if (booksError) {
                    console.error('Source books insert error:', booksError)
                    // We don't throw here to ensure the entry is at least created,
                    // but in a transaction-like environment we might want to rollback.
                    // For now, consistent with original implementation.
                }
            }
        }

        revalidatePath('/admin')
        return { success: true, id: entryData.id }
    } catch (error: any) {
        console.error('Create Entry Error:', error)
        return { error: error.message || 'Failed to create entry' }
    }
}

export async function updateEntry(id: string, data: FiqhEntryValues) {
    const session = await getServerSession()
    if (!session) {
        throw new Error('Unauthorized')
    }

    const result = fiqhEntrySchema.safeParse(data)
    if (!result.success) {
        return { error: 'Validation failed' }
    }

    const {
        title,
        question_text,
        answer_summary,
        ibarat_text,
        musyawarah_source,
        entry_type,
        source_books,
    } = result.data

    try {
        const { error: entryError } = await supabaseAdmin
            .from('fiqh_entries')
            .update({
                title,
                question_text: question_text || null,
                answer_summary,
                ibarat_text,
                musyawarah_source: musyawarah_source || null,
                entry_type,
            })
            .eq('id', id)

        if (entryError) throw new Error(entryError.message)

        // Handle source books: Delete existing and re-insert (simplest strategy for now)
        // Or update/upsert. The original API didn't show the UPDATE logic, 
        // assuming we should just replace them for simplicity or implement a smarter diff.
        // Let's go with delete all for this entry + insert new ones to keep it synced.

        // First, delete existing source books for this entry
        const { error: deleteError } = await supabaseAdmin
            .from('source_books')
            .delete()
            .eq('entry_id', id)

        if (deleteError) console.error('Error deleting old source books:', deleteError)

        if (source_books && source_books.length > 0) {
            const booksToInsert = source_books
                .filter((book) => book.kitab_name.trim())
                .map((book, index) => ({
                    entry_id: id,
                    kitab_name: book.kitab_name,
                    details: book.details || null,
                    order_index: index,
                }))

            if (booksToInsert.length > 0) {
                const { error: booksError } = await supabaseAdmin
                    .from('source_books')
                    .insert(booksToInsert)

                if (booksError) {
                    console.error('Source books insert error during update:', booksError)
                }
            }
        }

        revalidatePath('/admin')
        revalidatePath(`/admin/entry/${id}`)
        return { success: true }
    } catch (error: any) {
        console.error('Update Entry Error:', error)
        return { error: error.message || 'Failed to update entry' }
    }
}
