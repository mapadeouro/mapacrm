import { NextResponse }          from 'next/server'
import { getLeadsComTarefas }    from '@/lib/pipeline'

export async function GET() {
  const leads = await getLeadsComTarefas()
  return NextResponse.json({ leads })
}
