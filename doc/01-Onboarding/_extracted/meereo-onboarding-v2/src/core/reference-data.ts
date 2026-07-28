/**
 * DONNÉES DE RÉFÉRENCE — source unique des listes fermées.
 * Réfs : INS-11 (secteurs), MKT-06 §2 (taxonomie), MKT-01 (unités de vente).
 *
 * RÈGLE : aucune de ces listes n'est dupliquée dans un composant ou une requête.
 * Une liste recopiée quelque part est une seconde source de vérité (QAL-02).
 */

export const PRO_SECTORS = [
  { id: 'architecte-design', label: 'Architecte & Design' },
  { id: 'bet-structure',     label: 'BET Structure' },
  { id: 'bet-fluides',       label: 'BET Fluides' },
  { id: 'gros-oeuvre',       label: 'Gros œuvre' },
  { id: 'second-oeuvre',     label: 'Second œuvre' },
  { id: 'vrd',               label: 'VRD & Terrassement' },
  { id: 'electricite',       label: 'Électricité' },
  { id: 'plomberie',         label: 'Plomberie & Sanitaire' },
  { id: 'menuiserie',        label: 'Menuiserie' },
  { id: 'peinture',          label: 'Peinture & Finitions' },
] as const;
export type ProSectorId = (typeof PRO_SECTORS)[number]['id'];
export const PRO_SECTOR_IDS = PRO_SECTORS.map(s => s.id) as [ProSectorId, ...ProSectorId[]];

export const MARKETPLACE_CATEGORIES = [
  { id: 'ciment-liants',   label: 'Ciment & liants' },
  { id: 'granulats',       label: 'Granulats & sables' },
  { id: 'acier-ferraille', label: 'Acier & ferraillage' },
  { id: 'bois',            label: 'Bois & dérivés' },
  { id: 'carrelage',       label: 'Carrelage & revêtements' },
  { id: 'peinture',        label: 'Peintures & enduits' },
  { id: 'electricite',     label: 'Matériel électrique' },
  { id: 'plomberie',       label: 'Plomberie & sanitaire' },
  { id: 'menuiserie',      label: 'Menuiserie & fermetures' },
  { id: 'outillage',       label: 'Outillage & EPI' },
] as const;
export type CategoryId = (typeof MARKETPLACE_CATEGORIES)[number]['id'];
export const CATEGORY_IDS = MARKETPLACE_CATEGORIES.map(c => c.id) as [CategoryId, ...CategoryId[]];

/** MKT-01 énonce « unité, sac, m², tonne… » — liste explicitement ouverte.
 *  Les 7 dernières sont des propositions, signalées comme telles (A7.6, pt 4). */
export const SALE_UNITS = [
  { id: 'unite', label: 'Unité',  source: 'referentiel' },
  { id: 'sac',   label: 'Sac',    source: 'referentiel' },
  { id: 'm2',    label: 'm²',     source: 'referentiel' },
  { id: 'tonne', label: 'Tonne',  source: 'referentiel' },
  { id: 'm3',    label: 'm³',        source: 'proposition' },
  { id: 'ml',    label: 'Mètre linéaire', source: 'proposition' },
  { id: 'kg',    label: 'Kilogramme',     source: 'proposition' },
  { id: 'litre', label: 'Litre',          source: 'proposition' },
  { id: 'palette', label: 'Palette',      source: 'proposition' },
  { id: 'camion',  label: 'Camion',       source: 'proposition' },
  { id: 'lot',     label: 'Lot',          source: 'proposition' },
] as const;
export type SaleUnitId = (typeof SALE_UNITS)[number]['id'];
export const SALE_UNIT_IDS = SALE_UNITS.map(u => u.id) as [SaleUnitId, ...SaleUnitId[]];

export const PAYOUT_PROVIDERS = [
  { id: 'orange-money', label: 'Orange Money' },
  { id: 'mtn-momo',     label: 'MTN MoMo' },
  { id: 'wave',         label: 'Wave' },
  { id: 'moov-money',   label: 'Moov Money' },
] as const;
export type PayoutProviderId = (typeof PAYOUT_PROVIDERS)[number]['id'];
export const PAYOUT_PROVIDER_IDS = PAYOUT_PROVIDERS.map(p => p.id) as [PayoutProviderId, ...PayoutProviderId[]];

export const DELIVERY_MODES = [
  { id: 'livraison', label: 'Livraison' },
  { id: 'retrait',   label: 'Retrait sur site' },
] as const;
export type DeliveryModeId = (typeof DELIVERY_MODES)[number]['id'];
export const DELIVERY_MODE_IDS = DELIVERY_MODES.map(d => d.id) as [DeliveryModeId, ...DeliveryModeId[]];
