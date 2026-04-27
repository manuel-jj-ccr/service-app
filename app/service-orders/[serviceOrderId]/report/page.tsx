export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import PrintButton from './PrintButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceReportPage({
  params,
}: {
  params: Promise<{ serviceOrderId: string }>
}) {
  const { serviceOrderId } = await params

  const { data: order } = await supabase
    .from('service_orders')
    .select('*')
    .eq('id', serviceOrderId)
    .single()

  const { data: stepResults } = await supabase
    .from('service_step_results')
    .select('*')
    .eq('service_order_id', serviceOrderId)
    .order('step_number', { ascending: true })

  const { data: testResults } = await supabase
    .from('test_results')
    .select('*')
    .eq('service_order_id', serviceOrderId)
    .order('step_number', { ascending: true })

  return (
    <main
      style={{
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              background: #fff;
            }
          }
        `}
      </style>

      <div
        className="no-print"
        style={{ display: 'flex', gap: 12, marginBottom: 20 }}
      >
        <PrintButton />

        <Link
          href={`/service-orders/${serviceOrderId}`}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #111',
            textDecoration: 'none',
            color: '#111',
            fontWeight: 700,
          }}
        >
          Zurück
        </Link>
      </div>

      <h1>Servicebericht</h1>

      {order && (
        <>
          <h2>Auftragsdaten</h2>
          <p><strong>Auftragsnummer:</strong> {order.order_number}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Gerät:</strong> {order.manufacturer_snapshot} {order.model_snapshot}</p>
          <p><strong>Seriennummer:</strong> {order.serial_number_snapshot}</p>
          <p><strong>Service:</strong> {order.guide_name_snapshot}</p>
        </>
      )}

      <h2 style={{ marginTop: 30 }}>Serviceschritte</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Nr</th>
            <th style={th}>Schritt</th>
            <th style={th}>Ergebnis</th>
            <th style={th}>Notiz</th>
          </tr>
        </thead>
        <tbody>
          {stepResults?.map((s) => (
            <tr key={s.id}>
              <td style={td}>{s.step_number}</td>
              <td style={td}>{s.title_snapshot}</td>
              <td style={td}>{s.result}</td>
              <td style={td}>{s.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 30 }}>Test</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Nr</th>
            <th style={th}>Test</th>
            <th style={th}>Messwert</th>
            <th style={th}>Ergebnis</th>
          </tr>
        </thead>
        <tbody>
          {testResults?.map((t) => (
            <tr key={t.id}>
              <td style={td}>{t.step_number}</td>
              <td style={td}>{t.title_snapshot}</td>
              <td style={td}>{t.measured_value || '-'}</td>
              <td style={td}>{t.passed ? 'OK' : 'Fehler'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 50 }}>
        <div style={{ borderTop: '1px solid #000', width: 200 }} />
        <p>Unterschrift</p>
      </div>
    </main>
  )
}

const th = {
  border: '1px solid #000',
  padding: 8,
  background: '#eee',
}

const td = {
  border: '1px solid #000',
  padding: 8,
}
