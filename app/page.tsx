import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')

  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service App</h1>

      <h2>Kunden</h2>

      <p><strong>Geladene Kunden:</strong> {customers?.length ?? 0}</p>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {!error && customers && customers.length === 0 && (
        <p>Keine Kunden gefunden.</p>
      )}

      <ul>
        {customers?.map((c) => (
          <li key={c.id}>
            {c.name} – {c.city}
          </li>
        ))}
      </ul>
    </main>
  )
}
