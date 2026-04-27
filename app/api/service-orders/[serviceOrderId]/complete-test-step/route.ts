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
    const body = await request.json()

    const measuredValue = body?.measuredValue as string | undefined
    const passedRaw = body?.passed as string | undefined
    const remark = body?.remark as string | undefined

    if (!passedRaw || !['true', 'false'].includes(passedRaw)) {
      return NextResponse.json(
        { error: 'passed muss "true" oder "false" sein.' },
        { status: 400 }
      )
    }

    const passed = passedRaw === 'true'

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

    const currentTestStepNumber = order.current_test_step_number ?? 1

    const { data: testStep, error: testStepError } = await supabase
      .from('test_steps')
      .select('*')
      .eq('service_guide_id', order.service_guide_id)
      .eq('step_number', currentTestStepNumber)
      .single()

    if (testStepError || !testStep) {
      return NextResponse.json(
        { error: 'Aktueller Testschritt nicht gefunden.', details: testStepError },
        { status: 404 }
      )
    }

    // 🔥 UPSERT statt INSERT
    const { error: upsertError } = await supabase
      .from('test_results')
      .upsert(
        {
          service_order_id: order.id,
          test_step_id: testStep.id,
          step_number: testStep.step_number,
          title_snapshot: testStep.title,
          description_snapshot: testStep.description,
          measured_value: measuredValue?.trim() || null,
          unit_snapshot: testStep.unit ?? null,
          passed,
          remark: remark?.trim() || null,
          photo_url: null,
          recorded_at: new Date().toISOString(),
          recorded_by: 'Oliver',
        },
        {
          onConflict: 'service_order_id,step_number',
        }
      )

    if (upsertError) {
      return NextResponse.json(
        { error: 'Testergebnis konnte nicht gespeichert werden.', details: upsertError },
        { status: 500 }
      )
    }

    const nextTestStepNumber = currentTestStepNumber + 1

    const { data: nextTestStep } = await supabase
      .from('test_steps')
      .select('id')
      .eq('service_guide_id', order.service_guide_id)
      .eq('step_number', nextTestStepNumber)
      .single()

    const updatePayload = nextTestStep
      ? {
          current_test_step_number: nextTestStepNumber,
        }
      : {
          status: passed ? 'completed' : 'completed_with_findings',
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
      hasNextTestStep: !!nextTestStep,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Abschließen des Testschritts.', details: error },
      { status: 500 }
    )
  }
}
