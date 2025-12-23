import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, WeddingGuest } from '@/lib/supabase'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    )
  }

  let body: { attended: boolean; transport?: 'SELF' | 'SPONSOR' }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { attended, transport } = body

  if (typeof attended !== 'boolean') {
    return NextResponse.json(
      { error: 'attended must be a boolean' },
      { status: 400 }
    )
  }

  let finalTransport: 'SELF' | 'SPONSOR' | null = null

  if (attended) {
    if (!transport || (transport !== 'SELF' && transport !== 'SPONSOR')) {
      return NextResponse.json(
        { error: 'transport must be SELF or SPONSOR when attended is true' },
        { status: 400 }
      )
    }
    finalTransport = transport
  }

  const { data, error } = await supabaseAdmin
    .from('wedding_guests')
    .update({
      attended,
      transport: finalTransport,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, name, attended, transport, groom')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to update guest' },
      { status: 500 }
    )
  }

  return NextResponse.json(data as WeddingGuest)
}
