'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { Medecin } from '@/types'

const EMPTY: Omit<Medecin, 'id'> = {
  nom: '', prenom: '', email: '', telephone: '', specialite: '', hopital_id: null, verifie: false, actif: true,
}

export default function MedecinsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [hopitaux, setHopitaux] = useState<{ id: string; nom: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [medRes, hopRes] = await Promise.all([
      supabase.from('medecins').select('*').order('nom'),
      supabase.from('hopitaux').select('id,nom').order('nom'),
    ])
    setMedecins(medRes.data ?? [])
    setHopitaux(hopRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(m: Medecin) {
    setEditing(m.id)
    setForm({ nom: m.nom, prenom: m.prenom, email: m.email ?? '', telephone: m.telephone ?? '', specialite: m.specialite ?? '', hopital_id: m.hopital_id, verifie: m.verifie ?? false, actif: m.actif ?? true })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, email: form.email || null, telephone: form.telephone || null, specialite: form.specialite || null }
    if (editing) await supabase.from('medecins').update(payload).eq('id', editing)
    else await supabase.from('medecins').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  async function toggleVerifie(m: Medecin) {
    await supabase.from('medecins').update({ verifie: !m.verifie }).eq('id', m.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médecins</h1>
          <p className="text-sm text-gray-500 mt-1">{medecins.length} médecin{medecins.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">+ Ajouter</button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <Table>
          <Thead>
            <Th>Nom</Th><Th>Email</Th><Th>Téléphone</Th><Th>Spécialité</Th><Th>Statut</Th><Th>Actions</Th>
          </Thead>
          <Tbody>
            {medecins.map((m) => (
              <Tr key={m.id}>
                <Td><span className="font-medium text-gray-900">{m.prenom} {m.nom}</span></Td>
                <Td>{m.email ?? '—'}</Td>
                <Td>{m.telephone ?? '—'}</Td>
                <Td>{m.specialite ?? '—'}</Td>
                <Td>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={m.verifie ? 'blue' : 'yellow'}>{m.verifie ? 'Vérifié' : 'Non vérifié'}</Badge>
                    <Badge variant={m.actif !== false ? 'green' : 'red'}>{m.actif !== false ? 'Actif' : 'Inactif'}</Badge>
                  </div>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                    <button onClick={() => toggleVerifie(m)} className="text-xs text-purple-600 hover:underline">{m.verifie ? 'Dévérifier' : 'Vérifier'}</button>
                  </div>
                </Td>
              </Tr>
            ))}
            {medecins.length === 0 && (
              <Tr><Td className="text-center text-gray-400 py-8" colSpan={6 as any}>Aucun médecin</Td></Tr>
            )}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le médecin' : 'Ajouter un médecin'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['prenom', 'nom'].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f === 'prenom' ? 'Prénom' : 'Nom'}</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={(form as any)[f] ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))} />
              </div>
            ))}
          </div>
          {[
            { field: 'email', label: 'Email' },
            { field: 'telephone', label: 'Téléphone' },
            { field: 'specialite', label: 'Spécialité' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={(form as any)[field] ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hôpital</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" value={form.hopital_id ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, hopital_id: e.target.value || null }))}>
              <option value="">Aucun</option>
              {hopitaux.map((h) => <option key={h.id} value={h.id}>{h.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.verifie ?? false} onChange={(e) => setForm((prev) => ({ ...prev, verifie: e.target.checked }))} className="accent-green-600" />
              Vérifié
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.actif ?? true} onChange={(e) => setForm((prev) => ({ ...prev, actif: e.target.checked }))} className="accent-green-600" />
              Actif
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.nom.trim()} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
