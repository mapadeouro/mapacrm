import type { DorId, LeadFinder } from './types'

type Canal = 'whatsapp' | 'instagram'

// ─── Templates por dor e canal ────────────────────────────────────────────────
// Para adicionar template: inserir entrada no objeto abaixo.

const TEMPLATES: Record<DorId, Record<Canal, (nome: string, cidade: string) => string>> = {

  sem_site: {
    whatsapp: (nome, cidade) =>
`Oi, tudo bem?

Vi a ${nome} no Google Maps e percebi que ainda não há um site conectado ao perfil de vocês.

Existe uma oportunidade interessante aí para atrair quem pesquisa antes de ligar em ${cidade}.

Faz sentido conversar sobre isso?`,

    instagram: (nome, _cidade) =>
`Oi! Vi a ${nome} no Google Maps.

Percebi que ainda não há um site conectado ao perfil — existe uma oportunidade interessante para atrair quem pesquisa antes de entrar em contato.

Faz sentido conversar sobre isso?`,
  },

  poucas_avaliacoes: {
    whatsapp: (nome, cidade) =>
`Oi, tudo bem?

Vi a ${nome} no Google e percebi uma oportunidade para fortalecer ainda mais a presença de vocês nas avaliações.

Esse é um dos fatores que mais influencia quem aparece primeiro quando alguém pesquisa em ${cidade}.

Faz sentido conversar sobre isso?`,

    instagram: (nome, _cidade) =>
`Oi! Vi a ${nome} no Google.

Percebi uma oportunidade para fortalecer a presença de vocês nas avaliações — é um dos fatores que mais influencia quem aparece primeiro na pesquisa.

Faz sentido conversar sobre isso?`,
  },

  nota_baixa: {
    whatsapp: (nome, cidade) =>
`Oi, tudo bem?

Vi a ${nome} no Google e percebi que existe espaço para melhorar a percepção do perfil de vocês por lá.

Com alguns ajustes simples dá para mudar bastante esse cenário em ${cidade}.

Faz sentido conversar sobre isso?`,

    instagram: (nome, _cidade) =>
`Oi! Vi a ${nome} no Google.

Percebi que existe espaço para melhorar a percepção do perfil de vocês — com alguns ajustes simples dá para mudar bastante esse cenário.

Faz sentido conversar sobre isso?`,
  },
}

// Template genérico — quando nenhum critério dispara (score 0)
const TEMPLATE_GENERICO: Record<Canal, (nome: string, cidade: string) => string> = {
  whatsapp: (nome, cidade) =>
`Oi, tudo bem?

Vi a ${nome} no Google Maps e percebi algumas oportunidades para fortalecer ainda mais a presença de vocês nas buscas em ${cidade}.

Faz sentido conversar sobre isso?`,

  instagram: (nome, _cidade) =>
`Oi! Vi a ${nome} no Google Maps.

Percebi algumas oportunidades para fortalecer a presença de vocês nas buscas por lá.

Faz sentido conversar sobre isso?`,
}

// ─── Função principal ─────────────────────────────────────────────────────────

export function gerarMensagem(
  lead: Pick<LeadFinder, 'nome_empresa' | 'cidade' | 'dor_principal'>,
  canal: Canal
): string {
  const nome   = lead.nome_empresa
  const cidade = lead.cidade || 'sua cidade'

  if (!lead.dor_principal) {
    return TEMPLATE_GENERICO[canal](nome, cidade)
  }

  return TEMPLATES[lead.dor_principal][canal](nome, cidade)
}

// ─── Link direto WhatsApp ─────────────────────────────────────────────────────

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  // Remove tudo que não é dígito
  const numero = telefone.replace(/\D/g, '')
  const texto  = encodeURIComponent(mensagem)
  return `https://wa.me/${numero}?text=${texto}`
}
