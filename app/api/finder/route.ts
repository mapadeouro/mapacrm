import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcularScore } from '@/lib/score'
import type { LeadFinder } from '@/lib/types'

// ─── Configuração ─────────────────────────────────────────────────
const PLACES_BASE = 'https://places.googleapis.com/v1'
const API_KEY     = process.env.GOOGLE_PLACES_API_KEY!

// Campos que vamos buscar — cada campo tem custo, só pedimos o necessário
const TEXT_SEARCH_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'places.googleMapsUri',
  'places.primaryTypeDisplayName',
  'places.photos',
  'places.regularOpeningHours',
  'places.reviews',
].join(',')

// ─── Tipos internos da API ────────────────────────────────────────
interface PlaceResult {
  id:                    string
  displayName?:          { text: string }
  formattedAddress?:     string
  rating?:               number
  userRatingCount?:      number
  websiteUri?:           string
  nationalPhoneNumber?:  string
  googleMapsUri?:        string
  primaryTypeDisplayName?: { text: string }
  photos?:               unknown[]
  regularOpeningHours?:  { periods?: unknown[] }
  reviews?:              Array<{ authorAttribution?: { displayName: string }; name?: string }>
}

// ─── Handler principal ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Auth — só o dono pode usar
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // 2. Parâmetros da busca
    const body = await req.json()
    const { nicho, cidade, pais = 'Brasil' } = body as {
      nicho:  string
      cidade: string
      pais?:  string
    }

    if (!nicho?.trim() || !cidade?.trim()) {
      return NextResponse.json({ error: 'Nicho e cidade são obrigatórios' }, { status: 400 })
    }

    // 3. Text Search — busca principal
    const query         = `${nicho.trim()} em ${cidade.trim()}, ${pais}`
    const textSearchRes = await fetch(`${PLACES_BASE}/places:searchText`, {
      method:  'POST',
      headers: {
        'Content-Type':     'application/json',
        'X-Goog-Api-Key':   API_KEY,
        'X-Goog-FieldMask': TEXT_SEARCH_FIELDS,
      },
      body: JSON.stringify({
        textQuery:      query,
        languageCode:   'pt-BR',
        maxResultCount: 20,       // máximo permitido por request
      }),
    })

    if (!textSearchRes.ok) {
      const err = await textSearchRes.text()
      console.error('[Finder] Google API error:', err)
      return NextResponse.json({ error: 'Erro na busca. Verifique a chave da API.' }, { status: 502 })
    }

    const { places = [] } = await textSearchRes.json() as { places: PlaceResult[] }

    // 4. Buscar place_ids já salvos pelo usuário (deduplicação)
    const placeIds = places.map(p => p.id).filter(Boolean)
    const { data: existentes } = await supabase
      .from('leads')
      .select('google_place_id')
      .eq('user_id', user.id)
      .in('google_place_id', placeIds)

    const idsJaSalvos = new Set(
      (existentes ?? []).map(r => r.google_place_id)
    )

    // 5. Montar LeadFinder com score para cada resultado
    const leads: LeadFinder[] = places
      .filter(p => p.id && p.displayName?.text)   // descarta resultados incompletos
      .map((place): LeadFinder => {
        // Inferir cidade do endereço (último componente antes do país)
        const cidadeInferida = extrairCidade(place.formattedAddress ?? '') || cidade

        // Heurística: responde reviews → alguma review tem reply do proprietário?
        const respondeReviews = inferirRespondeReviews(place.reviews ?? [])

        // Dados brutos para o score
        const dadosScore = {
          site:          place.websiteUri ?? null,
          qtd_avaliacoes:place.userRatingCount ?? 0,
          nota_media:    place.rating ?? null,
        }

        const { score, criterios, dor_principal } = calcularScore(dadosScore)

        return {
          google_place_id:  place.id,
          nome_empresa:     place.displayName!.text,
          google_maps_url:  place.googleMapsUri ?? '',
          telefone:         place.nationalPhoneNumber ?? null,
          site:             place.websiteUri ?? null,
          endereco:         place.formattedAddress ?? '',
          cidade:           cidadeInferida,
          pais,
          nota_media:       place.rating ?? null,
          qtd_avaliacoes:   place.userRatingCount ?? 0,
          tem_fotos:        (place.photos?.length ?? 0) > 0,
          tem_horario:      (place.regularOpeningHours?.periods?.length ?? 0) > 0,
          responde_reviews: respondeReviews,
          score,
          criterios,
          dor_principal,
          ja_adicionado:    idsJaSalvos.has(place.id),
        }
      })
      // Ordenar: maior score primeiro
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ leads, total: leads.length })

  } catch (err) {
    console.error('[Finder] Erro inesperado:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Extrai cidade do endereço formatado do Google */
function extrairCidade(endereco: string): string {
  // Formato típico: "Rua X, 123 - Bairro, Cidade - Estado, CEP, País"
  const partes = endereco.split(',').map(s => s.trim())
  // Cidade costuma ser o penúltimo ou antepenúltimo componente
  if (partes.length >= 3) {
    const candidato = partes[partes.length - 3]
    // Remove código de estado se existir (ex: "Belo Horizonte - MG")
    return candidato.split('-')[0].trim()
  }
  return ''
}

/** Heurística: verifica se alguma das 5 reviews tem resposta do proprietário */
function inferirRespondeReviews(
  reviews: PlaceResult['reviews']
): boolean {
  if (!reviews || reviews.length === 0) return false
  // A Places API (New) retorna o campo `name` nas reviews que têm reply
  // Verificamos se alguma review tem estrutura de resposta (campo extra presente)
  return reviews.some(r => r.name && r.name.includes('/replies/'))
}
