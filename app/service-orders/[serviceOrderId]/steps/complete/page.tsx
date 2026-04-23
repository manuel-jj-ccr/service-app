import { Suspense } from 'react'
import CompleteStepClient from './CompleteStepClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CompleteStepPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <Suspense fallback={<p>Schritt wird abgeschlossen ...</p>}>
        <CompleteStepClient />
      </Suspense>
    </main>
  )
}
