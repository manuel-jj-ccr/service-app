export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServiceOrderPage({
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

  return (
    <main style={{ padding: 24 }}>
      <h1>Serviceauftrag</h1>

      {order && (
        <>
          <p><strong>Auftragsnummer:</strong> {order.order_number}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Link href={`/service-orders/${serviceOrderId}/steps`}>
              Serviceschritte
            </Link>

            <Link href={`/service-orders/${serviceOrderId}/test`}>
              Test
            </Link>

            <Link href={`/service-orders/${serviceOrderId}/report`}>
              Servicebericht öffnen
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
