import ScoreBadge  from '@/components/shared/ScoreBadge'
import EtapaTag    from './EtapaTag'
import AlertaLead  from './AlertaLead'
import type { Lead } from '@/lib/types'

interface Props {
  lead:      Lead
  onAbrir:   (lead: Lead) => void
}

export default function LeadRow({ lead, onAbrir }: Props) {
  const tarefasPendentes = (lead.tarefas ?? []).filter(t => !t.concluida)

  return (
    <button
      onClick={() => onAbrir(lead)}
      className="
        w-full text-left bg-surface-raised border border-surface-border
        rounded-xl px-4 py-3 flex items-center gap-3
        active:bg-surface-border transition-colors
      "
    >
      {/* Score dot */}
      <ScoreBadge score={lead.score} />

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate leading-tight">
          {lead.nome_empresa}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {lead.cidade && (
            <span className="text-gray-500 text-xs">{lead.cidade}</span>
          )}
          <AlertaLead lead={lead} />
          {tarefasPendentes.length > 0 && (
            <span className="text-xs text-brand">
              {tarefasPendentes.length} tarefa{tarefasPendentes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Seta */}
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-600 shrink-0">
        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
