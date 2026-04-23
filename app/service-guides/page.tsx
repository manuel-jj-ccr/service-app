export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceGuidesPage() {
  const { data: guides, error } = await supabase
    .from('service_guides')
    .select('*')
    .order('manufacturer', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service-Anleitungen</h1>

      {error && (
        <pre style={{ color: 'red' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {guides?.map((g) => (
          <li
            key={g.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{g.name}</div>
            <div>
              {g.manufacturer} {g.model}
            </div>
            <div>Typ: {g.service_type}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
