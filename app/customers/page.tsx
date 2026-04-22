import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CustomersPage() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Kunden verwalten</h1>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul style={{ padding: 0, listStyle: 'none' }}>
        {customers?.map((customer) => (
          <li
            key={customer.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{customer.name}</div>
            <div>{customer.city}</div>
            <div style={{ color: '#666', fontSize: 14 }}>{customer.email}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
