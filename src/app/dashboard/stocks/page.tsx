'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { StockPharmacie, Pharmacie, Medicament } from '@/types'

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockPharmacie[]>([])
  const [pharmacies, setPharmacies] = useState<Pick<Pharmacie, 'id' | 'nom'>[]>([])
  const [medicaments, setMedicaments] = useState<Pick<Medicament, 'id' | 'nom' | 'forme'>[]>([])
  const [selectedPharmacie, setSelectedPharmacie] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStock, setEditStock] = useState<StockPharmacie | null>(null)
  const [form, setForm] = useState({ prix: '', disponible: true, quantite: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    let query = supabase
      .from('stock_pharmacie')
      .select('*, pharmacies(id,nom), medicaments(id,nom,forme)')
      .order('created_at', { ascending: false })

    if (selectedPharmacie) query = query.eq('pharmacie_id', selectedPharmacie)

    const [stockRes, pharmRes, medRes] = await Promise.all([
      query,
      supabase.from('pharmacies').select('id,nom').order('nom'),
      supabase.from('medicaments').select('id,nom,forme').order('nom'),
    ])

    setStocks((stockRes.data as StockPharmacie[]) ?? [])
    setPharmacies(pharmRes.data ?? [])
    setMedicaments(medRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedPharmacie])

  function openEdit(s: StockPharmacie) {
    setEditStock(s)
    setForm({ prix: s.prix?.toString() ?? '', disponible: s.disponible, quantite: s.quantite?.toString() ?? '' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!editStock?.id) return
    setSaving(true)
    await supabase.from('stock_pharmacie').update({
      prix: form.prix ? parseFloat(form.prix) : null,
      disponible: form.disponible,
      quantite: form.quantite ? parseInt(form.quantite) : null,
    }).eq('id', editStock.id)
    setSaving(false); setModalOpen(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stocks</h1>
          <p className="text-sm text-gray-500 mt-1">{stocks.length} entrée{stocks.length !== 1 ? 's' : ''} de stock</p>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={selectedPharmacie}
          onChange={(e) => setSelectedPharmacie(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Toutes les pharmacies</option>
          {pharmacies.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <Table>
          <Thead>
            <Th>Pharmacie</Th><Th>Médicament</Th><Th>Forme</Th><Th>Prix (FCFA)</Th><Th>Quantité</Th><Th>Disponible</Th><Th>Actions</Th>
          </Thead>
          <Tbody>
            {stocks.map((s, idx) => (
              <Tr key={s.id ?? idx}>
                <Td><span className="font-medium text-gray-900">{(s.pharmacies as any)?.nom ?? '—'}</span></Td>
                <Td>{(s.medicaments as any)?.nom ?? '—'}</Td>
                <Td className="capitalize text-gray-500">{(s.medicaments as any)?.forme ?? '—'}</Td>
                <Td>{s.prix != null ? `${s.prix.toLocaleString('fr-SN')} FCFA` : <span className="text-gray-400">N/C</span>}</Td>
                <Td>{s.quantite != null ? s.quantite : <span className="text-gray-400">—</span>}</Td>
                <Td>{s.disponible ? <Badge variant="green">En stock</Badge> : <Badge variant="red">Indisponible</Badge>}</Td>
                <Td>
                  <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                </Td>
              </Tr>
            ))}
            {stocks.length === 0 && (
              <Tr><Td className="text-center text-gray-400 py-8" colSpan={7}>Aucun stock trouvé</Td></Tr>
            )}
          </Tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modifier le stock">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Médicament</p>
            <p className="text-sm text-gray-500">{(editStock?.medicaments as any)?.nom ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Pharmacie</p>
            <p className="text-sm text-gray-500">{(editStock?.pharmacies as any)?.nom ?? '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.prix} onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.quantite} onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))} placeholder="0" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.disponible} onChange={(e) => setForm((f) => ({ ...f, disponible: e.target.checked }))} className="accent-green-600" />
            Disponible en stock
          </label>
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
