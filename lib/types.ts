// ─── Banco de dados ───────────────────────────────────────────────────────────

export type Etapa =
  | 'lead_encontrado'
  | 'mensagem_enviada'
  | 'respondeu'
  | 'auditoria_enviada'
  | 'reuniao_marcada'
  | 'proposta_enviada'
  | 'fechado'
  | 'perdido'

export const ETAPAS: { value: Etapa; label: string }[] = [
  { value: 'lead_encontrado',  label: 'Lead encontrado'  },
  { value: 'mensagem_enviada', label: 'Mensagem enviada' },
  { value: 'respondeu',        label: 'Respondeu'        },
  { value: 'auditoria_enviada',label: 'Auditoria enviada'},
  { value: 'reuniao_marcada',  label: 'Reunião marcada'  },
  { value: 'proposta_enviada', label: 'Proposta enviada' },
  { value: 'fechado',          label: 'Fechado'          },
  { value: 'perdido',          label: 'Perdido'          },
]

export interface Lead {
  id:               string
  user_id:          string

  // Dados da empresa
  nome_empresa:     string
  telefone:         string | null
  site:             string | null
  endereco:         string | null
  cidade:           string | null
  pais:             string | null
  nicho:            string | null
  google_place_id:  string | null
  google_maps_url:  string | null

  // Dados de qualidade (da API)
  nota_media:       number | null
  qtd_avaliacoes:   number | null
  tem_fotos:        boolean | null
  tem_horario:      boolean | null
  responde_reviews: boolean | null

  // Score
  score:            number

  // Pipeline
  etapa:            Etapa

  // Datas automáticas
  data_contato:     string | null  // setada ao mover para mensagem_enviada
  data_proposta:    string | null  // setada ao mover para proposta_enviada
  data_ultima_acao: string | null  // atualizada em qualquer mudança de etapa

  // Livre
  observacoes:      string | null

  created_at:       string
  updated_at:       string

  // Relação (join opcional)
  tarefas?:         Tarefa[]
}

export interface Tarefa {
  id:           string
  user_id:      string
  lead_id:      string
  descricao:    string
  data_prevista:string   // DATE como string ISO 'YYYY-MM-DD'
  concluida:    boolean
  created_at:   string

  // Relação (join opcional)
  lead?:        Pick<Lead, 'id' | 'nome_empresa' | 'etapa'>
}

// ─── Lead Finder (resultado bruto da API, antes de salvar) ────────────────────

export interface LeadFinder {
  // Identificação
  google_place_id:  string
  nome_empresa:     string
  google_maps_url:  string

  // Contato
  telefone:         string | null
  site:             string | null
  endereco:         string
  cidade:           string
  pais:             string

  // Qualidade
  nota_media:       number | null
  qtd_avaliacoes:   number
  tem_fotos:        boolean
  tem_horario:      boolean
  responde_reviews: boolean   // heurística das 5 reviews

  // Score calculado no backend
  score:            number
  criterios:        CriterioScore[]  // quais critérios dispararam
  dor_principal:    DorId | null

  // Estado na sessão atual
  ja_adicionado:    boolean
}

// ─── Score ────────────────────────────────────────────────────────────────────

export type DorId = 'sem_site' | 'poucas_avaliacoes' | 'nota_baixa'

export interface CriterioScore {
  id:       DorId
  label:    string
  pontos:   number
  ativo:    boolean   // true = problema encontrado neste lead
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface MetricasFunil {
  leads_total:      number
  mensagens:        number
  respostas:        number
  propostas:        number
  fechados:         number
}

export interface Alerta {
  tipo:    'sem_resposta' | 'proposta_parada' | 'followup_atrasado'
  label:   string
  cor:     'red' | 'yellow' | 'orange'
  leads:   Pick<Lead, 'id' | 'nome_empresa' | 'cidade'>[]
}
