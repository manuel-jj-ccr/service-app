import Link from 'next/link'

export default function Home() {
  const buttonStyle = {
    display: 'block',
    padding: '18px 20px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#111',
    background: '#fff',
    fontWeight: 600,
    fontSize: '18px',
  } as const

  return (
    <main
      style={{
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Service App</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Willkommen. Wähle einen Bereich aus.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <Link href="/services/new" style={buttonStyle}>
          Neuer Service
        </Link>

        <Link href="/services" style={buttonStyle}>
          Laufende Services
        </Link>

        <Link href="/customers" style={buttonStyle}>
          Kunden verwalten
        </Link>

        <Link href="/service-guides" style={buttonStyle}>
          Service-Anleitungen verwalten
        </Link>
      </div>
    </main>
  )
}
