import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, WeddingGuest } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('wedding_guests')
    .select('id, name, attended, transport, groom')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Guest not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(data as WeddingGuest)
}
