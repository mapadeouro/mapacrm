'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleLogin() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError('Erro ao enviar link. Verifique o e-mail e tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-3xl font-mono font-bold tracking-widest text-brand uppercase">
          MapaCRM
        </div>
        <div className="text-xs text-gray-500 mt-1 tracking-wider uppercase">
          Método Mapa de Ouro™
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-raised border border-surface-border rounded-2xl p-6">

        {sent ? (
          /* Estado: link enviado */
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-white font-medium">Link enviado!</p>
            <p className="text-gray-400 text-sm mt-2">
              Verifique seu e-mail e clique no link para entrar.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-brand underline"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          /* Estado: formulário */
          <>
            <h1 className="text-white font-semibold text-lg mb-1">Entrar</h1>
            <p className="text-gray-400 text-sm mb-6">
              Você receberá um link de acesso no e-mail.
            </p>

            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              className="
                w-full bg-surface border border-surface-border rounded-xl
                px-4 py-3 text-white placeholder-gray-600
                focus:outline-none focus:border-brand
                text-base   /* evita zoom no iOS (min 16px) */
                transition-colors
              "
            />

            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim()}
              className="
                mt-4 w-full bg-brand text-surface-DEFAULT font-semibold
                rounded-xl py-3.5 text-base
                active:bg-brand-dark
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {loading ? 'Enviando…' : 'Enviar link de acesso'}
            </button>
          </>
        )}
      </div>

      <p className="text-gray-600 text-xs mt-8 text-center">
        Acesso restrito ao operador da conta.
      </p>
    </div>
  )
}
