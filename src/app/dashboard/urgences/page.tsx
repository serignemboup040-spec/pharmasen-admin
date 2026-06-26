'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import type { Urgence } from '@/types'

const EMPTY: Omit<Urgence, 'id'> = { nom: '', numero: '', description: '', categorie: '' }

export default function UrgencesPage() {
  const [urgences, setUrgences] = useState<Urgence[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('urgences').select('*').order('nom')
    setUrgences(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(u: Urgence) {
    setEditing(u.id)
    setForm({ nom: u.nom, numero: u.numero, description: u.description ?? '', categorie: u.categorie ?? '' })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, description: form.description || null, categorie: form.categorie || null }
    if (editing) await supabase.from('urgences').update(payload).eq('id', editing)
    else await supabase.from('urgences').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Numéros d'urgence</h1>
          <p className="text-sm text-gray-500 mt-1">{urgences.length} numéro{urgences.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">+ Ajouter</button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <Table>
          <Thead>
            <Th>Nom</Th><Th>Numéro</Th><Th>Catégorie</Th><Th>Description</Th><Th>Actions</Th>
          </Thead>
          <Tbody>
            {urgences.map((u) => (
              <Tr key={u.id}>
                <Td><span className="font-medium text-gray-900">{u.nom}</span></Td>
                <Td>
                  <span className="font-bold text-red-600 text-base tracking-wide">{u.numero}</span>
                </Td>
                <Td>{u.categorie ?? '—'}</Td>
                <Td className="max-w-xs truncate text-gray-500">{u.description ?? '—'}</Td>
                <Td>
                  <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                </Td>
              </Tr>
            ))}
            {urgences.length === 0 && (
              <Tr><Td className="text-center text-gray-400 py-8" colSpan={5 as any}>Aucun numéro d'urgence</Td></Tr>
            )}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier le numéro d'urgence" : "Ajouter un numéro d'urgence"}>
        <div className="space-y-4">
          {[
            { field: 'nom', label: 'Service *' },
            { field: 'numero', label: 'Numéro *' },
            { field: 'categorie', label: 'Catégorie (Police, Pompiers, Médical...)' },
            { field: 'description', label: 'Description' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={(form as any)[field] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.nom.trim() || !form.numero.trim()} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
