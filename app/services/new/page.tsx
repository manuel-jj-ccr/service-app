export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function NewServicePage() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, city')
    .order('name', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Neuer Service</h1>
      <h2>Kunde auswählen</h2>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {!error && customers?.length === 0 && <p>Keine Kunden gefunden.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {customers?.map((customer) => (
          <li key={customer.id} style={{ marginBottom: 12 }}>
            <Link
              href={`/services/new/${customer.id}`}
              style={{
                display: 'block',
                padding: 16,
                border: '1px solid #ddd',
                borderRadius: 10,
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700 }}>{customer.name}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{customer.city}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
