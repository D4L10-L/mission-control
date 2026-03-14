/**
 * Search Worker - Finds contract opportunities from various sources
 * Runs via Vercel Cron
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')

if (!Object.keys(serviceAccount).length) {
  console.log('Firebase credentials not configured - running in demo mode')
}

let db = null
try {
  if (Object.keys(serviceAccount).length) {
    initializeApp({ credential: cert(serviceAccount) })
    db = getFirestore()
  }
} catch (e) {
  console.log('Firebase init error:', e.message)
}

/**
 * Generate hash for deduplication
 */
function generateHash(data) {
  const str = `${data.source}|${data.title}|${data.organization}|${data.dueDate || ''}|${data.url || ''}`
  return crypto.createHash('md5').update(str).digest('hex')
}

/**
 * SAM.gov search (using public API)
 */
async function searchSamGov() {
  const opportunities = []
  
  try {
    // SAM.gov API for active opportunities
    const response = await fetch(
      'https://api.sam.gov/v1/opportunities?api_key=' + process.env.SAM_GOV_API_KEY + 
      '&limit=20&postedDate=[2026-01-01,2026-12-31]&status=active&naicsCode=238210',
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.opportunities) {
        for (const opp of data.opportunities) {
          opportunities.push({
            source: 'sam_gov',
            sourceId: opp.noticeId || opp.naicsCode,
            title: opp.title || 'Network Infrastructure Project',
            organization: opp.agencyName || 'Government Agency',
            location: opp.city || 'Tennessee',
            postedAt: opp.postedDate || new Date().toISOString(),
            dueAt: opp.responseDeadLine || null,
            url: `https://sam.gov/opp/${opp.noticeId}/view`,
            summary: opp.description || '',
            estimatedValue: opp.estimatedValue || null,
            tags: ['government', 'low-voltage', 'networking', 'cabling'],
            raw: opp
          })
        }
      }
    }
  } catch (e) {
    console.log('SAM.gov search error:', e.message)
  }
  
  return opportunities
}

/**
 * Web search for commercial/local opportunities
 */
async function searchWeb() {
  const opportunities = []
  const queries = [
    'network infrastructure RFP Tennessee 2026',
    'low voltage cabling bid Tennessee',
    'network installation contractor wanted',
    'WiFi deployment project school district',
    'fiber optic installation bid government'
  ]
  
  // Use Brave Search if available, otherwise skip
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  
  if (!apiKey) {
    console.log('No Brave Search API key configured')
    return opportunities
  }
  
  for (const query of queries.slice(0, 3)) { // Limit queries
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
        { headers: { 'X-Subscription-Token': apiKey } }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.web?.results) {
          for (const result of data.web.results) {
            // Filter for relevant results
            if (result.url && !result.url.includes('sam.gov') && 
                (result.url.includes('gov') || result.url.includes('edu') ||
                 result.url.includes('rfp') || result.url.includes('bid'))) {
              opportunities.push({
                source: 'web_search',
                sourceId: null,
                title: result.title?.slice(0, 200) || 'Untitled Opportunity',
                organization: result.domain || 'Unknown Organization',
                location: extractLocation(result.title + ' ' + result.description),
                postedAt: new Date().toISOString(),
                dueAt: null,
                url: result.url,
                summary: result.description || '',
                estimatedValue: null,
                tags: detectTags(result.title + ' ' + result.description),
                raw: { searchQuery: query }
              })
            }
          }
        }
      }
    } catch (e) {
      console.log('Web search error:', e.message)
    }
  }
  
  return opportunities
}

/**
 * Extract location from text
 */
function extractLocation(text) {
  const tennesseeMatch = text.match(/Tennessee|TN|Knoxville|Nashville|Memphis|Chattanooga|Clarksville|Murfreesboro|Johnson City|Sevierville/gi)
  if (tennesseeMatch) return tennesseeMatch[0]
  return 'Tennessee'
}

/**
 * Detect relevant tags from text
 */
function detectTags(text) {
  const tags = []
  const lower = text.toLowerCase()
  
  if (lower.includes('cable') || lower.includes('cabling') || lower.includes('fiber')) tags.push('cabling')
  if (lower.includes('network') || lower.includes('wifi') || lower.includes('wireless') || lower.includes('ap') || lower.includes('access point')) tags.push('networking')
  if (lower.includes('camera') || lower.includes('security') || lower.includes('camera')) tags.push('security')
  if (lower.includes('low voltage') || lower.includes('low-voltage')) tags.push('low-voltage')
  if (lower.includes('government') || lower.includes('gov') || lower.includes('school') || lower.includes('district')) tags.push('government')
  if (lower.includes('pilot') || lower.includes('truck stop') || lower.includes('travel center')) tags.push('hospitality')
  
  return tags.length ? tags : ['general']
}

/**
 * Score opportunities based on relevance
 */
function scoreOpportunity(opp) {
  let score = 0.5 // Base score
  
  // Source-based scoring
  if (opp.source === 'sam_gov') score += 0.2
  if (opp.source === 'web_search') score += 0.1
  
  // Tag-based scoring
  const relevantTags = ['low-voltage', 'networking', 'cabling', 'security']
  const hasRelevantTag = opp.tags?.some(t => relevantTags.includes(t))
  if (hasRelevantTag) score += 0.15
  
  // Location - Tennessee focus
  if (opp.location?.toLowerCase().includes('tennessee') || 
      opp.location?.toLowerCase().includes('knoxville') ||
      opp.location?.toLowerCase().includes('sevierville')) {
    score += 0.1
  }
  
  // Government sources get a boost
  if (opp.organization?.toLowerCase().includes('school') ||
      opp.organization?.toLowerCase().includes('county') ||
      opp.organization?.toLowerCase().includes('city') ||
      opp.organization?.toLowerCase().includes('department')) {
    score += 0.1
  }
  
  return Math.min(score, 1.0)
}

/**
 * Main search function
 */
export async function runSearchWorker() {
  console.log('🔍 Starting search worker...')
  
  const allOpportunities = []
  
  // Run searches
  console.log('Searching SAM.gov...')
  const samOpps = await searchSamGov()
  allOpportunities.push(...samOpps)
  console.log(`Found ${samOpps.length} from SAM.gov`)
  
  console.log('Searching web...')
  const webOpps = await searchWeb()
  allOpportunities.push(...webOpps)
  console.log(`Found ${webOpps.length} from web search`)
  
  // Process and store
  if (allOpportunities.length > 0 && db) {
    const batch = db.batch()
    const opportunitiesRef = db.collection('opportunities')
    const rawRef = db.collection('opportunities_raw')
    const runsRef = db.collection('automation_runs')
    
    let rawWritten = 0
    let cleanWritten = 0
    
    for (const opp of allOpportunities) {
      const hash = generateHash(opp)
      opp.hash = hash
      opp.scrapedAt = new Date().toISOString()
      opp.status = 'new'
      
      // Write to raw collection
      const rawDoc = rawRef.doc(hash)
      batch.set(rawDoc, { ...opp, createdAt: new Date() }, { merge: true })
      rawWritten++
      
      // Check for duplicates in clean collection
      const existing = await opportunitiesRef.where('hash', '==', hash).limit(1).get()
      
      if (existing.empty) {
        // Score and add to clean collection
        opp.confidence = scoreOpportunity(opp)
        opp.relevanceScore = opp.confidence * 100
        
        // Only add high-confidence or government opportunities
        if (opp.confidence >= 0.6 || opp.source === 'sam_gov') {
          const cleanDoc = opportunitiesRef.doc(hash)
          batch.set(cleanDoc, { 
            ...opp, 
            confidence: opp.confidence,
            relevanceScore: Math.round(opp.confidence * 100),
            status: 'discovered',
            discoveredAt: new Date()
          })
          cleanWritten++
        }
      }
    }
    
    // Log the run
    const runRef = runsRef.doc()
    batch.set(runRef, {
      type: 'search',
      timestamp: new Date(),
      rawCount: rawWritten,
      cleanCount: cleanWritten,
      sources: ['sam_gov', 'web_search'],
      status: 'completed'
    })
    
    await batch.commit()
    console.log(`✅ Search complete: ${rawWritten} raw, ${cleanWritten} clean`)
    
    return { raw: rawWritten, clean: cleanWritten }
  }
  
  // Demo mode - return mock data
  if (!db) {
    console.log('Demo mode - would have processed', allOpportunities.length, 'opportunities')
    return { raw: allOpportunities.length, clean: 0, demo: true }
  }
  
  return { raw: 0, clean: 0 }
}

export default runSearchWorker
