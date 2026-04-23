export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServicesPage() {
  const { data: serviceOrders, error } = await supabase
    .from('service_orders')
    .select(
      `
        id,
        order_number,
        status,
        manufacturer_snapshot,
        model_snapshot,
        serial_number_snapshot,
        guide_name_snapshot,
        started_at
      `
    )
    .in('status', ['new', 'in_progress', 'in_test'])
    .order('started_at', { ascending: false })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 900 }}>
      <h1>Laufende Services</h1>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {!error && serviceOrders?.length === 0 && (
        <p>Keine laufenden Services vorhanden.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {serviceOrders?.map((order) => (
          <li
            key={order.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              background: '#fff',
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Auftragsnummer:</strong> {order.order_number}
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>Status:</strong> {order.status}
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>Gerät:</strong> {order.manufacturer_snapshot}{' '}
              {order.model_snapshot}
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>Seriennummer:</strong> {order.serial_number_snapshot}
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>Service:</strong> {order.guide_name_snapshot}
            </div>

            {order.started_at && (
              <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
                <strong>Gestartet am:</strong>{' '}
                {new Date(order.started_at).toLocaleString('de-DE')}
              </div>
            )}

            <Link
              href={`/service-orders/${order.id}`}
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Service öffnen
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
