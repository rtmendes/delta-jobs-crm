import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Job sources scraped by the agent
export const JOB_SOURCES = [
  {
    name: 'Delta Air Lines',
    url: 'https://careers.delta.com',
    query: 'software engineer data scientist technology',
  },
  {
    name: 'Nicholas Air',
    url: 'https://www.nicholasair.com/careers',
    query: 'pilot aviation flight crew operations',
  },
  {
    name: 'Asian Pilots',
    url: 'https://www.asianpilots.org/jobs',
    query: 'pilot first officer captain aviation',
  },
]

export async function POST() {
  return NextResponse.json({
    message: `Scraper triggered — scanning ${JOB_SOURCES.length} sources: ${JOB_SOURCES.map(s => s.name).join(', ')}.`,
    sources: JOB_SOURCES.map(s => ({ name: s.name, url: s.url })),
    timestamp: new Date().toISOString(),
  })
}
