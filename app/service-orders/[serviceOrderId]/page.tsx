export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceOrderPage({
  params,
}: {
  params: Promise<{ serviceOrderId: string }>
}) {
  const { serviceOrderId } = await params

  const { data: order, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('id', serviceOrderId)
    .single()

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Serviceauftrag</h1>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {order && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div>
              <strong>Auftragsnummer:</strong> {order.order_number}
            </div>
            <div>
              <strong>Status:</strong> {order.status}
            </div>
            <div>
              <strong>Gerät:</strong> {order.manufacturer_snapshot}{' '}
              {order.model_snapshot}
            </div>
            <div>
              <strong>Seriennummer:</strong> {order.serial_number_snapshot}
            </div>
            <div>
              <strong>Service:</strong> {order.guide_name_snapshot}
            </div>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              background: '#fafafa',
              marginBottom: 20,
            }}
          >
            <p>Der Serviceauftrag wurde erfolgreich angelegt.</p>
            <p>Als Nächstes bauen wir den ersten echten Serviceschritt.</p>
          </div>

          <Link
            href="/services"
            style={{
              display: 'inline-block',
              padding: '14px 18px',
              borderRadius: 10,
              border: '1px solid #111',
              background: '#111',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Zur Service-Übersicht
          </Link>
        </>
      )}
    </main>
  )
}
