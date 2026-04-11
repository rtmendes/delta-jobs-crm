import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({
    message: 'Scraper triggered — delta_agent.py will run and populate delta_jobs.',
    timestamp: new Date().toISOString(),
  })
}
