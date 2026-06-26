'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import type { Hopital } from '@/types'

const EMPTY: Omit<Hopital, 'id'> = { nom: '', adresse: '', ville: '', telephone: '', specialites: [] }

export default function HopitauxPage() {
  const [hopitaux, setHopitaux] = useState<Hopital[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [specialitesText, setSpecialitesText] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('hopitaux').select('*').order('nom')
    setHopitaux(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setSpecialitesText(''); setModalOpen(true) }
  function openEdit(h: Hopital) {
    setEditing(h.id)
    setForm({ nom: h.nom, adresse: h.adresse, ville: h.ville, telephone: h.telephone ?? '', specialites: h.specialites ?? [] })
    setSpecialitesText((h.specialites ?? []).join(', '))
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const specialites = specialitesText.split(',').map((s) => s.trim()).filter(Boolean)
    const payload = { ...form, telephone: form.telephone || null, specialites }
    if (editing) await supabase.from('hopitaux').update(payload).eq('id', editing)
    else await supabase.from('hopitaux').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hôpitaux</h1>
          <p className="text-sm text-gray-500 mt-1">{hopitaux.length} hôpital{hopitaux.length !== 1 ? 'x' : ''}</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">+ Ajouter</button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <Table>
          <Thead>
            <Th>Nom</Th><Th>Adresse</Th><Th>Ville</Th><Th>Téléphone</Th><Th>Spécialités</Th><Th>Actions</Th>
          </Thead>
          <Tbody>
            {hopitaux.map((h) => (
              <Tr key={h.id}>
                <Td><span className="font-medium text-gray-900">{h.nom}</span></Td>
                <Td className="max-w-xs truncate">{h.adresse}</Td>
                <Td>{h.ville}</Td>
                <Td>{h.telephone ?? '—'}</Td>
                <Td>
                  {h.specialites?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {h.specialites.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {h.specialites.length > 3 && <span className="text-xs text-gray-400">+{h.specialites.length - 3}</span>}
                    </div>
                  ) : <span className="text-gray-400">—</span>}
                </Td>
                <Td>
                  <button onClick={() => openEdit(h)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                </Td>
              </Tr>
            ))}
            {hopitaux.length === 0 && (
              <Tr><Td className="text-center text-gray-400 py-8" colSpan={6}>Aucun hôpital</Td></Tr>
            )}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier l\'hôpital' : 'Ajouter un hôpital'}>
        <div className="space-y-4">
          {[
            { field: 'nom', label: 'Nom *' },
            { field: 'adresse', label: 'Adresse' },
            { field: 'ville', label: 'Ville' },
            { field: 'telephone', label: 'Téléphone' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={(form as any)[field] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spécialités (séparées par des virgules)</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={specialitesText} onChange={(e) => setSpecialitesText(e.target.value)} placeholder="Cardiologie, Pédiatrie, Chirurgie..." />
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
