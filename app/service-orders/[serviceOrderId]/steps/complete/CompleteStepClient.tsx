'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export default function CompleteStepClient() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const serviceOrderId = params.serviceOrderId as string
  const result = searchParams.get('result')
  const note = searchParams.get('note')

  const [message, setMessage] = useState('Schritt wird abgeschlossen ...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeStep() {
      try {
        const response = await fetch(
          `/api/service-orders/${serviceOrderId}/complete-step`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              result,
              note,
            }),
          }
        )

        const resultData = await response.json()

        if (!response.ok) {
          throw new Error(
            resultData?.error || 'Schritt konnte nicht abgeschlossen werden.'
          )
        }

        setMessage('Schritt erfolgreich abgeschlossen. Weiterleitung ...')
        router.push(`/service-orders/${serviceOrderId}/steps`)
      } catch (err: any) {
        setError(err.message || 'Unbekannter Fehler')
      }
    }

    if (serviceOrderId) {
      completeStep()
    }
  }, [serviceOrderId, result, note, router])

  return (
    <>
      <h1>Schritt abschließen</h1>

      {error ? (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>
      ) : (
        <p>{message}</p>
      )}
    </>
  )
}
