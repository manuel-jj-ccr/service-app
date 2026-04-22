import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, deviceId, guideId } = body

    if (!customerId || !deviceId || !guideId) {
      return NextResponse.json(
        { error: 'customerId, deviceId und guideId sind erforderlich.' },
        { status: 400 }
      )
    }

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden.', details: customerError },
        { status: 404 }
      )
    }

    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single()

    if (deviceError || !device) {
      return NextResponse.json(
        { error: 'Gerät nicht gefunden.', details: deviceError },
        { status: 404 }
      )
    }

    const { data: guide, error: guideError } = await supabase
      .from('service_guides')
      .select('*')
      .eq('id', guideId)
      .single()

    if (guideError || !guide) {
      return NextResponse.json(
        { error: 'Service-Anleitung nicht gefunden.', details: guideError },
        { status: 404 }
      )
    }

    const orderNumber = `SO-${Date.now()}`

    const { data: insertedOrder, error: insertError } = await supabase
      .from('service_orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        device_id: device.id,
        service_guide_id: guide.id,
        serial_number_snapshot: device.serial_number,
        manufacturer_snapshot: device.manufacturer,
        model_snapshot: device.model,
        service_type_snapshot: guide.service_type,
        guide_name_snapshot: guide.name,
        status: 'in_progress',
        current_service_step_number: 1,
        current_test_step_number: 1,
        technician_name: 'Oliver',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError || !insertedOrder) {
      return NextResponse.json(
        { error: 'Serviceauftrag konnte nicht erstellt werden.', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      serviceOrderId: insertedOrder.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unerwarteter Fehler beim Erstellen des Serviceauftrags.',
        details: error,
      },
      { status: 500 }
    )
  }
}
