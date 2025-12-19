import { notFound } from 'next/navigation'
import AdminForm from '@/components/AdminForm'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface EditEntryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = await params
  const { data: entry, error } = await supabaseAdmin
    .from('fiqh_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    notFound()
  }

  // Fetch source books
  const { data: sourceBooks } = await supabaseAdmin
    .from('source_books')
    .select('*')
    .eq('entry_id', id)
    .order('order_index', { ascending: true })

  // Attach source books to entry
  const entryWithBooks = {
    ...entry,
    source_books: sourceBooks || []
  }

  return <AdminForm entry={entryWithBooks} isEdit={true} />
}