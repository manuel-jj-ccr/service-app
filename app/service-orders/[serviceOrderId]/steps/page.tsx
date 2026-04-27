export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceOrderStepsPage({
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

  const currentStepNumber = order?.current_service_step_number ?? 1
  const serviceIsInTest = order?.status === 'in_test'

  const { data: currentStep, error: stepError } = serviceIsInTest
    ? { data: null, error: null }
    : await supabase
        .from('service_guide_steps')
        .select('*')
        .eq('service_guide_id', order?.service_guide_id ?? '')
        .eq('step_number', currentStepNumber)
        .single()

  const { data: allSteps, error: allStepsError } = await supabase
    .from('service_guide_steps')
    .select('id, step_number, title')
    .eq('service_guide_id', order?.service_guide_id ?? '')
    .order('step_number', { ascending: true })

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Serviceschritt</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24 }}>
        Arbeite die Wartung Schritt für Schritt ab.
      </p>

      {(orderError || stepError || allStepsError) && (
        <pre style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, stepError, allStepsError },
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

      {serviceIsInTest ? (
        <section
          className="card"
          style={{
            marginBottom: 24,
            background: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Serviceschritte abgeschlossen</h2>
          <p>
            Alle Serviceschritte wurden dokumentiert. Der Auftrag ist bereit für
            den Abschlusstest.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <Link
              href={`/service-orders/${serviceOrderId}/test`}
              className="button-primary"
            >
              Abschlusstest starten
            </Link>

            <Link href="/" className="button-secondary">
              Zur Startseite
            </Link>

            <Link href="/services" className="button-secondary">
              Zur Serviceübersicht
            </Link>
          </div>
        </section>
      ) : currentStep ? (
        <section className="card" style={{ marginBottom: 24 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Schritt {currentStep.step_number}
          </div>

          <h2 style={{ marginTop: 0 }}>{currentStep.title}</h2>

          <p style={{ lineHeight: 1.6 }}>{currentStep.instruction}</p>

          {currentStep.hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Hinweis:</strong>
              <div className="muted">{currentStep.hint}</div>
            </div>
          )}

          {currentStep.spare_parts_hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Benötigte Ersatzteile:</strong>
              <div className="muted">{currentStep.spare_parts_hint}</div>
            </div>
          )}

          <form
            action={`/service-orders/${serviceOrderId}/steps/complete`}
            method="get"
            style={{ marginTop: 24, display: 'grid', gap: 16 }}
          >
            <div>
              <label
                htmlFor="result"
                style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}
              >
                Ergebnis
              </label>
              <select
                id="result"
                name="result"
                defaultValue="ok"
                style={{ width: '100%', maxWidth: 360 }}
              >
                <option value="ok">OK</option>
                <option value="complication">Komplikation</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="note"
                style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}
              >
                Notiz
              </label>
              <textarea
                id="note"
                name="note"
                rows={5}
                placeholder="Optional: Bemerkungen zu diesem Schritt"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <button type="submit" className="button-primary">
                Schritt abschließen
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Keine weiteren Serviceschritte</h2>
          <p>Der Service ist bereit für den Test.</p>

          <Link
            href={`/service-orders/${serviceOrderId}/test`}
            className="button-primary"
          >
            Abschlusstest starten
          </Link>
        </section>
      )}

      {allSteps && allSteps.length > 0 && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Alle Serviceschritte</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allSteps.map((step) => (
              <li
                key={step.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  background:
                    step.step_number === currentStepNumber && !serviceIsInTest
                      ? 'var(--panel-soft)'
                      : 'transparent',
                }}
              >
                <strong>Schritt {step.step_number}:</strong> {step.title}
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
