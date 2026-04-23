import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service App</h1>
      <p>Neu und sauber gestartet.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        <Link href="/test">Zur Testseite</Link>
        <Link href="/customers">Zu den Kunden</Link>
      </div>
    </main>
  )
}
