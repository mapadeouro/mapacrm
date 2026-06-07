'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { moverEtapa, salvarObservacoes } from '@/actions/leads'
import { criarTarefa, concluirTarefa }   from '@/actions/tarefas'
import ScoreBadge  from '@/components/shared/ScoreBadge'
import EtapaTag    from './EtapaTag'
import BotaoCopiar from '@/components/finder/BotaoCopiar'
import { ETAPAS } from '@/lib/types'
import { ETAPA_LABEL } from '@/lib/pipeline'
import { gerarMensagem, gerarLinkWhatsApp } from '@/lib/mensagem'
import { calcularScore } from '@/lib/score'
import type { Lead, Etapa } from '@/lib/types'

interface Props {
  lead:       Lead
  onFechar:   () => void
  onAtualizar:(leadId: string, mudancas: Partial<Lead>) => void
}

export default function LeadModal({ lead, onFechar, onAtualizar }: Props) {
  const [isPending, start]      = useTransition()
  const [etapa,     setEtapa]   = useState<Etapa>(lead.etapa)
  const [obs,       setObs]     = useState(lead.observacoes ?? '')
  const [tarefas,   setTarefas] = useState(lead.tarefas ?? [])

  // Nova tarefa
  const [novaDesc,  setNovaDesc]  = useState('')
  const [novaData,  setNovaData]  = useState(dataDefault())
  const [addingTask,setAddingTask]= useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Fechar com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFechar])

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Calcular dor principal sincronamente a partir dos dados salvos do lead
  const { dor_principal } = calcularScore({
    site:          lead.site,
    qtd_avaliacoes:lead.qtd_avaliacoes ?? 0,
    nota_media:    lead.nota_media,
  })

  const msgWA  = gerarMensagem({ nome_empresa: lead.nome_empresa, cidade: lead.cidade ?? '', dor_principal }, 'whatsapp')
  const msgIG  = gerarMensagem({ nome_empresa: lead.nome_empresa, cidade: lead.cidade ?? '', dor_principal }, 'instagram')
  const linkWA = lead.telefone ? gerarLinkWhatsApp(lead.telefone, msgWA) : null

  // ── Mover etapa ───────────────────────────────────────────────

  function handleMoverEtapa(nova: Etapa) {
    if (nova === etapa) return
    setEtapa(nova)
    start(async () => {
      await moverEtapa(lead.id, nova)
      onAtualizar(lead.id, { etapa: nova })
    })
  }

  // ── Salvar observações ────────────────────────────────────────

  function handleSalvarObs() {
    start(async () => {
      await salvarObservacoes(lead.id, obs)
      onAtualizar(lead.id, { observacoes: obs })
    })
  }

  // ── Criar tarefa ──────────────────────────────────────────────

  function handleCriarTarefa() {
    if (!novaDesc.trim()) return
    start(async () => {
      await criarTarefa({ leadId: lead.id, descricao: novaDesc.trim(), dataPrevista: novaData })
      setTarefas(prev => [...prev, {
        id:           crypto.randomUUID(),
        user_id:      lead.user_id,
        lead_id:      lead.id,
        descricao:    novaDesc.trim(),
        data_prevista:novaData,
        concluida:    false,
        created_at:   new Date().toISOString(),
      }])
      setNovaDesc('')
      setNovaData(dataDefault())
      setAddingTask(false)
    })
  }

  // ── Concluir tarefa ───────────────────────────────────────────

  function handleConcluir(tarefaId: string) {
    setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, concluida: true } : t))
    start(async () => { await concluirTarefa(tarefaId) })
  }

  const pendentes  = tarefas.filter(t => !t.concluida).sort(
    (a, b) => a.data_prevista.localeCompare(b.data_prevista)
  )
  const concluidas = tarefas.filter(t =>  t.concluida)
  const hoje       = new Date().toISOString().split('T')[0]

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onFechar}
      />

      {/* Modal — ocupa tela inteira no mobile */}
      <div className="
        fixed inset-x-0 bottom-0 z-50
        bg-surface border-t border-surface-border
        rounded-t-2xl
        max-h-[92dvh] overflow-y-auto
        md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
        md:w-full md:max-w-lg md:rounded-2xl md:border md:max-h-[85vh]
      ">
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-surface-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-surface-border">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-white font-semibold text-base leading-tight">
              {lead.nome_empresa}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {lead.cidade && <span className="text-gray-500 text-xs">{lead.cidade}</span>}
              <EtapaTag etapa={etapa} />
              <ScoreBadge score={lead.score} />
            </div>
          </div>
          <button
            onClick={onFechar}
            className="text-gray-500 hover:text-white transition-colors p-1 -mr-1"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* ── Contato ──────────────────────────────────────────── */}
          <section className="space-y-1">
            {lead.telefone && (
              <p className="text-sm text-gray-400">📞 {lead.telefone}</p>
            )}
            {lead.site
              ? <a href={lead.site} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-brand block">🌐 {lead.site}</a>
              : <p className="text-sm text-red-400/80">🌐 Sem site</p>
            }
            {lead.nota_media !== null && (
              <p className="text-sm text-gray-400">
                ⭐ {lead.nota_media?.toFixed(1)} · {lead.qtd_avaliacoes} avaliações
              </p>
            )}
            {lead.google_maps_url && (
              <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer"
                 className="text-xs text-gray-500 underline-offset-2 hover:underline">
                Ver no Google Maps →
              </a>
            )}
          </section>

          {/* ── Mensagem rápida ───────────────────────────────────── */}
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mensagem rápida</p>
            <div className="flex flex-wrap gap-2">
              <BotaoCopiar texto={msgWA} label="Copiar WhatsApp" />
              <BotaoCopiar texto={msgIG} label="Copiar Instagram" />
              {linkWA && (
                <a href={linkWA} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
                              bg-green-600/20 text-green-400 border border-green-600/30 active:scale-95 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.523 5.843L.057 23.571l5.882-1.43A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.003-1.366l-.359-.213-3.71.902.933-3.61-.234-.371A9.818 9.818 0 0 1 2.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </section>

          {/* ── Mover etapa ──────────────────────────────────────── */}
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Etapa</p>
            <div className="flex flex-wrap gap-1.5">
              {ETAPAS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleMoverEtapa(value)}
                  disabled={isPending}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${etapa === value
                      ? 'bg-brand/20 text-brand border border-brand/40'
                      : 'bg-surface border border-surface-border text-gray-400 active:bg-surface-border'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Observações ───────────────────────────────────────── */}
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Observações</p>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              onBlur={handleSalvarObs}
              placeholder="Anotações sobre o lead, contexto da conversa…"
              rows={3}
              className="
                w-full bg-surface border border-surface-border rounded-xl
                px-4 py-3 text-white placeholder-gray-600 text-sm
                focus:outline-none focus:border-brand transition-colors resize-none
              "
            />
            <p className="text-xs text-gray-600 mt-1">Salvo ao sair do campo</p>
          </section>

          {/* ── Follow-ups ────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Follow-ups</p>
              <button
                onClick={() => setAddingTask(!addingTask)}
                className="text-xs text-brand flex items-center gap-1"
              >
                {addingTask ? '✕ Cancelar' : '+ Nova tarefa'}
              </button>
            </div>

            {/* Form nova tarefa */}
            {addingTask && (
              <div className="bg-surface border border-surface-border rounded-xl p-3 mb-3 space-y-2">
                <input
                  type="text"
                  value={novaDesc}
                  onChange={e => setNovaDesc(e.target.value)}
                  placeholder="Descrição da tarefa"
                  autoFocus
                  className="
                    w-full bg-surface-raised border border-surface-border rounded-lg
                    px-3 py-2 text-white placeholder-gray-600 text-sm
                    focus:outline-none focus:border-brand
                  "
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    className="
                      flex-1 bg-surface-raised border border-surface-border rounded-lg
                      px-3 py-2 text-white text-sm
                      focus:outline-none focus:border-brand
                    "
                  />
                  <button
                    onClick={handleCriarTarefa}
                    disabled={isPending || !novaDesc.trim()}
                    className="px-4 py-2 bg-brand text-surface rounded-lg text-sm font-semibold
                               disabled:opacity-40"
                  >
                    Criar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de tarefas pendentes */}
            {pendentes.length > 0 ? (
              <div className="space-y-2">
                {pendentes.map(t => {
                  const atrasada = t.data_prevista < hoje
                  return (
                    <div key={t.id}
                         className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl px-3 py-2.5">
                      <button
                        onClick={() => handleConcluir(t.id)}
                        className="w-5 h-5 rounded-full border-2 border-surface-border flex-shrink-0
                                   flex items-center justify-center
                                   active:border-brand transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-transparent" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{t.descricao}</p>
                        <p className={`text-xs ${atrasada ? 'text-red-400' : 'text-gray-500'}`}>
                          {atrasada ? '⚠️ ' : ''}{formatarData(t.data_prevista)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              !addingTask && (
                <p className="text-sm text-gray-600 text-center py-3">
                  Nenhum follow-up pendente
                </p>
              )
            )}

            {/* Concluídas (colapsável) */}
            {concluidas.length > 0 && (
              <p className="text-xs text-gray-600 mt-3 text-center">
                {concluidas.length} tarefa{concluidas.length > 1 ? 's' : ''} concluída{concluidas.length > 1 ? 's' : ''}
              </p>
            )}
          </section>

        </div>

        {/* Espaço seguro iOS */}
        <div className="h-6" />
      </div>
    </>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function dataDefault(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().split('T')[0]
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}
