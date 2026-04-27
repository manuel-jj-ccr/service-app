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

  const { data: stepResults, error: stepResultsError } = await supabase
    .from('service_step_results')
    .select(
      'id, step_number, title_snapshot, result, note, processed_at, processed_by'
    )
    .eq('service_order_id', serviceOrderId)
    .order('step_number', { ascending: true })

  const { data: testResults, error: testResultsError } = await supabase
    .from('test_results')
    .select(
      'id, step_number, title_snapshot, measured_value, unit_snapshot, passed, remark, recorded_at, recorded_by'
    )
    .eq('service_order_id', serviceOrderId)
    .order('step_number', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 900 }}>
      <h1>Serviceauftrag</h1>

      {(orderError || stepResultsError || testResultsError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, stepResultsError, testResultsError },
            null,
            2
          )}
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

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            {order.status === 'in_test' ? (
              <Link
                href={`/service-orders/${serviceOrderId}/test`}
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
                Zum aktuellen Testschritt
              </Link>
            ) : order.status === 'completed' || order.status === 'completed_with_findings' ? (
              <span
                style={{
                  display: 'inline-block',
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: '1px solid #0a7',
                  background: '#eafff7',
                  color: '#064',
                  fontWeight: 700,
                }}
              >
                Service abgeschlossen
              </span>
            ) : (
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
            )}

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

          <section style={{ marginBottom: 32 }}>
            <h2>Abgeschlossene Serviceschritte</h2>

            {!stepResultsError && stepResults && stepResults.length === 0 && (
              <p>Noch keine Serviceschritte abgeschlossen.</p>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {stepResults?.map((result) => (
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

          <section>
            <h2>Testergebnisse</h2>

            {!testResultsError && testResults && testResults.length === 0 && (
              <p>Noch keine Testergebnisse vorhanden.</p>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {testResults?.map((result) => (
                <li
                  key={result.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    background: result.passed ? '#f7fff9' : '#fff7f7',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Testschritt {result.step_number}:</strong>{' '}
                    {result.title_snapshot}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Gemessener Wert:</strong>{' '}
                    {result.measured_value || '—'}{' '}
                    {result.unit_snapshot || ''}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Ergebnis:</strong>{' '}
                    {result.passed ? 'Bestanden' : 'Nicht bestanden'}
                  </div>

                  {result.remark && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>Bemerkung:</strong> {result.remark}
                    </div>
                  )}

                  <div style={{ color: '#666', fontSize: 14 }}>
                    {result.recorded_by && (
                      <>
                        <strong>Erfasst von:</strong> {result.recorded_by}
                        <br />
                      </>
                    )}
                    {result.recorded_at && (
                      <>
                        <strong>Erfasst am:</strong>{' '}
                        {new Date(result.recorded_at).toLocaleString('de-DE')}
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
