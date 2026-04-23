import { Suspense } from 'react'
import CompleteTestStepClient from './CompleteTestStepClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CompleteTestStepPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <Suspense fallback={<p>Testschritt wird abgeschlossen ...</p>}>
        <CompleteTestStepClient />
      </Suspense>
    </main>
  )
}
