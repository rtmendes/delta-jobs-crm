import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { JobStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as JobStatus | null
    const minScore = searchParams.get('minScore')
    const search = searchParams.get('search')
    const company = searchParams.get('company')

    let query = supabase
      .from('delta_jobs')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (minScore) query = query.gte('score', parseInt(minScore))
    if (company) query = query.eq('company', company)
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%`
      )
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { data, error } = await supabase
      .from('delta_jobs')
      .insert(body)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
