export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function SelectServiceGuidePage({
  params,
}: {
  params: Promise<{ customerId: string; deviceId: string }>
}) {
  const { customerId, deviceId } = await params

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name, city')
    .eq('id', customerId)
    .single()

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, manufacturer, model, serial_number')
    .eq('id', deviceId)
    .single()

  const { data: guides, error: guidesError } = await supabase
    .from('service_guides')
    .select('id, name, manufacturer, model, service_type, version')
    .eq('manufacturer', device?.manufacturer ?? '')
    .eq('model', device?.model ?? '')
    .order('service_type', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service auswählen</h1>

      {customer && (
        <div style={{ marginBottom: 12, color: '#555' }}>
          <div>
            <strong>Kunde:</strong> {customer.name}
          </div>
          <div>{customer.city}</div>
        </div>
      )}

      {device && (
        <div style={{ marginBottom: 20, color: '#555' }}>
          <div>
            <strong>Gerät:</strong> {device.manufacturer} {device.model}
          </div>
          <div>SN: {device.serial_number}</div>
        </div>
      )}

      {customerError && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(customerError, null, 2)}
        </pre>
      )}

      {deviceError && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(deviceError, null, 2)}
        </pre>
      )}

      {guidesError && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(guidesError, null, 2)}
        </pre>
      )}

      {!guidesError && guides?.length === 0 && (
        <p>Keine Service-Anleitungen gefunden.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {guides?.map((guide) => (
          <li key={guide.id} style={{ marginBottom: 12 }}>
            <Link
              href={`/services/confirm/${guide.id}?customerId=${customerId}&deviceId=${deviceId}`}
              style={{
                display: 'block',
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 16,
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700 }}>{guide.name}</div>
              <div>Typ: {guide.service_type}</div>
              <div>Version: {guide.version}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
