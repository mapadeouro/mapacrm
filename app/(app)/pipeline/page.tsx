'use client'

import { useState, useEffect, useCallback } from 'react'
import LeadRow   from '@/components/pipeline/LeadRow'
import LeadModal from '@/components/pipeline/LeadModal'
import { ETAPAS_ATIVAS, ETAPA_LABEL } from '@/lib/pipeline'
import type { Lead, Etapa } from '@/lib/types'

export default function PipelinePage() {
  const [leads,       setLeads]       = useState<Lead[]>([])
  const [loading,     setLoading]     = useState(true)
  const [leadAberto,  setLeadAberto]  = useState<Lead | null>(null)
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'todas'>('todas')

  // ── Carregar leads ──────────────────────────────────────────────
  const carregarLeads = useCallback(async () => {
    const res  = await fetch('/api/pipeline/leads')
    const data = await res.json()
    setLeads(data.leads ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { carregarLeads() }, [carregarLeads])

  // ── Atualizar lead localmente após ação no modal ────────────────
  function handleAtualizar(leadId: string, mudancas: Partial<Lead>) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...mudancas } : l))
    if (leadAberto?.id === leadId) {
      setLeadAberto(prev => prev ? { ...prev, ...mudancas } : null)
    }
  }

  // ── Agrupamento por etapa ───────────────────────────────────────
  const etapasVisiveis = filtroEtapa === 'todas' ? ETAPAS_ATIVAS : [filtroEtapa as Etapa]

  const leadsPorEtapa = etapasVisiveis.map(etapa => ({
    etapa,
    label: ETAPA_LABEL[etapa],
    leads: leads.filter(l => l.etapa === etapa),
  })).filter(g => g.leads.length > 0)

  const totalAtivos = leads.filter(l =>
    !['fechado','perdido'].includes(l.etapa)
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-5 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-mono font-bold text-white tracking-wide uppercase">
              Pipeline
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {totalAtivos} lead{totalAtivos !== 1 ? 's' : ''} ativo{totalAtivos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filtro por etapa — scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-5 scrollbar-none">
          <button
            onClick={() => setFiltroEtapa('todas')}
            className={`
              shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filtroEtapa === 'todas'
                ? 'bg-brand/20 text-brand border border-brand/40'
                : 'bg-surface-raised border border-surface-border text-gray-400'
              }
            `}
          >
            Todas
          </button>
          {ETAPAS_ATIVAS.map(etapa => {
            const count = leads.filter(l => l.etapa === etapa).length
            if (count === 0) return null
            return (
              <button
                key={etapa}
                onClick={() => setFiltroEtapa(etapa)}
                className={`
                  shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  flex items-center gap-1.5
                  ${filtroEtapa === etapa
                    ? 'bg-brand/20 text-brand border border-brand/40'
                    : 'bg-surface-raised border border-surface-border text-gray-400'
                  }
                `}
              >
                {ETAPA_LABEL[etapa]}
                <span className={`
                  w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold
                  ${filtroEtapa === etapa ? 'bg-brand/30' : 'bg-surface-border'}
                `}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lista agrupada por etapa */}
        {leadsPorEtapa.length > 0 ? (
          <div className="space-y-6">
            {leadsPorEtapa.map(({ etapa, label, leads: grupo }) => (
              <div key={etapa}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-xs text-gray-600">({grupo.length})</span>
                </div>
                <div className="space-y-2">
                  {grupo.map(lead => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onAbrir={setLeadAberto}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm">
              {filtroEtapa === 'todas'
                ? 'Nenhum lead no pipeline ainda.\nUse o Finder para buscar empresas.'
                : 'Nenhum lead nessa etapa.'
              }
            </p>
          </div>
        )}

        {/* Fechados/Perdidos — link discreto */}
        {leads.some(l => ['fechado','perdido'].includes(l.etapa)) && (
          <div className="mt-8 border-t border-surface-border pt-4">
            <p className="text-xs text-gray-600 text-center">
              {leads.filter(l => l.etapa === 'fechado').length} fechados ·{' '}
              {leads.filter(l => l.etapa === 'perdido').length} perdidos
            </p>
          </div>
        )}

      </div>

      {/* Modal */}
      {leadAberto && (
        <LeadModal
          lead={leadAberto}
          onFechar={() => setLeadAberto(null)}
          onAtualizar={handleAtualizar}
        />
      )}
    </>
  )
}
