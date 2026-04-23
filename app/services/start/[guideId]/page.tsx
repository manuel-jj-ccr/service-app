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

  const { data: guide, error: guideError } = await supabase
    .from('service_guides')
    .select('*')
    .eq('id', guideId)
    .single()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId ?? '')
    .single()

  const { data: device, error: deviceError } = await supabase
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

      {(guideError || customerError || deviceError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { guideError, customerError, deviceError },
            null,
            2
          )}
        </pre>
      )}

      <form action="/service-orders/create" method="get">
        <input type="hidden" name="guideId" value={guideId} />
        <input type="hidden" name="customerId" value={customerId ?? ''} />
        <input type="hidden" name="deviceId" value={deviceId ?? ''} />

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
          Serviceauftrag starten
        </button>
      </form>
    </main>
  )
}
