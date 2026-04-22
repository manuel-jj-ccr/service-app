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

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId)
    .single()

  const { data: guides, error: guidesError } = await supabase
    .from('service_guides')
    .select('*')
    .eq('manufacturer', device?.manufacturer ?? '')
    .eq('model', device?.model ?? '')
    .order('service_type', { ascending: true })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service auswählen</h1>

      {device && (
        <div style={{ marginBottom: 20, color: '#555' }}>
          <div>
            <strong>Gerät:</strong> {device.manufacturer} {device.model}
          </div>
          <div>SN: {device.serial_number}</div>
        </div>
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
        {guides?.map((g) => (
          <li key={g.id} style={{ marginBottom: 12 }}>
            <Link
              href={`/services/start/${g.id}?device=${deviceId}&customer=${customerId}`}
              style={{
                display: 'block',
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 16,
                textDecoration: 'none',
                color: '#111',
              }}
            >
              <div style={{ fontWeight: 700 }}>{g.name}</div>
              <div>Typ: {g.service_type}</div>
              <div>Version: {g.version}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
