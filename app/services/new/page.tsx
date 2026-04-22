import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function NewServicePage() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Neuer Service</h1>
      <h2>Kunde auswählen</h2>

      {error && (
        <pre style={{ color: 'red' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {customers?.map((c) => (
          <li key={c.id} style={{ marginBottom: 12 }}>
            <Link
              href={`/services/new/${c.id}`}
              style={{
                display: 'block',
                padding: 16,
                border: '1px solid #ddd',
                borderRadius: 10,
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{c.city}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
