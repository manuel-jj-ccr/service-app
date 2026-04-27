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

  const { data: allTestSteps, error: allTestStepsError } = await supabase
    .from('test_steps')
    .select('id, step_number, title')
    .eq('service_guide_id', order?.service_guide_id ?? '')
    .order('step_number', { ascending: true })

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Abschlusstest</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24 }}>
        Dokumentiere die Testergebnisse Schritt für Schritt.
      </p>

      {(orderError || testStepError || allTestStepsError) && (
        <pre style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, testStepError, allTestStepsError },
            null,
            2
          )}
        </pre>
      )}

      {order && (
        <section className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>Auftrag</h2>
          <div><strong>Auftrag:</strong> {order.order_number}</div>
          <div><strong>Gerät:</strong> {order.manufacturer_snapshot} {order.model_snapshot}</div>
          <div><strong>Seriennummer:</strong> {order.serial_number_snapshot}</div>
          <div><strong>Service:</strong> {order.guide_name_snapshot}</div>
          <div><strong>Status:</strong> {order.status}</div>
        </section>
      )}

      {serviceIsCompleted ? (
        <section
          className="card"
          style={{
            marginBottom: 24,
            background:
              order?.status === 'completed'
                ? 'var(--success-bg)'
                : 'var(--warning-bg)',
            borderColor:
              order?.status === 'completed'
                ? 'var(--success-border)'
                : 'var(--warning-border)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {order?.status === 'completed'
              ? 'Service erfolgreich abgeschlossen'
              : 'Service abgeschlossen mit Befund'}
          </h2>

          <p>
            Alle Testschritte wurden durchgeführt und dokumentiert.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <Link
              href={`/service-orders/${serviceOrderId}/report`}
              className="button-primary"
            >
              Servicebericht / PDF
            </Link>

            <Link
              href={`/service-orders/${serviceOrderId}`}
              className="button-secondary"
            >
              Serviceauftrag ansehen
            </Link>

            <Link href="/" className="button-secondary">
              Zur Startseite
            </Link>

            <Link href="/services" className="button-secondary">
              Zur Übersicht
            </Link>
          </div>
        </section>
      ) : currentTestStep ? (
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Testschritt {currentTestStep.step_number}
          </div>

          <h2 style={{ marginTop: 0 }}>{currentTestStep.title}</h2>

          <p style={{ lineHeight: 1.6 }}>{currentTestStep.description}</p>

          {currentTestStep.target_value_hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Sollwert / Hinweis:</strong>
              <div className="muted">{currentTestStep.target_value_hint}</div>
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
            style={{ marginTop: 24, display: 'grid', gap: 16 }}
          >
            <div>
              <label htmlFor="measuredValue" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                Gemessener Wert
              </label>
              <input
                id="measuredValue"
                name="measuredValue"
                type="text"
                placeholder="z. B. 12.3"
                style={{ width: '100%', maxWidth: 360 }}
              />
            </div>

            <div>
              <label htmlFor="passed" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                Ergebnis
              </label>
              <select
                id="passed"
                name="passed"
                defaultValue="true"
                style={{ width: '100%', maxWidth: 360 }}
              >
                <option value="true">Bestanden</option>
                <option value="false">Nicht bestanden</option>
              </select>
            </div>

            <div>
              <label htmlFor="remark" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                Bemerkung
              </label>
              <textarea
                id="remark"
                name="remark"
                rows={5}
                placeholder="Optional: Bemerkungen zum Testschritt"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <button type="submit" className="button-primary">
                Testschritt abschließen
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Keine weiteren Testschritte</h2>
          <p>Der Abschlusstest ist fertig.</p>

          <Link
            href={`/service-orders/${serviceOrderId}`}
            className="button-primary"
          >
            Serviceauftrag ansehen
          </Link>
        </section>
      )}

      {allTestSteps && allTestSteps.length > 0 && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Alle Testschritte</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allTestSteps.map((step) => (
              <li
                key={step.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  background:
                    step.step_number === currentTestStepNumber &&
                    !serviceIsCompleted
                      ? 'var(--panel-soft)'
                      : 'transparent',
                }}
              >
                <strong>Testschritt {step.step_number}:</strong> {step.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <Link
          href={`/service-orders/${serviceOrderId}`}
          className="button-secondary"
        >
          Zurück zum Serviceauftrag
        </Link>
      </div>
    </main>
  )
}
