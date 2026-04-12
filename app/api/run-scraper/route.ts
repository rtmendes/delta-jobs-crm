import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Relevance criteria: US-based positions only
export const RELEVANCE_CRITERIA = {
  locationRequirement: 'United States only',
  excludeRegions: ['Asia', 'Europe', 'Middle East', 'Africa', 'South America', 'Canada', 'Australia'],
  scoreWeights: {
    locationMatch: 30,    // Must be US-based to be included
    roleAlignment: 40,    // Title/responsibilities match target profile
    companyStability: 15, // Company size, funding, reputation
    compensation: 15,     // Market-rate or above US comp
  },
  minimumScore: 50,       // Drop anything below this from results
}

// US-based job sources only
export const JOB_SOURCES = [
  {
    name: 'Delta Air Lines',
    url: 'https://careers.delta.com',
    query: 'software engineer data scientist technology operations',
    country: 'US',
  },
  {
    name: 'Nicholas Air',
    url: 'https://www.nicholasair.com/careers',
    query: 'pilot first officer captain flight operations',
    country: 'US',
  },
]

export async function POST() {
  return NextResponse.json({
    message: `Scraper triggered — scanning ${JOB_SOURCES.length} US sources: ${JOB_SOURCES.map(s => s.name).join(', ')}.`,
    sources: JOB_SOURCES.map(s => ({ name: s.name, url: s.url })),
    criteria: RELEVANCE_CRITERIA,
    timestamp: new Date().toISOString(),
  })
}
