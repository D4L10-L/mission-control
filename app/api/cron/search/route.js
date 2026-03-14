/**
 * Search Worker API - Finds contract opportunities from various sources
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'

// Initialize Firebase Admin
let db = null
let adminInitialized = false

function initAdmin() {
  if (adminInitialized) return
  
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr)
      if (Object.keys(serviceAccount).length) {
        initializeApp({ credential: cert(serviceAccount) })
        adminInitialized = true
      }
    }
  } catch (e) {
    console.log('Firebase init error:', e.message)
  }
}

function getDb() {
  if (!db) {
    initAdmin()
    if (adminInitialized) {
      db = getFirestore()
    }
  }
  return db
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
  const apiKey = process.env.SAM_GOV_API_KEY
  
  if (!apiKey) {
    console.log('No SAM.gov API key')
    return opportunities
  }
  
  try {
    const response = await fetch(
      `https://api.sam.gov/v1/opportunities?api_key=${apiKey}&limit=20&postedDate=[2026-01-01,2026-12-31]&status=active&naicsCode=238210`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.opportunities) {
        for (const opp of data.opportunities) {
          opportunities.push({
            source: 'sam_gov',
            sourceId: opp.noticeId,
            title: opp.title || 'Network Infrastructure Project',
            organization: opp.agencyName || 'Government Agency',
            location: opp.city || 'Tennessee',
            postedAt: opp.postedDate,
            dueAt: opp.responseDeadLine,
            url: `https://sam.gov/opp/${opp.noticeId}/view`,
            summary: opp.description || '',
            estimatedValue: opp.estimatedValue,
            tags: ['government', 'low-voltage', 'networking', 'cabling']
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
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  
  if (!apiKey) {
    console.log('No Brave Search API key')
    return opportunities
  }
  
  const queries = [
    'network infrastructure RFP Tennessee 2026',
    'low voltage cabling bid Tennessee',
    'WiFi deployment project school district'
  ]
  
  for (const query of queries.slice(0, 2)) {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        { headers: { 'X-Subscription-Token': apiKey } }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.web?.results) {
          for (const result of data.web.results) {
            if (result.url && !result.url.includes('sam.gov')) {
              opportunities.push({
                source: 'web_search',
                sourceId: null,
                title: result.title?.slice(0, 200) || 'Untitled',
                organization: result.domain || 'Unknown',
                location: 'Tennessee',
                postedAt: new Date().toISOString(),
                dueAt: null,
                url: result.url,
                summary: result.description || '',
                estimatedValue: null,
                tags: detectTags(result.title + ' ' + result.description)
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

function detectTags(text) {
  const tags = []
  const lower = text.toLowerCase()
  if (lower.includes('cable')) tags.push('cabling')
  if (lower.includes('network') || lower.includes('wifi')) tags.push('networking')
  if (lower.includes('camera')) tags.push('security')
  if (lower.includes('low voltage')) tags.push('low-voltage')
  if (lower.includes('government') || lower.includes('school')) tags.push('government')
  return tags.length ? tags : ['general']
}

function scoreOpportunity(opp) {
  let score = 0.5
  if (opp.source === 'sam_gov') score += 0.2
  if (opp.source === 'web_search') score += 0.1
  
  const relevantTags = ['low-voltage', 'networking', 'cabling']
  if (opp.tags?.some(t => relevantTags.includes(t))) score += 0.15
  
  if (opp.location?.toLowerCase().includes('tennessee')) score += 0.1
  
  return Math.min(score, 1.0)
}

export async function runSearchWorker() {
  console.log('🔍 Starting search worker...')
  
  const allOpportunities = []
  
  console.log('Searching SAM.gov...')
  allOpportunities.push(...await searchSamGov())
  
  console.log('Searching web...')
  allOpportunities.push(...await searchWeb())
  
  console.log(`Found ${allOpportunities.length} total opportunities`)
  
  const db = getDb()
  
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
      
      // Write to raw
      batch.set(rawRef.doc(hash), { ...opp, createdAt: new Date() }, { merge: true })
      rawWritten++
      
      // Check duplicates
      const existing = await opportunitiesRef.where('hash', '==', hash).limit(1).get()
      
      if (existing.empty) {
        opp.confidence = scoreOpportunity(opp)
        
        if (opp.confidence >= 0.6 || opp.source === 'sam_gov') {
          batch.set(opportunitiesRef.doc(hash), {
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
    
    // Log run
    batch.set(runsRef.doc(), {
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
  
  return { raw: 0, clean: 0 }
}
