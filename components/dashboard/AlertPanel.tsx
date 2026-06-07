import Link from 'next/link'
import type { AlertaPipeline } from '@/lib/pipeline'

interface Props { alertas: AlertaPipeline[] }

const COR = {
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    dot: 'bg-red-500'    },
  yellow: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-500'  },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500' },
}

export default function AlertPanel({ alertas }: Props) {
  return (
    <section>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Alertas</p>
      <div className="space-y-2">
        {alertas.map(alerta => {
          const c = COR[alerta.cor]
          return (
            <Link
              key={alerta.tipo}
              href="/pipeline"
              className={`
                flex items-start gap-3 px-4 py-3 rounded-xl border
                ${c.bg} ${c.border}
                active:opacity-80 transition-opacity
              `}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${c.text}`}>{alerta.label}</p>
                {alerta.leads.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {alerta.leads.map(l => l.nome_empresa).join(', ')}
                  </p>
                )}
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-600 shrink-0 mt-0.5">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
