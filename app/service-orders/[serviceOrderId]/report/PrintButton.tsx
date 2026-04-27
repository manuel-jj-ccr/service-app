'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        border: '1px solid #111',
        background: '#111',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      Drucken / als PDF speichern
    </button>
  )
}
