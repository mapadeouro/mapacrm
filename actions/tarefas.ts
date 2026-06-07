'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarTarefa(params: {
  leadId:       string
  descricao:    string
  dataPrevista: string  // 'YYYY-MM-DD'
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase.from('tarefas').insert({
    user_id:       user.id,
    lead_id:       params.leadId,
    descricao:     params.descricao,
    data_prevista: params.dataPrevista,
    concluida:     false,
  })

  if (error) return { error: 'Erro ao criar tarefa' }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function concluirTarefa(
  tarefaId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase
    .from('tarefas')
    .update({ concluida: true })
    .eq('id', tarefaId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao concluir tarefa' }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return { ok: true }
}
