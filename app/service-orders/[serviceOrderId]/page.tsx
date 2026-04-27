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
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Serviceauftrag</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24 }}>
        Übersicht über Auftrag, Serviceschritte und Abschlusstest.
      </p>

      {(orderError || stepResultsError || testResultsError) && (
        <pre style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, stepResultsError, testResultsError },
            null,
            2
          )}
        </pre>
      )}

      {order && (
        <>
          <section className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ marginTop: 0 }}>Auftragsdaten</h2>
            <div><strong>Auftragsnummer:</strong> {order.order_number}</div>
            <div><strong>Status:</strong> {order.status}</div>
            <div><strong>Gerät:</strong> {order.manufacturer_snapshot} {order.model_snapshot}</div>
            <div><strong>Seriennummer:</strong> {order.serial_number_snapshot}</div>
            <div><strong>Service:</strong> {order.guide_name_snapshot}</div>
          </section>

          <section className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Aktionen</h2>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {order.status === 'in_test' ? (
                <Link
                  href={`/service-orders/${serviceOrderId}/test`}
                  className="button-primary"
                >
                  Zum aktuellen Testschritt
                </Link>
              ) : order.status === 'completed' ||
                order.status === 'completed_with_findings' ? (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '14px 18px',
                    borderRadius: 10,
                    border: '1px solid var(--success-border)',
                    background: 'var(--success-bg)',
                    color: 'var(--text)',
                    fontWeight: 700,
                  }}
                >
                  Service abgeschlossen
                </span>
              ) : (
                <Link
                  href={`/service-orders/${serviceOrderId}/steps`}
                  className="button-primary"
                >
                  Zum aktuellen Serviceschritt
                </Link>
              )}

              <Link
                href={`/service-orders/${serviceOrderId}/report`}
                className="button-secondary"
              >
                Servicebericht / PDF
              </Link>

              <Link href="/services" className="button-secondary">
                Zur Service-Übersicht
              </Link>

              <Link href="/" className="button-secondary">
                Zur Startseite
              </Link>
            </div>
          </section>

          <section className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Abgeschlossene Serviceschritte</h2>

            {!stepResultsError && stepResults && stepResults.length === 0 && (
              <p className="muted">Noch keine Serviceschritte abgeschlossen.</p>
            )}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stepResults?.map((result) => (
                <li
                  key={result.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 10,
                    background: 'var(--panel-soft)',
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

                  <div className="muted" style={{ fontSize: 14 }}>
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

          <section className="card">
            <h2 style={{ marginTop: 0 }}>Testergebnisse</h2>

            {!testResultsError && testResults && testResults.length === 0 && (
              <p className="muted">Noch keine Testergebnisse vorhanden.</p>
            )}

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {testResults?.map((result) => (
                <li
                  key={result.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 10,
                    background: result.passed
                      ? 'var(--success-bg)'
                      : 'var(--warning-bg)',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Testschritt {result.step_number}:</strong>{' '}
                    {result.title_snapshot}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Gemessener Wert:</strong>{' '}
                    {result.measured_value || '—'} {result.unit_snapshot || ''}
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

                  <div className="muted" style={{ fontSize: 14 }}>
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
