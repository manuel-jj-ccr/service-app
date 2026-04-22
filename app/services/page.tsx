import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ServicesPage() {
  const { data: services, error } = await supabase
    .from('service_order_overview')
    .select('*')
    .neq('status', 'completed')
    .order('started_at', { ascending: false })

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Laufende Services</h1>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <ul style={{ padding: 0, listStyle: 'none' }}>
        {services?.map((service) => (
          <li
            key={service.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {service.order_number ?? 'Ohne Auftragsnummer'}
            </div>
            <div>{service.customer_name}</div>
            <div>
              {service.manufacturer} {service.model} – {service.serial_number}
            </div>
            <div>Service: {service.service_type}</div>
            <div>Status: {service.status}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
