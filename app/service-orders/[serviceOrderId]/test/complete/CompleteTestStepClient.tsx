'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export default function CompleteTestStepClient() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const serviceOrderId = params.serviceOrderId as string
  const measuredValue = searchParams.get('measuredValue')
  const passed = searchParams.get('passed')
  const remark = searchParams.get('remark')

  const [message, setMessage] = useState('Testschritt wird abgeschlossen ...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeTestStep() {
      try {
        const response = await fetch(
          `/api/service-orders/${serviceOrderId}/complete-test-step`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              measuredValue,
              passed,
              remark,
            }),
          }
        )

        const resultData = await response.json()

        if (!response.ok) {
          throw new Error(JSON.stringify(resultData, null, 2))
        }

        setMessage('Testschritt erfolgreich abgeschlossen. Weiterleitung ...')
        router.push(`/service-orders/${serviceOrderId}/test`)
      } catch (err: any) {
        setError(err.message || 'Unbekannter Fehler')
      }
    }

    if (serviceOrderId) {
      completeTestStep()
    }
  }, [serviceOrderId, measuredValue, passed, remark, router])

  return (
    <>
      <h1>Testschritt abschließen</h1>

      {error ? (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>
      ) : (
        <p>{message}</p>
      )}
    </>
  )
}
