import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'

async function getUsers() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} patient{users.length !== 1 ? 's' : ''} inscrit{users.length !== 1 ? 's' : ''}</p>
      </div>

      <Table>
        <Thead>
          <Th>Nom</Th>
          <Th>Email</Th>
          <Th>Téléphone</Th>
          <Th>Date d'inscription</Th>
        </Thead>
        <Tbody>
          {users.length === 0 && (
            <Tr>
              <Td className="text-center text-gray-400 py-8" colSpan={4 as any}>
                Aucun utilisateur
              </Td>
            </Tr>
          )}
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>
                <span className="font-medium text-gray-900">
                  {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                </span>
              </Td>
              <Td>{u.email ?? '—'}</Td>
              <Td>{u.phone ?? '—'}</Td>
              <Td className="text-gray-500">
                {u.created_at
                  ? new Date(u.created_at).toLocaleDateString('fr-SN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}
