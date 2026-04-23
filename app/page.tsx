import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Service App</h1>
      <p>Neu und sauber gestartet.</p>

      <Link href="/test">Zur Testseite</Link>
    </main>
  )
}
