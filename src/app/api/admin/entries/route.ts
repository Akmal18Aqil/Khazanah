import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await supabaseAdmin
      .from('fiqh_entries')
      .select('id, title, entry_type, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const { count } = await supabaseAdmin
      .from('fiqh_entries')
      .select('*', { count: 'exact', head: true })

    const response = NextResponse.json({ data, count })
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: entryData, error: entryError } = await supabaseAdmin
      .from('fiqh_entries')
      .insert({
        title: body.title,
        question_text: body.question_text || null,
        answer_summary: body.answer_summary,
        ibarat_text: body.ibarat_text,
        musyawarah_source: body.musyawarah_source || null,
        entry_type: body.entry_type,
      })
      .select()
      .single()

    if (entryError) {
      console.error('Database error:', entryError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Insert source books if provided
    if (body.source_books && body.source_books.length > 0) {
      const sourceBooks = body.source_books
        .filter((book: any) => book.kitab_name.trim())
        .map((book: any, index: number) => ({
          entry_id: entryData.id,
          kitab_name: book.kitab_name,
          details: book.details || null,
          order_index: index,
        }))

      if (sourceBooks.length > 0) {
        const { error: booksError } = await supabaseAdmin
          .from('source_books')
          .insert(sourceBooks)

        if (booksError) {
          console.error('Source books insert error:', booksError)
          // Don't fail the whole request, just log the error
        }
      }
    }

    return NextResponse.json(entryData, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}