# Service App

Sauberes Next.js + Supabase Grundgerüst für deine Service-App.

## Vercel Environment Variables

Setze in Vercel diese Variablen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Hinweis

Für den aktuellen Solo-Start müssen diese Tabellen lesbar/schreibbar sein.
Wenn du es pragmatisch halten willst, kannst du RLS dort vorerst deaktivieren:

```sql
alter table public.customers disable row level security;
alter table public.devices disable row level security;
alter table public.service_guides disable row level security;
alter table public.service_orders disable row level security;
```

## Enthaltene Seiten

- `/`
- `/test`
- `/customers`
- `/services`
- `/service-guides`
- `/services/new`
- `/services/new/[customerId]`
- `/services/new/[customerId]/[deviceId]`
- `/services/confirm/[guideId]`
- `/service-orders/create`
- `/service-orders/[serviceOrderId]`

## API

- `POST /api/service-orders`
