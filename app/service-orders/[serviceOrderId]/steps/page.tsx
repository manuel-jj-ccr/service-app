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

  const { data: currentStep, error: stepError } = await supabase
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
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 800 }}>
      <h1>Serviceschritt</h1>

      {(orderError || stepError || allStepsError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { orderError, stepError, allStepsError },
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
            <strong>Gerät:</strong> {order.manufacturer_snapshot} {order.model_snapshot}
          </div>
          <div>
            <strong>Service:</strong> {order.guide_name_snapshot}
          </div>
          <div>
            <strong>Status:</strong> {order.status}
          </div>
        </div>
      )}

      {currentStep ? (
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
            Schritt {currentStep.step_number}
          </div>

          <h2 style={{ marginTop: 0 }}>{currentStep.title}</h2>

          <p style={{ lineHeight: 1.5 }}>{currentStep.instruction}</p>

          {currentStep.hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Hinweis:</strong>
              <div>{currentStep.hint}</div>
            </div>
          )}

          {currentStep.spare_parts_hint && (
            <div style={{ marginTop: 16 }}>
              <strong>Benötigte Ersatzteile:</strong>
              <div>{currentStep.spare_parts_hint}</div>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <form
              action={`/service-orders/${serviceOrderId}/steps/complete`}
              method="get"
            >
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
                Schritt abschließen
              </button>
            </form>
          </div>
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
          <h2>Keine weiteren Serviceschritte</h2>
          <p>Der Service ist bereit für den Test.</p>
        </div>
      )}

      {allSteps && allSteps.length > 0 && (
        <div>
          <h3>Alle Schritte</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allSteps.map((step) => (
              <li
                key={step.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  background:
                    step.step_number === currentStepNumber ? '#f5f5f5' : '#fff',
                }}
              >
                <strong>Schritt {step.step_number}:</strong> {step.title}
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
