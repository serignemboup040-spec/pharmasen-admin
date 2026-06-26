import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import StatCard from '@/components/ui/StatCard'

async function getStats() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const [users, pharmacies, medecins, medicaments, hopitaux, urgences] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('pharmacies').select('id', { count: 'exact', head: true }),
    supabase.from('medecins').select('id', { count: 'exact', head: true }),
    supabase.from('medicaments').select('id', { count: 'exact', head: true }),
    supabase.from('hopitaux').select('id', { count: 'exact', head: true }),
    supabase.from('urgences').select('id', { count: 'exact', head: true }),
  ])

  return {
    utilisateurs: users.count ?? 0,
    pharmacies: pharmacies.count ?? 0,
    medecins: medecins.count ?? 0,
    medicaments: medicaments.count ?? 0,
    hopitaux: hopitaux.count ?? 0,
    urgences: urgences.count ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la plateforme PharMaSen</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard icon="👥" label="Utilisateurs" value={stats.utilisateurs} color="blue" />
        <StatCard icon="🏥" label="Pharmacies" value={stats.pharmacies} color="green" />
        <StatCard icon="👨‍⚕️" label="Médecins" value={stats.medecins} color="teal" />
        <StatCard icon="💊" label="Médicaments" value={stats.medicaments} color="purple" />
        <StatCard icon="🏨" label="Hôpitaux" value={stats.hopitaux} color="orange" />
        <StatCard icon="🚨" label="Urgences" value={stats.urgences} color="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Bienvenue dans l'administration PharMaSen</h2>
        <p className="text-sm text-gray-500">
          Utilisez la barre de navigation à gauche pour gérer les utilisateurs, pharmacies, médicaments, médecins, hôpitaux et urgences.
        </p>
      </div>
    </div>
  )
}
