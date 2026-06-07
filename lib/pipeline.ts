import { createClient } from '@/lib/supabase/server'
import type { Etapa, Lead, Tarefa } from '@/lib/types'

// Etapas visíveis no pipeline (exclui fechado/perdido do fluxo principal)
export const ETAPAS_ATIVAS: Etapa[] = [
  'lead_encontrado',
  'mensagem_enviada',
  'respondeu',
  'auditoria_enviada',
  'reuniao_marcada',
  'proposta_enviada',
]

export const ETAPA_LABEL: Record<Etapa, string> = {
  lead_encontrado:  'Lead encontrado',
  mensagem_enviada: 'Mensagem enviada',
  respondeu:        'Respondeu',
  auditoria_enviada:'Auditoria enviada',
  reuniao_marcada:  'Reunião marcada',
  proposta_enviada: 'Proposta enviada',
  fechado:          'Fechado',
  perdido:          'Perdido',
}

// ─── Buscar todos os leads do usuário com tarefas pendentes ───────

export async function getLeadsComTarefas(): Promise<Lead[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      tarefas (
        id, descricao, data_prevista, concluida, created_at
      )
    `)
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) { console.error('[getLeadsComTarefas]', error); return [] }
  return (data ?? []) as Lead[]
}

// ─── Buscar um lead específico com tarefas ────────────────────────

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('leads')
    .select(`*, tarefas (id, descricao, data_prevista, concluida, created_at)`)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data as Lead | null
}

// ─── Alertas do pipeline ──────────────────────────────────────────

export interface AlertaPipeline {
  tipo:  'sem_resposta' | 'proposta_parada' | 'followup_atrasado'
  label: string
  cor:   'red' | 'yellow' | 'orange'
  leads: Pick<Lead, 'id' | 'nome_empresa' | 'cidade'>[]
}

export async function getAlertas(): Promise<AlertaPipeline[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const alertas: AlertaPipeline[] = []

  // 1. Sem resposta há +3 dias (mensagem enviada sem interação)
  const { data: semResposta } = await supabase
    .from('leads')
    .select('id, nome_empresa, cidade')
    .eq('user_id', user.id)
    .eq('etapa', 'mensagem_enviada')
    .lt('data_ultima_acao', new Date(Date.now() - 3 * 86400000).toISOString())

  if (semResposta?.length) {
    alertas.push({
      tipo:  'sem_resposta',
      label: `${semResposta.length} lead${semResposta.length > 1 ? 's' : ''} sem resposta há +3 dias`,
      cor:   'red',
      leads: semResposta,
    })
  }

  // 2. Proposta sem retorno há +7 dias
  const { data: propostaParada } = await supabase
    .from('leads')
    .select('id, nome_empresa, cidade')
    .eq('user_id', user.id)
    .eq('etapa', 'proposta_enviada')
    .lt('data_proposta', new Date(Date.now() - 7 * 86400000).toISOString())

  if (propostaParada?.length) {
    alertas.push({
      tipo:  'proposta_parada',
      label: `${propostaParada.length} proposta${propostaParada.length > 1 ? 's' : ''} sem retorno há +7 dias`,
      cor:   'yellow',
      leads: propostaParada,
    })
  }

  // 3. Follow-ups atrasados
  const hoje = new Date().toISOString().split('T')[0]
  const { data: atrasados } = await supabase
    .from('tarefas')
    .select('id, lead_id, leads(id, nome_empresa, cidade)')
    .eq('user_id', user.id)
    .eq('concluida', false)
    .lt('data_prevista', hoje)

  if (atrasados?.length) {
    alertas.push({
      tipo:  'followup_atrasado',
      label: `${atrasados.length} follow-up${atrasados.length > 1 ? 's' : ''} atrasado${atrasados.length > 1 ? 's' : ''}`,
      cor:   'orange',
      leads: [],
    })
  }

  return alertas
}

// ─── Tarefas do dia (hoje + atrasadas) ───────────────────────────

export async function getTarefasHoje(): Promise<(Tarefa & { lead: Pick<Lead, 'id' | 'nome_empresa'> })[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const hoje = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('tarefas')
    .select('*, leads(id, nome_empresa)')
    .eq('user_id', user.id)
    .eq('concluida', false)
    .lte('data_prevista', hoje)   // hoje e anteriores
    .order('data_prevista', { ascending: true })

  return (data ?? []) as (Tarefa & { lead: Pick<Lead, 'id' | 'nome_empresa'> })[]
}
