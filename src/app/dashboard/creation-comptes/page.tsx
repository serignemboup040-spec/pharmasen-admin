'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Role = 'pharmacien' | 'medecin'

const ROLE_LABELS: Record<Role, string> = {
  pharmacien: 'Pharmacien',
  medecin: 'Médecin',
}

export default function CreationComptesPage() {
  const [role, setRole] = useState<Role>('pharmacien')
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', specialite: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.prenom,
          last_name: form.nom,
          role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && role === 'medecin') {
      await supabase.from('medecins').insert({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || null,
        specialite: form.specialite || null,
        verifie: true,
        actif: true,
      })
    }

    if (data.user && role === 'pharmacien') {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: form.prenom,
        last_name: form.nom,
        email: form.email,
        phone: form.telephone || null,
      })
    }

    setSuccess(`Compte ${ROLE_LABELS[role].toLowerCase()} créé avec succès pour ${form.prenom} ${form.nom} (${form.email})`)
    setForm({ prenom: '', nom: '', email: '', telephone: '', specialite: '', password: '' })
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Création de comptes</h1>
        <p className="text-sm text-gray-500 mt-1">Créer un compte pharmacien ou médecin</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
            <div className="flex gap-3">
              {(['pharmacien', 'medecin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    role === r
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r === 'pharmacien' ? '🏥 Pharmacien' : '👨‍⚕️ Médecin'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.prenom} onChange={(e) => handleChange('prenom', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.telephone} onChange={(e) => handleChange('telephone', e.target.value)} />
            </div>

            {role === 'medecin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.specialite} onChange={(e) => handleChange('specialite', e.target.value)} placeholder="Ex: Cardiologie" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input required type="password" minLength={6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min. 6 caractères" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{success}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {loading ? 'Création en cours...' : `Créer le compte ${ROLE_LABELS[role].toLowerCase()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
