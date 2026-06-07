'use client'

import { useState }   from 'react'
import ScoreBadge     from '@/components/shared/ScoreBadge'
import AcoesLead      from './AcoesLead'
import type { LeadFinder } from '@/lib/types'

interface Props {
  lead: LeadFinder
}

export default function LeadCard({ lead }: Props) {
  const [adicionado, setAdicionado] = useState(lead.ja_adicionado)

  // Critérios ativos (problemas encontrados)
  const problemas = lead.criterios.filter(c => c.ativo)

  return (
    <div className="bg-surface-raised border border-surface-border rounded-2xl p-4">

      {/* Cabeçalho: nome + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-tight truncate">
            {lead.nome_empresa}
          </h3>
          {lead.cidade && (
            <p className="text-gray-500 text-xs mt-0.5">
              {lead.cidade}{lead.pais && lead.pais !== 'Brasil' ? ` · ${lead.pais}` : ''}
            </p>
          )}
        </div>
        <ScoreBadge score={lead.score} />
      </div>

      {/* Dados de qualidade */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {lead.nota_media !== null && (
          <span className="flex items-center gap-1 text-sm text-gray-300">
            <span className="text-amber-400">★</span>
            {lead.nota_media.toFixed(1)}
          </span>
        )}
        <span className="flex items-center gap-1 text-sm text-gray-300">
          <span className="text-gray-500">📝</span>
          {lead.qtd_avaliacoes} aval.
        </span>
        <span className={`text-sm ${lead.site ? 'text-gray-400' : 'text-red-400'}`}>
          {lead.site ? '🌐 tem site' : '🌐 sem site'}
        </span>
      </div>

      {/* Contato */}
      {(lead.telefone || lead.google_maps_url) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
          {lead.telefone && (
            <span className="text-sm text-gray-400">📞 {lead.telefone}</span>
          )}
          {lead.google_maps_url && (
            <a
              href={lead.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand underline-offset-2 hover:underline"
            >
              Ver no Maps →
            </a>
          )}
        </div>
      )}

      {/* Problemas encontrados */}
      {problemas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {problemas.map(p => (
            <span
              key={p.id}
              className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
            >
              ✗ {p.label}
            </span>
          ))}
        </div>
      )}

      {/* Ações */}
      <AcoesLead
        lead={{ ...lead, ja_adicionado: adicionado }}
        onAdicionado={() => setAdicionado(true)}
      />
    </div>
  )
}
