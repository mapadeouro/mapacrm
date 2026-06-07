'use client'

import { useState, useTransition } from 'react'
import { adicionarLead }  from '@/actions/leads'
import BotaoCopiar        from './BotaoCopiar'
import type { LeadFinder } from '@/lib/types'
import { gerarMensagem, gerarLinkWhatsApp } from '@/lib/mensagem'

interface Props {
  lead:              LeadFinder
  onAdicionado?:     (leadId: string) => void
}

export default function AcoesLead({ lead, onAdicionado }: Props) {
  const [isPending, startTransition] = useTransition()
  const [aberto,    setAberto]       = useState(false)
  const [feedback,  setFeedback]     = useState<string | null>(null)

  const msgWhatsApp  = gerarMensagem(lead, 'whatsapp')
  const msgInstagram = gerarMensagem(lead, 'instagram')
  const linkWA       = lead.telefone ? gerarLinkWhatsApp(lead.telefone, msgWhatsApp) : null

  async function executarAcao(tipo: 'pipeline' | 'pipeline+copiar' | 'pipeline+enviada') {
    setAberto(false)

    const etapa         = tipo === 'pipeline+enviada' ? 'mensagem_enviada' : 'lead_encontrado'
    const criarFollowup = tipo === 'pipeline+enviada'

    startTransition(async () => {
      const result = await adicionarLead({ lead, etapa, criarFollowup })

      if ('error' in result) {
        setFeedback('Erro ao adicionar. Tente novamente.')
        setTimeout(() => setFeedback(null), 3000)
        return
      }

      onAdicionado?.(result.id)
      setFeedback(
        tipo === 'pipeline+enviada'
          ? '✓ Adicionado + follow-up D+3 criado'
          : '✓ Adicionado ao pipeline'
      )
      setTimeout(() => setFeedback(null), 3000)

      // Copiar mensagem junto se solicitado
      if (tipo === 'pipeline+copiar') {
        try { await navigator.clipboard.writeText(msgWhatsApp) } catch { /* iOS fallback */ }
      }
    })
  }

  if (lead.ja_adicionado) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-brand">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" />
        </svg>
        Já no pipeline
      </div>
    )
  }

  return (
    <div className="mt-3 relative">
      {/* Botões de mensagem */}
      <div className="flex gap-2 flex-wrap">
        <BotaoCopiar texto={msgWhatsApp}  label="Copiar WhatsApp"  />
        <BotaoCopiar texto={msgInstagram} label="Copiar Instagram" />
        {linkWA && (
          <a
            href={linkWA}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
              bg-green-600/20 text-green-400 border border-green-600/30
              active:bg-green-600/30 transition-all active:scale-95
            "
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.523 5.843L.057 23.571l5.882-1.43A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.003-1.366l-.359-.213-3.71.902.933-3.61-.234-.371A9.818 9.818 0 0 1 2.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
            </svg>
            WhatsApp
          </a>
        )}
      </div>

      {/* Dropdown de adicionar */}
      <div className="mt-2 relative">
        <button
          onClick={() => setAberto(!aberto)}
          disabled={isPending}
          className="
            flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium w-full
            bg-brand/10 text-brand border border-brand/30
            active:bg-brand/20 disabled:opacity-50
            transition-all active:scale-95
          "
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          {isPending ? 'Salvando…' : 'Adicionar ao pipeline'}
          <svg viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 ml-auto transition-transform ${aberto ? 'rotate-180' : ''}`}>
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>

        {/* Menu de opções */}
        {aberto && (
          <div className="
            absolute top-full left-0 right-0 mt-1 z-30
            bg-surface-raised border border-surface-border rounded-xl
            overflow-hidden shadow-xl
          ">
            {[
              {
                tipo:    'pipeline'         as const,
                label:   'Adicionar ao Pipeline',
                sub:     'etapa: lead encontrado',
                icon:    '📌',
              },
              {
                tipo:    'pipeline+copiar'  as const,
                label:   'Adicionar + Copiar Mensagem',
                sub:     'copia msg WhatsApp',
                icon:    '📋',
              },
              {
                tipo:    'pipeline+enviada' as const,
                label:   'Adicionar + Mensagem Enviada',
                sub:     'move etapa + follow-up D+3',
                icon:    '⚡',
                destaque: true,
              },
            ].map(({ tipo, label, sub, icon, destaque }) => (
              <button
                key={tipo}
                onClick={() => executarAcao(tipo)}
                className={`
                  w-full flex items-start gap-3 px-4 py-3 text-left
                  transition-colors active:bg-surface-border
                  ${destaque
                    ? 'bg-brand/10 text-brand border-b border-surface-border'
                    : 'text-gray-200 border-b border-surface-border last:border-0'
                  }
                `}
              >
                <span className="text-lg leading-none mt-0.5">{icon}</span>
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className={`text-xs mt-0.5 ${destaque ? 'text-brand/70' : 'text-gray-500'}`}>
                    {sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback inline */}
      {feedback && (
        <p className={`text-xs mt-2 ${feedback.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>
          {feedback}
        </p>
      )}
    </div>
  )
}
