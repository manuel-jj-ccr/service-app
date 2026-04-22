import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function Home() {
  const { data: customers, error, count } = await supabase
    .from('customers')
    .select('id,name,city', { count: 'exact' })

  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service App</h1>
      <p><strong>Supabase URL:</strong> {supabaseUrl}</p>
      <p><strong>Anzahl:</strong> {count ?? 'null'}</p>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
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
