import { runSearchWorker } from '../search/route'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const cronSecret = process.env.CRON_SECRET
    const providedSecret = body.secret
    
    if (cronSecret && providedSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    
    console.log('🔄 Manual search triggered')
    
    const result = await runSearchWorker()
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Search error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), { status: 500 })
  }
}
