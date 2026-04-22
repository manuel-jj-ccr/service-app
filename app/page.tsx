import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data: customers } = await supabase
    .from('customers')
    .select('*')

  return (
    <main style={{ padding: 20 }}>
      <h1>Service App</h1>

      <h2>Kunden</h2>

      <ul>
        {customers?.map((c) => (
          <li key={c.id}>
            {c.name} – {c.city}
          </li>
        ))}
      </ul>
    </main>
  )
}
