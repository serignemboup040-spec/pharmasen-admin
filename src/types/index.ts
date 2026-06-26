export type Admin = {
  id: string
  email: string
  created_at: string
}

export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  created_at: string
}

export type Pharmacie = {
  id: string
  nom: string
  adresse: string
  ville: string
  telephone: string | null
  est_de_garde: boolean
  actif?: boolean
  verifie?: boolean
  created_at?: string
}

export type Medicament = {
  id: string
  nom: string
  forme: string
  description: string | null
  dosage: string | null
  categorie: string | null
  ordonnance_requise: boolean
}

export type StockPharmacie = {
  id?: string
  pharmacie_id: string
  medicament_id: string
  prix: number | null
  disponible: boolean
  quantite?: number | null
  pharmacies?: Pharmacie
  medicaments?: Medicament
}

export type Medecin = {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  specialite: string | null
  hopital_id: string | null
  verifie?: boolean
  actif?: boolean
  created_at?: string
}

export type Hopital = {
  id: string
  nom: string
  adresse: string
  ville: string
  telephone: string | null
  specialites?: string[]
  created_at?: string
}

export type Urgence = {
  id: string
  nom: string
  numero: string
  description: string | null
  categorie?: string
}

export type DashboardStats = {
  utilisateurs: number
  pharmacies: number
  medecins: number
  medicaments: number
  hopitaux: number
  urgences: number
}
