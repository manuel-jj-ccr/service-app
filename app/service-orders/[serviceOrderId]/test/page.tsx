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
    order?.status === 'completed' || order?.status === 'completed_with_findings'

  const { data: currentTestStep, error: testStepError } = serviceIsCompleted
    ? { data: null, error: null }
    : await supabase
        .from('test_steps')
        .select('*')
        .eq('service_guide_id', order?.service_guide_id ?? '')
        .eq('step_number', currentTestStepNumber)
        .single()

  const { data: allTestSteps, error: allTestStepsError } = await supabase
    .from('test_steps')
    .select('id, step_number, title')
    .eq('service_guide_id', order?.service_guide_id ?? '')
    .order('step_number', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 800 }}>
      <h1>Abschlusstest</h1>

      {(orderError || testStepError || allTestStepsError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, testStepError, allTestStepsError },
            null,
            2
          )}
        </pre>
      )}

      {order && (
        <div style={{ marginBottom: 20, color: '#555' }}>
          <div>
            <strong>Auftrag:</strong> {order.order_number}
          </div>
          <div>
            <strong>Gerät:</strong> {order.manufacturer_snapshot}{' '}
            {order.model_snapshot}
          </div>
          <div>
            <strong>Service:</strong> {order.guide_name_snapshot}
          </div>
          <div>
            <strong>Status:</strong> {order.status}
          </div>
        </div>
      )}

      {serviceIsCompleted ? (
        <div
          style={{
            border: '1px solid #0a7',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            background: order?.status === 'completed' ? '#eafff7' : '#fff7e6',
          }}
        >
          <h2>
            {order?.status === 'completed'
              ? 'Service vollständig abgeschlossen'
              : 'Service abgeschlossen mit Befund'}
          </h2>

          <p>
            Alle Testschritte wurden dokumentiert. Der Serviceauftrag ist
            abgeschlossen.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <Link
              href={`/service-orders/${serviceOrderId}`}
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
              Serviceauftrag ansehen
            </Link>

            <Link
              href="/"
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
              Zur Startseite
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
              Zur Serviceübersicht
            </Link>
          </div>
        </div>
      ) : currentTestStep ? (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Testschritt {currentTestStep.step_number}
          </div>

          <h2 style={{ marginTop: 0 }}>{currentTestStep.title}</h2>

          <p style={{ lineHeight: 1.5 }}>{currentTestStep.description}</p>

          {currentTestStep.target_value_hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Sollwert / Hinweis:</strong>
              <div>{currentTestStep.target_value_hint}</div>
            </div>
          )}

          {currentTestStep.unit && (
            <div style={{ marginTop: 16 }}>
              <strong>Einheit:</strong> {currentTestStep.unit}
            </div>
          )}

          <form
            action={`/service-orders/${serviceOrderId}/test/complete`}
            method="get"
            style={{ marginTop: 24 }}
          >
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="measuredValue"
                style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}
              >
                Gemessener Wert
              </label>
              <input
                id="measuredValue"
                name="measuredValue"
                type="text"
                placeholder="z. B. 12.3"
                style={{
                  width: '100%',
                  maxWidth: 320,
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #ccc',
                  background: '#fff',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="passed"
                style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}
              >
                Ergebnis
              </label>
              <select
                id="passed"
                name="passed"
                defaultValue="true"
                style={{
                  width: '100%',
                  maxWidth: 320,
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #ccc',
                  background: '#fff',
                }}
              >
                <option value="true">Bestanden</option>
                <option value="false">Nicht bestanden</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="remark"
                style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}
              >
                Bemerkung
              </label>
              <textarea
                id="remark"
                name="remark"
                rows={5}
                placeholder="Optional: Bemerkungen zum Testschritt"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #ccc',
                  background: '#fff',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Testschritt abschließen
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            background: '#fafafa',
          }}
        >
          <h2>Keine weiteren Testschritte</h2>
          <p>Der Abschlusstest ist fertig.</p>

          <Link
            href={`/service-orders/${serviceOrderId}`}
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '14px 18px',
              borderRadius: 10,
              border: '1px solid #111',
              background: '#111',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Serviceauftrag ansehen
          </Link>
        </div>
      )}

      {allTestSteps && allTestSteps.length > 0 && (
        <div>
          <h3>Alle Testschritte</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allTestSteps.map((step) => (
              <li
                key={step.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  background:
                    step.step_number === currentTestStepNumber &&
                    !serviceIsCompleted
                      ? '#f5f5f5'
                      : '#fff',
                }}
              >
                <strong>Testschritt {step.step_number}:</strong> {step.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link
          href={`/service-orders/${serviceOrderId}`}
          style={{
            display: 'inline-block',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #111',
            background: '#fff',
            color: '#111',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Zurück zum Serviceauftrag
        </Link>
      </div>
    </main>
  )
}
