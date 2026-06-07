import { getAlertas, getTarefasHoje } from '@/lib/pipeline'
import { createClient } from '@/lib/supabase/server'
import MetricasFunil   from '@/components/dashboard/MetricasFunil'
import AlertPanel      from '@/components/dashboard/AlertPanel'
import TarefasHoje     from '@/components/dashboard/TarefasHoje'
import type { MetricasFunil as TMetricas } from '@/lib/types'
import type { Etapa } from '@/lib/types'

async function getMetricas(userId: string): Promise<TMetricas> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('etapa')
    .eq('user_id', userId)

  const leads = data ?? []

  const contar = (etapas: Etapa[]) =>
    leads.filter(l => etapas.includes(l.etapa as Etapa)).length

  return {
    leads_total: leads.length,
    mensagens:   contar(['mensagem_enviada','respondeu','auditoria_enviada',
                         'reuniao_marcada','proposta_enviada','fechado']),
    respostas:   contar(['respondeu','auditoria_enviada',
                         'reuniao_marcada','proposta_enviada','fechado']),
    propostas:   contar(['proposta_enviada','fechado']),
    fechados:    contar(['fechado']),
  }
}

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataHoje(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [metricas, alertas, tarefas] = await Promise.all([
    getMetricas(user.id),
    getAlertas(),
    getTarefasHoje(),
  ])

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">

      {/* Saudação */}
      <div>
        <h1 className="text-xl font-mono font-bold text-white tracking-wide uppercase">
          {saudacao()}
        </h1>
        <p className="text-gray-500 text-xs mt-0.5 capitalize">{dataHoje()}</p>
      </div>

      {/* Funil */}
      <MetricasFunil metricas={metricas} />

      {/* Alertas */}
      {alertas.length > 0 && <AlertPanel alertas={alertas} />}

      {/* Tarefas do dia */}
      <TarefasHoje tarefas={tarefas} />

    </div>
  )
}
