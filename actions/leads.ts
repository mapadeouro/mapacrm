'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Etapa, LeadFinder } from '@/lib/types'

// ─── Adicionar lead do Finder ao pipeline ─────────────────────────

interface AdicionarLeadParams {
  lead:          LeadFinder
  etapa:         Etapa
  criarFollowup: boolean   // true → cria tarefa D+3 automaticamente
}

export async function adicionarLead({
  lead,
  etapa,
  criarFollowup,
}: AdicionarLeadParams): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Verificar duplicata por place_id
  const { data: existente } = await supabase
    .from('leads')
    .select('id')
    .eq('user_id', user.id)
    .eq('google_place_id', lead.google_place_id)
    .maybeSingle()

  if (existente) return { id: existente.id }

  // Inserir lead
  const { data: novoLead, error: errLead } = await supabase
    .from('leads')
    .insert({
      user_id:          user.id,
      nome_empresa:     lead.nome_empresa,
      telefone:         lead.telefone,
      site:             lead.site,
      endereco:         lead.endereco,
      cidade:           lead.cidade,
      pais:             lead.pais,
      nicho:            null,
      google_place_id:  lead.google_place_id,
      google_maps_url:  lead.google_maps_url,
      nota_media:       lead.nota_media,
      qtd_avaliacoes:   lead.qtd_avaliacoes,
      tem_fotos:        lead.tem_fotos,
      tem_horario:      lead.tem_horario,
      responde_reviews: lead.responde_reviews,
      score:            lead.score,
      etapa,
      // Datas automáticas por etapa
      data_contato:     etapa === 'mensagem_enviada' ? new Date().toISOString() : null,
      data_ultima_acao: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (errLead || !novoLead) {
    console.error('[adicionarLead]', errLead)
    return { error: 'Erro ao salvar lead' }
  }

  // Follow-up automático D+3 se solicitado
  if (criarFollowup) {
    const dataFollowup = new Date()
    dataFollowup.setDate(dataFollowup.getDate() + 3)
    const dataISO = dataFollowup.toISOString().split('T')[0]  // 'YYYY-MM-DD'

    await supabase.from('tarefas').insert({
      user_id:       user.id,
      lead_id:       novoLead.id,
      descricao:     'Follow-up — verificar resposta',
      data_prevista: dataISO,
      concluida:     false,
    })
  }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')

  return { id: novoLead.id }
}

// ─── Mover etapa ──────────────────────────────────────────────────

export async function moverEtapa(
  leadId: string,
  novaEtapa: Etapa
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const update: Record<string, unknown> = {
    etapa:            novaEtapa,
    data_ultima_acao: new Date().toISOString(),
  }

  // Datas automáticas por etapa
  if (novaEtapa === 'mensagem_enviada') update.data_contato  = new Date().toISOString()
  if (novaEtapa === 'proposta_enviada') update.data_proposta = new Date().toISOString()

  const { error } = await supabase
    .from('leads')
    .update(update)
    .eq('id', leadId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao mover etapa' }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ─── Salvar observações ───────────────────────────────────────────

export async function salvarObservacoes(
  leadId: string,
  observacoes: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('leads')
    .update({ observacoes })
    .eq('id', leadId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao salvar' }
  revalidatePath('/pipeline')
  return { ok: true }
}
