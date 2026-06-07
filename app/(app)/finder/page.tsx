'use client'

import { useState }   from 'react'
import FormBusca      from '@/components/finder/FormBusca'
import LeadCard       from '@/components/finder/LeadCard'
import type { LeadFinder } from '@/lib/types'

export default function FinderPage() {
  const [leads,   setLeads]   = useState<LeadFinder[]>([])
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState<string | null>(null)
  const [query,   setQuery]   = useState<string | null>(null)

  async function buscar(nicho: string, cidade: string, pais: string) {
    setLoading(true)
    setErro(null)
    setLeads([])
    setQuery(`${nicho} · ${cidade}`)

    try {
      const res = await fetch('/api/finder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nicho, cidade, pais }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro na busca. Tente novamente.')
        return
      }

      setLeads(data.leads ?? [])
    } catch {
      setErro('Sem conexão. Verifique a internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-mono font-bold text-white tracking-wide uppercase">
          Lead Finder
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Busca por nicho e cidade · ordenado por oportunidade
        </p>
      </div>

      {/* Formulário */}
      <FormBusca onBuscar={buscar} loading={loading} />

      {/* Erro */}
      {erro && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {erro}
        </div>
      )}

      {/* Resultados */}
      {leads.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">{leads.length}</span> resultados
              {query && <span className="ml-1">para <span className="text-brand">{query}</span></span>}
            </p>
            <span className="text-xs text-gray-600">maior oportunidade primeiro</span>
          </div>

          <div className="space-y-3">
            {leads.map(lead => (
              <LeadCard key={lead.google_place_id} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio após busca */}
      {!loading && leads.length === 0 && query && !erro && (
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p className="text-2xl mb-2">🔍</p>
          Nenhum resultado encontrado.<br />
          Tente um nicho mais genérico ou outra cidade.
        </div>
      )}
    </div>
  )
}
