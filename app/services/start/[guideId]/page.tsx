export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function StartServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ guideId: string }>
  searchParams: Promise<{ customerId?: string; deviceId?: string }>
}) {
  const { guideId } = await params
  const { customerId, deviceId } = await searchParams

  const { data: guide } = await supabase
    .from('service_guides')
    .select('*')
    .eq('id', guideId)
    .single()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId ?? '')
    .single()

  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId ?? '')
    .single()

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service starten</h1>

      {guide && (
        <div style={{ marginBottom: 20 }}>
          <div>
            <strong>Service:</strong> {guide.name}
          </div>
          <div>Typ: {guide.service_type}</div>
          <div>Version: {guide.version}</div>
        </div>
      )}

      {customer && (
        <div style={{ marginBottom: 12 }}>
          <strong>Kunde:</strong> {customer.name}
        </div>
      )}

      {device && (
        <div style={{ marginBottom: 20 }}>
          <strong>Gerät:</strong> {device.manufacturer} {device.model}
          <br />
          <strong>SN:</strong> {device.serial_number}
        </div>
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fafafa',
        }}
      >
        <p>Hier starten wir gleich den echten Serviceauftrag.</p>
      </div>
    </main>
  )
}
