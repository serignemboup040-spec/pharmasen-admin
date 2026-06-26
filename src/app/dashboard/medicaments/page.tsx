'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { Medicament } from '@/types'

const EMPTY: Omit<Medicament, 'id'> = {
  nom: '',
  forme: '',
  description: '',
  dosage: '',
  categorie: '',
  ordonnance_requise: false,
}

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([])
  const [filtered, setFiltered] = useState<Medicament[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('medicaments').select('*').order('nom')
    setMedicaments(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(medicaments); return }
    const q = search.toLowerCase()
    setFiltered(medicaments.filter((m) => m.nom.toLowerCase().includes(q) || m.categorie?.toLowerCase().includes(q)))
  }, [search, medicaments])

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(m: Medicament) {
    setEditing(m.id)
    setForm({ nom: m.nom, forme: m.forme, description: m.description ?? '', dosage: m.dosage ?? '', categorie: m.categorie ?? '', ordonnance_requise: m.ordonnance_requise })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, description: form.description || null, dosage: form.dosage || null, categorie: form.categorie || null }
    if (editing) await supabase.from('medicaments').update(payload).eq('id', editing)
    else await supabase.from('medicaments').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  async function handleDelete(id: string) {
    await supabase.from('medicaments').delete().eq('id', id)
    setDeleteId(null); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicaments</h1>
          <p className="text-sm text-gray-500 mt-1">{medicaments.length} médicament{medicaments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">+ Ajouter</button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Rechercher un médicament..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <Table>
          <Thead>
            <Th>Nom</Th><Th>Forme</Th><Th>Catégorie</Th><Th>Dosage</Th><Th>Ordonnance</Th><Th>Actions</Th>
          </Thead>
          <Tbody>
            {filtered.map((m) => (
              <Tr key={m.id}>
                <Td><span className="font-medium text-gray-900">{m.nom}</span></Td>
                <Td className="capitalize">{m.forme || '—'}</Td>
                <Td>{m.categorie || '—'}</Td>
                <Td>{m.dosage || '—'}</Td>
                <Td>{m.ordonnance_requise ? <Badge variant="orange">Oui</Badge> : <Badge variant="gray">Non</Badge>}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                    <button onClick={() => setDeleteId(m.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le médicament' : 'Ajouter un médicament'}>
        <div className="space-y-4">
          {[
            { field: 'nom', label: 'Nom *' },
            { field: 'forme', label: 'Forme (comprimé, sirop...)' },
            { field: 'categorie', label: 'Catégorie' },
            { field: 'dosage', label: 'Dosage' },
            { field: 'description', label: 'Description' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {field === 'description' ? (
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                  value={(form as any)[field] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={(form as any)[field] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.ordonnance_requise} onChange={(e) => setForm((f) => ({ ...f, ordonnance_requise: e.target.checked }))} className="accent-green-600" />
            Ordonnance requise
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.nom.trim()} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600 mb-6">Cette action est irréversible. Le médicament sera définitivement supprimé.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">Annuler</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition">Supprimer</button>
        </div>
      </Modal>
    </div>
  )
}
