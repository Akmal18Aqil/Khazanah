import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('fiqh_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get source books
    const { data: sourceBooks, error: booksError } = await supabaseAdmin
      .from('source_books')
      .select('*')
      .eq('entry_id', id)
      .order('order_index', { ascending: true })

    if (!booksError && sourceBooks) {
      data.source_books = sourceBooks
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('fiqh_entries')
      .update({
        title: body.title,
        question_text: body.question_text || null,
        answer_summary: body.answer_summary,
        ibarat_text: body.ibarat_text,
        musyawarah_source: body.musyawarah_source || null,
        entry_type: body.entry_type,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Handle source books update
    if (body.source_books) {
      // Delete existing source books
      await supabaseAdmin
        .from('source_books')
        .delete()
        .eq('entry_id', id)

      // Insert new source books
      const sourceBooks = body.source_books
        .filter((book: any) => book.kitab_name && book.kitab_name.trim())
        .map((book: any, index: number) => ({
          entry_id: id,
          kitab_name: book.kitab_name,
          details: book.details || null,
          order_index: index,
        }))

      if (sourceBooks.length > 0) {
        const { error: booksError } = await supabaseAdmin
          .from('source_books')
          .insert(sourceBooks)

        if (booksError) {
          console.error('Source books update error:', booksError)
        }
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { error } = await supabaseAdmin
      .from('fiqh_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}