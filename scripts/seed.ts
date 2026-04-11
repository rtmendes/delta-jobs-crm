import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const jobs = [
  {
    title: 'Senior Software Engineer, Data Platform',
    url: 'https://delta.com/careers/senior-se-data',
    company: 'Delta Air Lines',
    location: 'Atlanta, GA (Hybrid)',
    status: 'new',
    score: 91,
    reasoning: 'Strong match on distributed systems experience. Spark/Kafka experience highly relevant. Leadership background aligns with "senior" expectation. Travel benefits are a personal priority.',
    jd_text: 'Build and maintain high-throughput data pipelines serving 100M+ daily events. Own reliability and performance for mission-critical streaming systems. Mentor junior engineers.',
    notes: '',
    source_query: 'site:delta.com/careers software engineer data',
  },
  {
    title: 'Product Manager, Customer Experience',
    url: 'https://delta.com/careers/pm-cx',
    company: 'Delta Air Lines',
    location: 'Atlanta, GA',
    status: 'applied',
    score: 78,
    reasoning: 'PM background is relevant but no direct airline/travel product experience. Customer experience focus aligns well. Strong on data-driven product decisions.',
    jd_text: 'Own the roadmap for the flagship SkyMiles app. Work cross-functionally with engineering, design, and customer service to deliver best-in-class travel experiences.',
    notes: 'Applied 2024-01-10. Waiting to hear back.',
    source_query: 'site:delta.com/careers product manager',
  },
  {
    title: 'Machine Learning Engineer, Pricing & Revenue',
    url: 'https://delta.com/careers/ml-pricing',
    company: 'Delta Air Lines',
    location: 'Atlanta, GA (Remote-Friendly)',
    status: 'phone_screen',
    score: 85,
    reasoning: 'ML/optimization experience matches perfectly. Python/PyTorch stack identical. Revenue management domain is learnable. High upside role.',
    jd_text: 'Develop and deploy ML models for dynamic airfare pricing. Collaborate with revenue management analysts to build models that maximize yield while improving seat fill rates.',
    notes: 'Phone screen scheduled for Jan 20. Review pricing ML literature beforehand.',
    source_query: 'site:delta.com/careers machine learning',
  },
  {
    title: 'Staff Engineer, Distributed Systems',
    url: 'https://delta.com/careers/staff-distributed',
    company: 'Delta Air Lines',
    location: 'Atlanta, GA',
    status: 'new',
    score: 72,
    reasoning: 'Distributed systems expertise is a good match. Staff-level scope is ambitious. JD emphasizes C++ which is not a primary skill. Worth exploring.',
    jd_text: 'Lead architecture for real-time flight operations systems. Design fault-tolerant, globally distributed systems that ensure 99.999% uptime for critical operations.',
    notes: '',
    source_query: 'site:delta.com/careers staff engineer',
  },
  {
    title: 'iOS Engineer, Digital Products',
    url: 'https://delta.com/careers/ios-engineer',
    company: 'Delta Air Lines',
    location: 'Atlanta, GA',
    status: 'rejected',
    score: 48,
    reasoning: 'iOS/Swift is not a current focus area. The role requires deep UIKit/SwiftUI expertise. Low fit compared to backend/data roles available.',
    jd_text: 'Build and maintain the Delta iOS app used by 40M+ travelers. Work with SwiftUI, UIKit, and CoreData. Focus on performance and accessibility.',
    notes: 'Rejected after application. Not an iOS specialist.',
    source_query: 'site:delta.com/careers ios mobile',
  },
]

async function seed() {
  console.log('Seeding delta_jobs...')
  const { data, error } = await supabase
    .from('delta_jobs')
    .insert(jobs)
    .select()
  if (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
  console.log(`Seeded ${data?.length ?? 0} jobs successfully.`)
}

seed()
