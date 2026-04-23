import { Suspense } from 'react'
import CreateServiceOrderClient from './CreateServiceOrderClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CreateServiceOrderPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <Suspense fallback={<p>Serviceauftrag wird vorbereitet ...</p>}>
        <CreateServiceOrderClient />
      </Suspense>
    </main>
  )
}
