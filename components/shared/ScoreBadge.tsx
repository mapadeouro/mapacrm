import { classificarScore } from '@/lib/score'

interface Props {
  score: number
  showLabel?: boolean
}

const COR_MAP = {
  high:   { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-500'    },
  medium: { bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-500'  },
  low:    { bg: 'bg-gray-500/15',   text: 'text-gray-400',   dot: 'bg-gray-500'   },
}

export default function ScoreBadge({ score, showLabel = false }: Props) {
  const { cor, label } = classificarScore(score)
  const c = COR_MAP[cor]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {score}pts
      {showLabel && <span className="opacity-70">· {label}</span>}
    </span>
  )
}
