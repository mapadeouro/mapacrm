'use client'

import { useState, useTransition } from 'react'
import { concluirTarefa }          from '@/actions/tarefas'
import type { Tarefa, Lead }        from '@/lib/types'

type TarefaComLead = Tarefa & { lead: Pick<Lead, 'id' | 'nome_empresa'> }

interface Props { tarefas: TarefaComLead[] }

export default function TarefasHoje({ tarefas: inicial }: Props) {
  const [lista,    setLista]    = useState(inicial)
  const [isPending, start]      = useTransition()
  const hoje = new Date().toISOString().split('T')[0]

  function handleConcluir(id: string) {
    setLista(prev => prev.filter(t => t.id !== id))   // otimista
    start(async () => { await concluirTarefa(id) })
  }

  const pendentes  = lista.filter(t => !t.concluida)
  const atrasadas  = pendentes.filter(t => t.data_prevista < hoje)
  const deHoje     = pendentes.filter(t => t.data_prevista === hoje)

  return (
    <section>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tarefas do dia</p>

      {pendentes.length === 0 ? (
        <div className="bg-surface-raised border border-surface-border rounded-xl px-4 py-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-sm text-gray-500">Nenhuma tarefa pendente para hoje</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Atrasadas primeiro */}
          {atrasadas.map(t => (
            <TarefaItem key={t.id} tarefa={t} atrasada onConcluir={handleConcluir} isPending={isPending} />
          ))}
          {/* De hoje */}
          {deHoje.map(t => (
            <TarefaItem key={t.id} tarefa={t} atrasada={false} onConcluir={handleConcluir} isPending={isPending} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Sub-componente de item ─────────────────────────────────────────

function TarefaItem({
  tarefa, atrasada, onConcluir, isPending,
}: {
  tarefa:     TarefaComLead
  atrasada:   boolean
  onConcluir: (id: string) => void
  isPending:  boolean
}) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border
      ${atrasada
        ? 'bg-red-500/5 border-red-500/20'
        : 'bg-surface-raised border-surface-border'
      }
    `}>
      {/* Botão concluir */}
      <button
        onClick={() => onConcluir(tarefa.id)}
        disabled={isPending}
        className="
          w-6 h-6 rounded-full border-2 border-surface-border shrink-0
          flex items-center justify-center
          active:border-green-400 active:bg-green-400/10
          disabled:opacity-40 transition-all
        "
        aria-label="Concluir tarefa"
      >
        <span className="w-2 h-2 rounded-full" />
      </button>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-tight truncate">{tarefa.descricao}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {tarefa.lead?.nome_empresa}
          {atrasada && <span className="text-red-400 ml-1">· atrasada</span>}
        </p>
      </div>
    </div>
  )
}
