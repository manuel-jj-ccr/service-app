import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: Request,
  context: { params: Promise<{ serviceOrderId: string }> }
) {
  try {
    const { serviceOrderId } = await context.params

    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', serviceOrderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Serviceauftrag nicht gefunden.', details: orderError },
        { status: 404 }
      )
    }

    const currentStepNumber = order.current_service_step_number ?? 1

    const { data: step, error: stepError } = await supabase
      .from('service_guide_steps')
      .select('*')
      .eq('service_guide_id', order.service_guide_id)
      .eq('step_number', currentStepNumber)
      .single()

    if (stepError || !step) {
      return NextResponse.json(
        { error: 'Aktueller Serviceschritt nicht gefunden.', details: stepError },
        { status: 404 }
      )
    }

    const { error: insertError } = await supabase
      .from('service_step_results')
      .insert({
        service_order_id: order.id,
        service_guide_step_id: step.id,
        step_number: step.step_number,
        title_snapshot: step.title,
        instruction_snapshot: step.instruction,
        result: 'ok',
        note: null,
        photo_url: null,
        processed_at: new Date().toISOString(),
        processed_by: 'Oliver',
      })

    if (insertError) {
      return NextResponse.json(
        { error: 'Schrittergebnis konnte nicht gespeichert werden.', details: insertError },
        { status: 500 }
      )
    }

    const nextStepNumber = currentStepNumber + 1

    const { data: nextStep } = await supabase
      .from('service_guide_steps')
      .select('id')
      .eq('service_guide_id', order.service_guide_id)
      .eq('step_number', nextStepNumber)
      .single()

    const updatePayload = nextStep
      ? {
          current_service_step_number: nextStepNumber,
        }
      : {
          status: 'in_test',
        }

    const { error: updateError } = await supabase
      .from('service_orders')
      .update(updatePayload)
      .eq('id', order.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Serviceauftrag konnte nicht aktualisiert werden.', details: updateError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      serviceOrderId: order.id,
      hasNextStep: !!nextStep,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Abschließen des Schritts.', details: error },
      { status: 500 }
    )
  }
}
