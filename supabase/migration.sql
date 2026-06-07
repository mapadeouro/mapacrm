-- ═══════════════════════════════════════════════════════════════
-- MapaCRM — Migration completa
-- Execute no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════

-- ─── LEADS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados da empresa
  nome_empresa      TEXT        NOT NULL,
  telefone          TEXT,
  site              TEXT,
  endereco          TEXT,
  cidade            TEXT,
  pais              TEXT        DEFAULT 'Brasil',
  nicho             TEXT,
  google_place_id   TEXT,
  google_maps_url   TEXT,

  -- Qualidade (vindos da API)
  nota_media        NUMERIC(2,1),
  qtd_avaliacoes    INTEGER,
  tem_fotos         BOOLEAN,
  tem_horario       BOOLEAN,
  responde_reviews  BOOLEAN,

  -- Score calculado
  score             INTEGER     DEFAULT 0,

  -- Pipeline
  etapa             TEXT        NOT NULL DEFAULT 'lead_encontrado'
                    CHECK (etapa IN (
                      'lead_encontrado','mensagem_enviada','respondeu',
                      'auditoria_enviada','reuniao_marcada',
                      'proposta_enviada','fechado','perdido'
                    )),

  -- Datas automáticas (atualizadas por trigger ou server action)
  data_contato      TIMESTAMPTZ,   -- setada ao ir para mensagem_enviada
  data_proposta     TIMESTAMPTZ,   -- setada ao ir para proposta_enviada
  data_ultima_acao  TIMESTAMPTZ,   -- atualizada em qualquer mudança de etapa

  -- Livre
  observacoes       TEXT,

  -- Meta
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de leads
CREATE INDEX IF NOT EXISTS idx_leads_user_etapa  ON leads(user_id, etapa);
CREATE INDEX IF NOT EXISTS idx_leads_user_score  ON leads(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_place_id    ON leads(google_place_id)
  WHERE google_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_ultima_acao ON leads(user_id, data_ultima_acao);

-- RLS leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_own" ON leads
  USING     (auth.uid() = user_id)
  WITH CHECK(auth.uid() = user_id);

-- ─── TAREFAS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tarefas (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id       UUID    NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  descricao     TEXT    NOT NULL,
  data_prevista DATE    NOT NULL,
  concluida     BOOLEAN NOT NULL DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice de tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_pendentes
  ON tarefas(user_id, concluida, data_prevista)
  WHERE concluida = FALSE;

-- RLS tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarefas_own" ON tarefas
  USING     (auth.uid() = user_id)
  WITH CHECK(auth.uid() = user_id);

-- ─── TRIGGER updated_at ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_updated ON leads;
CREATE TRIGGER trg_leads_updated
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── FIM ──────────────────────────────────────────────────────────
-- Verifique as tabelas em: Database > Tables
-- ═══════════════════════════════════════════════════════════════
