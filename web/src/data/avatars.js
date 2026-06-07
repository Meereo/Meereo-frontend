import { INTERVENANTS_DATA } from './intervenants'
import { ANNUAIRE_PLATEFORME } from './chantier'
import { CLIENTS_DATA } from './clients'

// Get avatar for any enterprise/person by name
// Returns { type: 'img'|'color'|null, value, initials }
export function getEntrepriseAvatar(nom) {
  if (!nom) return null
  const initials = nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

  // Check intervenants (photo)
  const inter = INTERVENANTS_DATA.find(i => i.nom === nom)
  if (inter?.photo) return { type: 'img', value: inter.photo, initials }

  // Check annuaire (colored initials)
  const partner = ANNUAIRE_PLATEFORME.find(p => p.nom === nom)
  if (partner) return { type: 'color', value: partner.color, initials }

  // Check clients
  const client = CLIENTS_DATA.find(c => c.nom === nom)
  if (client) {
    return { type: 'color', value: '#6B7280', initials }
  }

  return { type: null, initials }
}
