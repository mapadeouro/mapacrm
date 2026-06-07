import { ETAPA_LABEL } from '@/lib/pipeline'
import type { Etapa } from '@/lib/types'

const COR: Record<Etapa, string> = {
  lead_encontrado:  'bg-gray-500/15 text-gray-400',
  mensagem_enviada: 'bg-blue-500/15 text-blue-400',
  respondeu:        'bg-cyan-500/15 text-cyan-400',
  auditoria_enviada:'bg-violet-500/15 text-violet-400',
  reuniao_marcada:  'bg-amber-500/15 text-amber-400',
  proposta_enviada: 'bg-orange-500/15 text-orange-400',
  fechado:          'bg-green-500/15 text-green-400',
  perdido:          'bg-red-500/15 text-red-400',
}

export default function EtapaTag({ etapa }: { etapa: Etapa }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COR[etapa]}`}>
      {ETAPA_LABEL[etapa]}
    </span>
  )
}
