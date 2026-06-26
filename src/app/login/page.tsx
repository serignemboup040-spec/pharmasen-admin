'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setDebugInfo('')
    setLoading(true)

    console.log('[LOGIN] Tentative de connexion pour :', email)

    // Étape 1 : connexion Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    console.log('[LOGIN] Résultat auth :', { session: authData?.session?.user?.email, error: signInError?.message })

    if (signInError) {
      console.error('[LOGIN] Erreur auth :', signInError)
      const msg =
        signInError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : signInError.message === 'Email not confirmed'
          ? 'Votre email n\'a pas été confirmé. Vérifiez votre boîte mail.'
          : `Erreur de connexion : ${signInError.message}`
      setError(msg)
      setLoading(false)
      return
    }

    if (!authData.session) {
      console.error('[LOGIN] Session nulle après connexion')
      setError('Connexion échouée : aucune session créée.')
      setLoading(false)
      return
    }

    console.log('[LOGIN] Auth OK — vérification dans la table admins...')

    // Étape 2 : vérification dans la table admins
    const { data: adminRows, error: adminError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())

    console.log('[LOGIN] Résultat admins :', { adminRows, adminError })

    if (adminError) {
      console.error('[LOGIN] Erreur table admins :', adminError)
      if (adminError.code === '42P01') {
        // Table n'existe pas
        setError('Configuration manquante : la table "admins" n\'existe pas dans Supabase.')
      } else {
        setError(`Erreur base de données : ${adminError.message}`)
      }
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!adminRows || adminRows.length === 0) {
      console.warn('[LOGIN] Email non trouvé dans admins :', email)
      setError("Accès refusé. Cet email n'a pas les droits administrateur.")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    console.log('[LOGIN] Admin vérifié ✓ — redirection vers /dashboard')
    window.location.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              P
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PharMaSen Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pharmasen.sn"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 whitespace-pre-wrap">
                {error}
              </div>
            )}

            {debugInfo && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-4 py-3 font-mono whitespace-pre-wrap">
                {debugInfo}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Accès réservé aux administrateurs PharMaSen
        </p>
      </div>
    </div>
  )
}
