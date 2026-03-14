import { runSearchWorker } from '../../scripts/searchWorker'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    console.log('🔄 Cron job triggered')
    
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
    console.error('Cron error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), { status: 500 })
  }
}
