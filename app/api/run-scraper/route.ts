import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ─── Relevance Criteria ──────────────────────────────────────────────────────
// All jobs must pass these filters before being added to the CRM.
export const RELEVANCE_CRITERIA = {
  locationRequirement: 'United States only — remote OR NYC metro (LGA / Manhattan / Queens)',
  excludeRegions: ['Asia', 'Europe', 'Middle East', 'Africa', 'South America', 'Canada', 'Australia'],
  scoreWeights: {
    deltaPathAlignment: 35,   // Directly builds hours/seniority toward Delta mainline
    locationFit: 25,          // Remote preferred; NYC metro (LGA/Manhattan) if in-person
    pilotSkillsBuilt: 20,     // Adds turbine time, type ratings, ATP hours, or aviation knowledge
    orgAlignment: 10,         // OBAP / WAI / AOPA member or conference sponsor
    compensation: 10,         // Market-rate US comp
  },
  minimumScore: 55,           // Drop anything below this — only high-signal roles
}

// ─── Curated Job Sources ─────────────────────────────────────────────────────
// Tier 1  — Direct Delta pipeline (highest priority)
// Tier 2  — NYC/LGA + builds flight hours
// Tier 3  — OBAP/WAI/AOPA aligned regionals & private aviation
// Tier 4  — Aviation-adjacent, remote-friendly, builds pilot knowledge
export const JOB_SOURCES = [
  // ── TIER 1: Delta Direct Pipeline ────────────────────────────────────────
  {
    tier: 1,
    name: 'Delta Air Lines',
    url: 'https://careers.delta.com',
    jobsUrl: 'https://careers.delta.com/search/?q=&sortColumn=referencedate&sortDirection=desc',
    query: 'pilot first officer captain technology operations data',
    notes: 'Ultimate target. Track all pilot and tech roles.',
    location: 'Atlanta GA (hub) + remote tech roles',
    obap: true, wai: true, aopa: false,
  },
  {
    tier: 1,
    name: 'Endeavor Air',
    url: 'https://www.endeavorair.com/careers',
    jobsUrl: 'https://www.endeavorair.com/content/endeavor-air/en_us/careers/pilots.html',
    query: 'first officer captain CRJ pilot',
    notes: 'ONLY regional carrier with contractual guaranteed path to Delta mainline via CAP. LGA/JFK base. $105/hr FO. ~4.5 yrs to Delta. Apply ASAP.',
    location: 'LGA + JFK base — ideal',
    obap: true, wai: true, aopa: false,
  },
  {
    tier: 1,
    name: 'SkyWest Airlines',
    url: 'https://www.skywest.com/careers',
    jobsUrl: 'https://www.skywest.com/fly-skywest/skywest-careers/',
    query: 'first officer captain pilot Delta Connection',
    notes: 'Largest US regional, Delta Connection carrier. Strong OBAP presence. Feeds Delta mainline. Fast upgrade to Captain.',
    location: 'Various US hubs',
    obap: true, wai: true, aopa: false,
  },

  // ── TIER 2: NYC/LGA + Flight Hours ───────────────────────────────────────
  {
    tier: 2,
    name: 'JetBlue',
    url: 'https://careers.jetblue.com',
    jobsUrl: 'https://careers.jetblue.com/search/?q=&sortColumn=referencedate&sortDirection=desc',
    query: 'pilot first officer captain technology remote operations LGA',
    notes: 'HQ Long Island City NYC. 34+ jobs at LGA. WAI conference sponsor. Remote tech roles available. OBAP/WAI aligned.',
    location: 'NYC HQ / LGA hub — perfect',
    obap: true, wai: true, aopa: true,
  },
  {
    tier: 2,
    name: 'Wheels Up',
    url: 'https://wheelsup.com/careers-home',
    jobsUrl: 'https://careers-wheelsup.icims.com/jobs/search',
    query: 'pilot operations NYC remote technology',
    notes: 'NYC-headquartered. Strategic Delta partnership (Delta owns stake). Part 135 builds turbine/PIC time. Hybrid NYC roles $94–115k. Delta "feeder" relationship.',
    location: 'NYC HQ — hybrid 3 days/week',
    obap: false, wai: false, aopa: true,
  },
  {
    tier: 2,
    name: 'Blade Air Mobility',
    url: 'https://www.blade.com/p/careers',
    jobsUrl: 'https://www.blade.com/p/careers',
    query: 'pilot operations aviation NYC helicopter eVTOL',
    notes: 'NYC HQ. Urban air mobility: helicopters, eVTOL, organ transport. Builds urban aviation ops experience. Remote roles in ops/tech. First-mover in eVTOL space.',
    location: 'NYC HQ — remote ops roles available',
    obap: false, wai: false, aopa: false,
  },

  // ── TIER 3: OBAP/WAI/AOPA Regionals & Private Aviation ───────────────────
  {
    tier: 3,
    name: 'Nicholas Air',
    url: 'https://www.nicholasair.com/careers',
    jobsUrl: 'https://www.nicholasair.com/careers',
    query: 'pilot first officer captain citation PC-12',
    notes: 'Top-rated Part 135. Citation X + Challenger 350 + PC-12. Builds turbine PIC time fast. 7/7 rotation.',
    location: 'Memphis TN / Dallas TX hubs',
    obap: false, wai: false, aopa: true,
  },
  {
    tier: 3,
    name: 'NetJets',
    url: 'https://careers.netjets.com',
    jobsUrl: 'https://careers.netjets.com/en-US/search',
    query: 'pilot first officer captain fractional citation falcon',
    notes: 'Largest fractional aviation company. Fastest path to heavy jet type ratings. Builds turbine PIC hours quickly. AOPA partner.',
    location: 'Columbus OH HQ — routes nationwide',
    obap: false, wai: true, aopa: true,
  },
  {
    tier: 3,
    name: 'PSA Airlines',
    url: 'https://www.psaairlines.com/careers',
    jobsUrl: 'https://www.psaairlines.com/careers/pilot-careers',
    query: 'first officer captain CRJ pilot American Eagle',
    notes: 'OBAP 2026 conference sponsor. American Eagle carrier. Regional flying builds hours. Potential bridge to network majors.',
    location: 'Charlotte NC hub + various',
    obap: true, wai: false, aopa: false,
  },

  // ── TIER 4: Aviation-Adjacent, Remote-First, Builds Knowledge ────────────
  {
    tier: 4,
    name: 'FlightAware',
    url: 'https://www.flightaware.com/about/careers',
    jobsUrl: 'https://www.flightaware.com/about/careers',
    query: 'data analyst software engineer aviation remote',
    notes: 'RTX (Raytheon) subsidiary. Remote-first distributed team. World\'s largest flight tracking platform. Deep aviation data/systems knowledge — directly transferable to pilot ops.',
    location: '100% remote',
    obap: false, wai: false, aopa: true,
  },
  {
    tier: 4,
    name: 'Jeppesen ForeFlight',
    url: 'https://www.jeppesenforeflight.com/careers',
    jobsUrl: 'https://recruiting2.ultipro.com/FOR1029FREF/JobBoard/64ac66bb-52b9-46df-9a34-49db2308f2fe/',
    query: 'aviation software product data analyst remote',
    notes: 'Boeing subsidiary. Makes the charts and nav tools every pilot uses daily. Hybrid remote. Direct immersion in pilot workflow tools = huge knowledge transfer.',
    location: 'Austin TX HQ — remote/hybrid',
    obap: false, wai: false, aopa: true,
  },
  {
    tier: 4,
    name: 'Port Authority of NY/NJ',
    url: 'https://www.jointheportauthority.com/pages/aviation',
    jobsUrl: 'https://www.jointheportauthority.com/pages/aviation',
    query: 'aviation operations specialist LGA JFK EWR NYC',
    notes: 'Operates LGA, JFK, EWR. Aviation ops and planning roles in NYC. Government benefits + pension. Insider access to LGA/airside ops. NYC-local only.',
    location: 'LGA / JFK / EWR — NYC in-person',
    obap: false, wai: false, aopa: false,
  },
  {
    tier: 4,
    name: 'CACI International',
    url: 'https://careers.caci.com',
    jobsUrl: 'https://careers.caci.com/global/en/search-results',
    query: 'aviation systems analyst remote data intelligence operations',
    notes: 'Defense IT & intelligence. Contracts with FAA, DoD aviation programs, air traffic modernization (NextGen). Many fully remote or DC/NY-area roles. Clearance-eligible work builds serious government aviation credentials.',
    location: 'Remote / DC metro / NY area',
    obap: false, wai: false, aopa: false,
  },
]

export async function POST() {
  const byTier = JOB_SOURCES.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return NextResponse.json({
    message: `Scraper triggered — scanning ${JOB_SOURCES.length} curated US sources across ${Object.keys(byTier).length} tiers.`,
    sources: JOB_SOURCES.map(s => ({
      tier: s.tier,
      name: s.name,
      url: s.jobsUrl,
      location: s.location,
      obap: s.obap,
      wai: s.wai,
      aopa: s.aopa,
    })),
    criteria: RELEVANCE_CRITERIA,
    timestamp: new Date().toISOString(),
  })
}
