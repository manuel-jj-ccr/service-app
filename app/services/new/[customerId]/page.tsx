export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CustomerDevicesPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name, city')
    .eq('id', customerId)
    .single()

  const { data: devices, error: devicesError } = await supabase
    .from('devices')
    .select('*')
    .eq('customer_id', customerId)
    .order('model', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Geräte auswählen</h1>

      {customer && (
        <div style={{ marginBottom: 20, color: '#555' }}>
          <div>
            <strong>Kunde:</strong> {customer.name}
          </div>
          <div>{customer.city}</div>
        </div>
      )}

      {customerError && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(customerError, null, 2)}
        </pre>
      )}

      {devicesError && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(devicesError, null, 2)}
        </pre>
      )}

      {!devicesError && devices?.length === 0 && <p>Keine Geräte gefunden.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {devices?.map((d) => (
          <li key={d.id} style={{ marginBottom: 12 }}>
            <Link
              href={`/services/new/${customerId}/${d.id}`}
              style={{
                display: 'block',
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 16,
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {d.manufacturer} {d.model}
              </div>
              <div>SN: {d.serial_number}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
