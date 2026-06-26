'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { Pharmacie } from '@/types'

const EMPTY: Omit<Pharmacie, 'id'> = {
  nom: '',
  adresse: '',
  ville: '',
  telephone: '',
  est_de_garde: false,
  actif: true,
  verifie: false,
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacie[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('pharmacies')
      .select('*')
      .order('nom')
    setPharmacies(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  function openEdit(p: Pharmacie) {
    setEditing(p.id)
    setForm({ nom: p.nom, adresse: p.adresse, ville: p.ville, telephone: p.telephone ?? '', est_de_garde: p.est_de_garde, actif: p.actif ?? true, verifie: p.verifie ?? false })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, telephone: form.telephone || null }
    if (editing) {
      await supabase.from('pharmacies').update(payload).eq('id', editing)
    } else {
      await supabase.from('pharmacies').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  async function toggleActif(p: Pharmacie) {
    await supabase.from('pharmacies').update({ actif: !p.actif }).eq('id', p.id)
    load()
  }

  async function toggleVerifie(p: Pharmacie) {
    await supabase.from('pharmacies').update({ verifie: !p.verifie }).eq('id', p.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacies</h1>
          <p className="text-sm text-gray-500 mt-1">{pharmacies.length} pharmacie{pharmacies.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : (
        <Table>
          <Thead>
            <Th>Nom</Th>
            <Th>Adresse</Th>
            <Th>Ville</Th>
            <Th>Téléphone</Th>
            <Th>Garde</Th>
            <Th>Statut</Th>
            <Th>Actions</Th>
          </Thead>
          <Tbody>
            {pharmacies.map((p) => (
              <Tr key={p.id}>
                <Td><span className="font-medium text-gray-900">{p.nom}</span></Td>
                <Td className="max-w-xs truncate">{p.adresse}</Td>
                <Td>{p.ville}</Td>
                <Td>{p.telephone ?? '—'}</Td>
                <Td>{p.est_de_garde ? <Badge variant="green">Garde</Badge> : <Badge variant="gray">Non</Badge>}</Td>
                <Td>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={p.verifie ? 'blue' : 'yellow'}>{p.verifie ? 'Vérifié' : 'Non vérifié'}</Badge>
                    <Badge variant={p.actif !== false ? 'green' : 'red'}>{p.actif !== false ? 'Actif' : 'Inactif'}</Badge>
                  </div>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                    <button onClick={() => toggleVerifie(p)} className="text-xs text-purple-600 hover:underline">{p.verifie ? 'Dévérifier' : 'Vérifier'}</button>
                    <button onClick={() => toggleActif(p)} className="text-xs text-orange-600 hover:underline">{p.actif !== false ? 'Désactiver' : 'Activer'}</button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la pharmacie' : 'Ajouter une pharmacie'}>
        <div className="space-y-4">
          {(['nom', 'adresse', 'ville', 'telephone'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field === 'telephone' ? 'Téléphone' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={(form as any)[field] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder={field}
              />
            </div>
          ))}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.est_de_garde} onChange={(e) => setForm((f) => ({ ...f, est_de_garde: e.target.checked }))} className="accent-green-600" />
              De garde
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.verifie ?? false} onChange={(e) => setForm((f) => ({ ...f, verifie: e.target.checked }))} className="accent-green-600" />
              Vérifié
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.actif ?? true} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} className="accent-green-600" />
              Actif
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
