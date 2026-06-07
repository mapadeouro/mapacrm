# MapaCRM — Setup Dia 1

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)
- Chave da [Google Places API](https://console.cloud.google.com)

---

## 1. Supabase

1. Crie um projeto novo em supabase.com
2. Vá em **SQL Editor** e cole todo o conteúdo de `supabase/migration.sql`
3. Clique em **Run**
4. Vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public` key

---

## 2. Google Places API

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Vá em **APIs & Services > Enable APIs**
4. Ative **Places API (New)**
5. Vá em **Credentials > Create Credentials > API Key**
6. Restrinja a chave: **API restrictions** → selecione **Places API (New)**

---

## 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
GOOGLE_PLACES_API_KEY=sua_google_key
```

---

## 4. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

Você será redirecionado para `/login`. Digite seu e-mail e clique no link recebido.

---

## 5. Supabase Auth — configurar redirect

No Supabase Dashboard:
1. **Authentication > URL Configuration**
2. **Site URL**: `http://localhost:3000` (dev) ou seu domínio (produção)
3. **Redirect URLs**: adicione `http://localhost:3000/auth/callback`

---

## Estrutura do projeto

```
app/
  (app)/              → rotas autenticadas
    finder/           → Lead Finder (Dia 2)
    pipeline/         → Pipeline (Dia 3)
    dashboard/        → Dashboard (Dia 4)
  login/              → Magic Link
  auth/callback/      → handler do link

lib/
  score.ts            → motor de score extensível
  mensagem.ts         → geração automática de mensagem
  types.ts            → tipos TypeScript
  supabase/           → clients browser + server

supabase/
  migration.sql       → tabelas + RLS + índices
```

---

## Dias seguintes

| Dia | Entrega |
|-----|---------|
| ✅ 1 | Setup, auth, banco, layout, score, mensagem |
| 2   | Lead Finder completo + integração Google Places |
| 3   | Pipeline + modal do lead |
| 4   | Dashboard + alertas + follow-ups |
