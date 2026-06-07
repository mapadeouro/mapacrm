import type { CriterioScore, DorId, LeadFinder } from './types'

// ─── Regras de score ──────────────────────────────────────────────────────────
// Para adicionar critério: inserir objeto aqui. Zero refatoração no resto.
// Ordem importa: maior peso primeiro (garante dor_principal correta em empate).

interface Regra {
  id:       DorId
  label:    string
  pontos:   number
  verificar:(lead: Pick<LeadFinder, 'site' | 'qtd_avaliacoes' | 'nota_media'>) => boolean
}

export const REGRAS: Regra[] = [
  {
    id:       'sem_site',
    label:    'Sem site cadastrado',
    pontos:   40,
    verificar:(l) => !l.site,
  },
  {
    id:       'poucas_avaliacoes',
    label:    'Poucas avaliações',
    pontos:   35,
    verificar:(l) => l.qtd_avaliacoes < 15,
  },
  {
    id:       'nota_baixa',
    label:    'Nota abaixo da média',
    pontos:   25,
    verificar:(l) => l.nota_media !== null && l.nota_media < 3.8,
  },
]

// ─── Resultado do cálculo ─────────────────────────────────────────────────────

export interface ResultadoScore {
  score:         number
  criterios:     CriterioScore[]
  dor_principal: DorId | null
}

// ─── Função principal ─────────────────────────────────────────────────────────

export function calcularScore(
  lead: Pick<LeadFinder, 'site' | 'qtd_avaliacoes' | 'nota_media'>
): ResultadoScore {
  // 1. Avaliar todos os critérios
  const criterios: CriterioScore[] = REGRAS.map((regra) => ({
    id:     regra.id,
    label:  regra.label,
    pontos: regra.pontos,
    ativo:  regra.verificar(lead),
  }))

  // 2. Score = soma dos critérios ativos
  const score = criterios
    .filter(c => c.ativo)
    .reduce((acc, c) => acc + c.pontos, 0)

  // 3. Dor principal = critério ativo com MAIOR pontuação
  //    Independente da ordem do array — seguro para adicionar novas regras
  const ativos = criterios.filter(c => c.ativo)
  const melhor = ativos.length > 0
    ? ativos.reduce((maior, atual) => atual.pontos > maior.pontos ? atual : maior)
    : null

  const dor_principal: DorId | null = melhor ? melhor.id : null

  return { score, criterios, dor_principal }
}

// ─── Classificação visual ─────────────────────────────────────────────────────

export function classificarScore(score: number): {
  cor:    'high' | 'medium' | 'low'
  label:  string
} {
  if (score >= 65) return { cor: 'high',   label: 'Alta'  }
  if (score >= 35) return { cor: 'medium', label: 'Média' }
  return              { cor: 'low',    label: 'Baixa' }
}
