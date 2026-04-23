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

  const { data: order, error: orderError } = await supabase
    .from('service_orders')
    .select('*')
    .eq('id', serviceOrderId)
    .single()

  const { data: results, error: resultsError } = await supabase
    .from('service_step_results')
    .select(
      'id, step_number, title_snapshot, result, note, processed_at, processed_by'
    )
    .eq('service_order_id', serviceOrderId)
    .order('step_number', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 900 }}>
      <h1>Serviceauftrag</h1>

      {(orderError || resultsError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ orderError, resultsError }, null, 2)}
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
            <p>Hier siehst du den aktuellen Stand und die bereits erledigten Schritte.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <Link
              href={`/service-orders/${serviceOrderId}/steps`}
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
              Zum aktuellen Serviceschritt
            </Link>

            <Link
              href="/services"
              style={{
                display: 'inline-block',
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid #111',
                background: '#fff',
                color: '#111',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Zur Service-Übersicht
            </Link>
          </div>

          <section>
            <h2>Abgeschlossene Schritte</h2>

            {!resultsError && results && results.length === 0 && (
              <p>Noch keine Schritte abgeschlossen.</p>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {results?.map((result) => (
                <li
                  key={result.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    background: '#fff',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Schritt {result.step_number}:</strong>{' '}
                    {result.title_snapshot}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Ergebnis:</strong>{' '}
                    {result.result === 'ok' ? 'OK' : 'Komplikation'}
                  </div>

                  {result.note && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>Notiz:</strong> {result.note}
                    </div>
                  )}

                  <div style={{ color: '#666', fontSize: 14 }}>
                    {result.processed_by && (
                      <>
                        <strong>Bearbeitet von:</strong> {result.processed_by}
                        <br />
                      </>
                    )}
                    {result.processed_at && (
                      <>
                        <strong>Bearbeitet am:</strong>{' '}
                        {new Date(result.processed_at).toLocaleString('de-DE')}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
