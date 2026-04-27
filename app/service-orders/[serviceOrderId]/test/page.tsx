export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceOrderTestPage({
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

  const currentTestStepNumber = order?.current_test_step_number ?? 1

  const serviceIsCompleted =
    order?.status === 'completed' ||
    order?.status === 'completed_with_findings'

  const { data: currentTestStep, error: testStepError } = serviceIsCompleted
    ? { data: null, error: null }
    : await supabase
        .from('test_steps')
        .select('*')
        .eq('service_guide_id', order?.service_guide_id ?? '')
        .eq('step_number', currentTestStepNumber)
        .single()

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 800 }}>
      <h1>Abschlusstest</h1>

      {(orderError || testStepError) && (
        <pre style={{ color: 'red' }}>
          {JSON.stringify({ orderError, testStepError }, null, 2)}
        </pre>
      )}

      {order && (
        <div style={{ marginBottom: 20 }}>
          <p><strong>Auftrag:</strong> {order.order_number}</p>
          <p><strong>Gerät:</strong> {order.manufacturer_snapshot} {order.model_snapshot}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      )}

      {/* 🔥 FALL 1: SERVICE KOMPLETT FERTIG */}
      {serviceIsCompleted ? (
        <div
          style={{
            border: '2px solid #0a7',
            borderRadius: 12,
            padding: 20,
            background: '#eafff7',
          }}
        >
          <h2>
            {order?.status === 'completed'
              ? 'Service erfolgreich abgeschlossen'
              : 'Service abgeschlossen mit Befund'}
          </h2>

          <p>
            Alle Testschritte wurden durchgeführt und dokumentiert.
          </p>

          {/* 🔥 NEU: PDF BUTTON DIREKT HIER */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            
            <Link
              href={`/service-orders/${serviceOrderId}/report`}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: '#111',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Servicebericht (PDF)
            </Link>

            <Link
              href={`/service-orders/${serviceOrderId}`}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid #111',
                textDecoration: 'none',
                color: '#111',
                fontWeight: 700,
              }}
            >
              Serviceauftrag ansehen
            </Link>

            <Link
              href="/services"
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid #111',
                textDecoration: 'none',
                color: '#111',
                fontWeight: 700,
              }}
            >
              Zur Übersicht
            </Link>
          </div>
        </div>
      ) : currentTestStep ? (
        /* 🔧 FALL 2: NORMALER TESTSCHRITT */
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 20,
            background: '#fafafa',
          }}
        >
          <h2>Testschritt {currentTestStep.step_number}</h2>

          <p>{currentTestStep.description}</p>

          <form
            action={`/service-orders/${serviceOrderId}/test/complete`}
            method="get"
            style={{ marginTop: 20 }}
          >
            <input name="measuredValue" placeholder="Messwert" />

            <select name="passed" defaultValue="true">
              <option value="true">Bestanden</option>
              <option value="false">Nicht bestanden</option>
            </select>

            <textarea name="remark" placeholder="Bemerkung" />

            <button type="submit">Testschritt abschließen</button>
          </form>
        </div>
      ) : null}
    </main>
  )
}
