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
  searchParams: Promise<{ device?: string; customer?: string }>
}) {
  const { guideId } = await params
  const { device, customer } = await searchParams

  const { data: guide, error: guideError } = await supabase
    .from('service_guides')
    .select('*')
    .eq('id', guideId)
    .single()

  const { data: deviceData, error: deviceError } = await supabase
    .from('devices')
    .select('*')
    .eq('id', device ?? '')
    .single()

  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customer ?? '')
    .single()

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: 700 }}>
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

      {customerData && (
        <div style={{ marginBottom: 12 }}>
          <strong>Kunde:</strong> {customerData.name}
        </div>
      )}

      {deviceData && (
        <div style={{ marginBottom: 20 }}>
          <strong>Gerät:</strong> {deviceData.manufacturer} {deviceData.model}
          <br />
          <strong>Seriennummer:</strong> {deviceData.serial_number}
        </div>
      )}

      {(guideError || deviceError || customerError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { guideError, deviceError, customerError },
            null,
            2
          )}
        </pre>
      )}

      <form action="/services/start/submit" method="get">
        <input type="hidden" name="guideId" value={guideId} />
        <input type="hidden" name="deviceId" value={device ?? ''} />
        <input type="hidden" name="customerId" value={customer ?? ''} />

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
}      )}

      {(guideError || deviceError || customerError) && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            { guideError, deviceError, customerError },
            null,
            2
          )}
        </pre>
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fafafa',
        }}
      >
        <p>Im nächsten Schritt erzeugen wir hier den echten Serviceauftrag.</p>
        <p>
          Danach springt die App direkt in den ersten Serviceschritt.
        </p>
      </div>
    </main>
  )
}
