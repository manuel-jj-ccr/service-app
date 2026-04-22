import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CustomerDevicesPage({ params }: any) {
  const { customerId } = params

  const { data: devices, error } = await supabase
    .from('devices')
    .select('*')
    .eq('customer_id', customerId)

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Geräte auswählen</h1>

      {error && (
        <pre style={{ color: 'red' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {devices?.map((d) => (
          <li
            key={d.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {d.manufacturer} {d.model}
            </div>
            <div>SN: {d.serial_number}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
