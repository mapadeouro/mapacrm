import type { MetricasFunil } from '@/lib/types'

interface Props { metricas: MetricasFunil }

export default function MetricasFunil({ metricas }: Props) {
  const { leads_total, mensagens, respostas, propostas, fechados } = metricas

  const conversao = mensagens > 0
    ? ((fechados / mensagens) * 100).toFixed(1)
    : '0'

  const cards = [
    { label: 'Leads',     valor: leads_total, cor: 'text-gray-300'  },
    { label: 'Mensagens', valor: mensagens,   cor: 'text-blue-400'  },
    { label: 'Respostas', valor: respostas,   cor: 'text-cyan-400'  },
    { label: 'Propostas', valor: propostas,   cor: 'text-amber-400' },
    { label: 'Fechados',  valor: fechados,    cor: 'text-green-400' },
  ]

  return (
    <section>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Funil geral</p>

      {/* Cards em scroll horizontal no mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {cards.map(({ label, valor, cor }) => (
          <div
            key={label}
            className="shrink-0 bg-surface-raised border border-surface-border
                       rounded-xl px-4 py-3 text-center min-w-[72px]"
          >
            <p className={`text-2xl font-mono font-bold ${cor}`}>{valor}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Taxa de conversão */}
      {mensagens > 0 && (
        <p className="text-xs text-gray-500 mt-2 text-right">
          Conversão mensagem → fechamento:{' '}
          <span className="text-white font-semibold">{conversao}%</span>
        </p>
      )}
    </section>
  )
}
