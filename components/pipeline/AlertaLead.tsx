import type { Lead } from '@/lib/types'

/** Retorna alerta visível no card se o lead estiver parado */
export function getAlertaLead(lead: Lead): { texto: string; cor: string } | null {
  const agora = Date.now()

  if (lead.etapa === 'mensagem_enviada' && lead.data_ultima_acao) {
    const diff = agora - new Date(lead.data_ultima_acao).getTime()
    const dias = Math.floor(diff / 86400000)
    if (dias >= 3) return {
      texto: `${dias}d sem resposta`,
      cor:   'text-red-400',
    }
  }

  if (lead.etapa === 'proposta_enviada' && lead.data_proposta) {
    const diff = agora - new Date(lead.data_proposta).getTime()
    const dias = Math.floor(diff / 86400000)
    if (dias >= 7) return {
      texto: `proposta há ${dias}d`,
      cor:   'text-amber-400',
    }
  }

  return null
}

export default function AlertaLead({ lead }: { lead: Lead }) {
  const alerta = getAlertaLead(lead)
  if (!alerta) return null

  return (
    <span className={`text-xs font-medium ${alerta.cor} flex items-center gap-1`}>
      <span>⚠️</span> {alerta.texto}
    </span>
  )
}
