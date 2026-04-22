'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function StartServiceSubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const guideId = searchParams.get('guideId')
  const deviceId = searchParams.get('deviceId')
  const customerId = searchParams.get('customerId')

  const [message, setMessage] = useState('Serviceauftrag wird erstellt ...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function createOrder() {
      try {
        const response = await fetch('/api/service-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guideId,
            deviceId,
            customerId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || 'Serviceauftrag konnte nicht erstellt werden.')
        }

        setMessage('Serviceauftrag erfolgreich erstellt. Weiterleitung ...')
        router.push(`/service-orders/${result.serviceOrderId}`)
      } catch (err: any) {
        setError(err.message || 'Unbekannter Fehler')
      }
    }

    if (guideId && deviceId && customerId) {
      createOrder()
    } else {
      setError('Fehlende Parameter.')
    }
  }, [guideId, deviceId, customerId, router])

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Serviceauftrag erstellen</h1>
      {error ? (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>
      ) : (
        <p>{message}</p>
      )}
    </main>
  )
}
