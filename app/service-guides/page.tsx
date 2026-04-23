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
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {!error && guides?.length === 0 && <p>Keine Service-Anleitungen gefunden.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {guides?.map((guide) => (
          <li
            key={guide.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{guide.name}</div>
            <div>
              {guide.manufacturer} {guide.model}
            </div>
            <div>Typ: {guide.service_type}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
