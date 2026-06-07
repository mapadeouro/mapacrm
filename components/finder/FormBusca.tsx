'use client'

import { useState, FormEvent } from 'react'

interface Props {
  onBuscar:  (nicho: string, cidade: string, pais: string) => void
  loading:   boolean
}

const PAISES = [
  { value: 'Brasil',  label: '🇧🇷 Brasil'  },
  { value: 'España',  label: '🇪🇸 Espanha' },
]

export default function FormBusca({ onBuscar, loading }: Props) {
  const [nicho,  setNicho]  = useState('')
  const [cidade, setCidade] = useState('')
  const [pais,   setPais]   = useState('Brasil')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!nicho.trim() || !cidade.trim()) return
    onBuscar(nicho.trim(), cidade.trim(), pais)
  }

  return (
    <form onSubmit={submit} className="space-y-3">

      {/* Nicho */}
      <div>
        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
          Nicho
        </label>
        <input
          type="text"
          value={nicho}
          onChange={e => setNicho(e.target.value)}
          placeholder="ex: clínica estética, barbearia, odontologia"
          className="
            w-full bg-surface border border-surface-border rounded-xl
            px-4 py-3 text-white placeholder-gray-600 text-base
            focus:outline-none focus:border-brand transition-colors
          "
        />
      </div>

      {/* Cidade + País */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
            Cidade
          </label>
          <input
            type="text"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            placeholder="ex: Belo Horizonte"
            className="
              w-full bg-surface border border-surface-border rounded-xl
              px-4 py-3 text-white placeholder-gray-600 text-base
              focus:outline-none focus:border-brand transition-colors
            "
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
            País
          </label>
          <div className="flex gap-1.5 pt-0.5">
            {PAISES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPais(p.value)}
                className={`
                  px-3 py-3 rounded-xl text-sm font-medium transition-all
                  ${pais === p.value
                    ? 'bg-brand/20 text-brand border border-brand/40'
                    : 'bg-surface border border-surface-border text-gray-400'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botão */}
      <button
        type="submit"
        disabled={loading || !nicho.trim() || !cidade.trim()}
        className="
          w-full bg-brand text-surface font-semibold rounded-xl py-3.5
          text-base disabled:opacity-40 disabled:cursor-not-allowed
          active:bg-brand-dark transition-colors
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Buscando…
          </span>
        ) : (
          '🔍 Buscar Leads'
        )}
      </button>
    </form>
  )
}
