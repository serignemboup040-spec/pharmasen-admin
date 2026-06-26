'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/dashboard/users', label: 'Utilisateurs', icon: '👥' },
  { href: '/dashboard/pharmacies', label: 'Pharmacies', icon: '🏥' },
  { href: '/dashboard/medicaments', label: 'Médicaments', icon: '💊' },
  { href: '/dashboard/stocks', label: 'Stocks', icon: '📦' },
  { href: '/dashboard/medecins', label: 'Médecins', icon: '👨‍⚕️' },
  { href: '/dashboard/hopitaux', label: 'Hôpitaux', icon: '🏨' },
  { href: '/dashboard/urgences', label: 'Urgences', icon: '🚨' },
  { href: '/dashboard/creation-comptes', label: 'Création de comptes', icon: '➕' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">PharMaSen</p>
            <p className="text-xs text-gray-500">Administration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
