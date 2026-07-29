import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react'
import {
  HardHat, Wrench, Shield, Layers, Droplets, Snowflake, Zap, Sun, Droplet, Leaf,
  Sofa, BedDouble, UtensilsCrossed, ChefHat, Briefcase, Armchair, Building2, Trees, Car,
  PanelTop, Lock, Package, CheckCircle2, Mail,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import compressImage from '../utils/compressImage'
import { api, setSuppressSessionExpired, setInMemoryToken } from '../services/api/client'
import { useMeereo } from '../hooks/useMeereoStore'
import CompanyLogo from '../components/shared/CompanyLogo'
import MeereoLogo from '../components/shared/MeereoLogo'
import useStepForm from '../hooks/useStepForm'
import '../styles/onboarding.css'

// ─── Référentiels — source unique (reference-data.ts du paquet) ─────────────
// Aucune de ces listes ne doit être dupliquée ailleurs (QAL-02).

const PRO_SECTEURS = [
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
]

const MARKETPLACE_CATEGORIES = [
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
]

const SALE_UNITS = [
  { id: 'unite',   label: 'Unité' },
  { id: 'sac',     label: 'Sac' },
  { id: 'm2',      label: 'm²' },
  { id: 'tonne',   label: 'Tonne' },
  { id: 'm3',      label: 'm³' },
  { id: 'ml',      label: 'Mètre linéaire' },
  { id: 'kg',      label: 'Kilogramme' },
  { id: 'litre',   label: 'Litre' },
  { id: 'palette', label: 'Palette' },
  { id: 'camion',  label: 'Camion' },
  { id: 'lot',     label: 'Lot' },
]

const DELIVERY_MODES = [
  { id: 'livraison', label: 'Livraison' },
  { id: 'retrait',   label: 'Retrait sur site' },
]

const PAYOUT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { id: 'mtn_momo',     label: 'MTN MoMo',     icon: '🟡' },
  { id: 'wave',         label: 'Wave',          icon: '🔵' },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: '🏦' },
]

// ─── UI Constants ───────────────────────────────────────────────────────────
// Couleurs de rôle v5 : Client #D9622B · Professionnel #743EE4 · Fournisseur #418FAF

const ROLE_META = {
  client:      { label: 'Client',       dataRole: 'client', color: '#D9622B' },
  pro:         { label: 'Professionnel', dataRole: 'pro',   color: '#743EE4' },
  fournisseur: { label: 'Fournisseur',  dataRole: 'four',   color: '#418FAF' },
}

const V5_ROLES = [
  { id: 'client', dataRole: 'client',
    title: 'Je suis client',
    desc: 'Pilotez votre projet de construction, rénovation ou aménagement avec clarté et suivi.',
    icon: <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>,
  },
  { id: 'pro', dataRole: 'pro',
    title: 'Je suis professionnel',
    desc: 'Architecte, entreprise, BET ou prestataire : centralisez missions, offres et équipes.',
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  },
  { id: 'fournisseur', dataRole: 'four',
    title: 'Je suis fournisseur',
    desc: 'Référencez vos produits et services, recevez des demandes et gérez vos commandes.',
    icon: <svg viewBox="0 0 24 24"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></svg>,
  },
]

const LOGO_COLORS = [
  {hex:'#1D1D1F',label:'Noir profond'},{hex:'#1D4ED8',label:'Bleu marine'},{hex:'#0891B2',label:'Bleu acier'},
  {hex:'#7C3AED',label:'Violet'},{hex:'#EA580C',label:'Terracotta'},{hex:'#16A34A',label:'Vert'},
  {hex:'#CA8A04',label:'Or'},{hex:'#BE185D',label:'Bordeaux'}
]
const LOGO_SHAPES = ['Hexagone','Cercle','Carré','Diamant','Triangle']
const LOGO_TYPOS = ['Gras','Serif','Léger']

const VILLES_CI = [
  'Abidjan','Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé',
  'Koumassi','Port-Bouët','Bingerville','Anyama','Songon',
  'Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo',
  'Abengourou','Grand-Bassam',
]

// Liste de pays (INS — le client n'est pas forcément en Afrique).
// Côte d'Ivoire en tête, puis reste du monde par ordre alphabétique.
const COUNTRIES = [
  "Côte d'Ivoire",
  'Afrique du Sud', 'Algérie', 'Allemagne', 'Angola', 'Arabie saoudite', 'Argentine',
  'Australie', 'Autriche', 'Bélgique', 'Bénin', 'Brésil', 'Burkina Faso', 'Cameroun',
  'Canada', 'Chine', 'Congo', 'Congo (RDC)', 'Corée du Sud', 'Danemark', 'Égypte',
  'Émirats arabes unis', 'Espagne', 'États-Unis', 'Éthiopie', 'Finlande', 'France',
  'Gabon', 'Ghana', 'Grèce', 'Guinée', 'Inde', 'Indonésie', 'Irlande', 'Italie',
  'Japon', 'Kenya', 'Liban', 'Libye', 'Luxembourg', 'Madagascar', 'Mali', 'Maroc',
  'Maurice', 'Mauritanie', 'Mexique', 'Niger', 'Nigéria', 'Norvège', 'Pays-Bas',
  'Pologne', 'Portugal', 'Qatar', 'République tchèque', 'Roumanie', 'Royaume-Uni',
  'Russie', 'Rwanda', 'Sénégal', 'Suède', 'Suisse', 'Tchad', 'Togo', 'Tunisie',
  'Turquie', 'Autre',
]

// Indicatifs téléphoniques — liste mondiale (Côte d'Ivoire en tête).
// NB : certains indicatifs sont partagés (+1, +7…) → on keye par `country`.
const PHONE_PREFIXES = [
  { code: '+225', flag: '🇨🇮', country: "Côte d'Ivoire" },
  { code: '+93',  flag: '🇦🇫', country: 'Afghanistan' },
  { code: '+27',  flag: '🇿🇦', country: 'Afrique du Sud' },
  { code: '+355', flag: '🇦🇱', country: 'Albanie' },
  { code: '+213', flag: '🇩🇿', country: 'Algérie' },
  { code: '+49',  flag: '🇩🇪', country: 'Allemagne' },
  { code: '+376', flag: '🇦🇩', country: 'Andorre' },
  { code: '+244', flag: '🇦🇴', country: 'Angola' },
  { code: '+1',   flag: '🇦🇬', country: 'Antigua-et-Barbuda' },
  { code: '+966', flag: '🇸🇦', country: 'Arabie saoudite' },
  { code: '+54',  flag: '🇦🇷', country: 'Argentine' },
  { code: '+374', flag: '🇦🇲', country: 'Arménie' },
  { code: '+61',  flag: '🇦🇺', country: 'Australie' },
  { code: '+43',  flag: '🇦🇹', country: 'Autriche' },
  { code: '+994', flag: '🇦🇿', country: 'Azerbaïdjan' },
  { code: '+1',   flag: '🇧🇸', country: 'Bahamas' },
  { code: '+973', flag: '🇧🇭', country: 'Bahreïn' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+1',   flag: '🇧🇧', country: 'Barbade' },
  { code: '+32',  flag: '🇧🇪', country: 'Belgique' },
  { code: '+501', flag: '🇧🇿', country: 'Belize' },
  { code: '+229', flag: '🇧🇯', country: 'Bénin' },
  { code: '+975', flag: '🇧🇹', country: 'Bhoutan' },
  { code: '+375', flag: '🇧🇾', country: 'Biélorussie' },
  { code: '+95',  flag: '🇲🇲', country: 'Birmanie' },
  { code: '+591', flag: '🇧🇴', country: 'Bolivie' },
  { code: '+387', flag: '🇧🇦', country: 'Bosnie-Herzégovine' },
  { code: '+267', flag: '🇧🇼', country: 'Botswana' },
  { code: '+55',  flag: '🇧🇷', country: 'Brésil' },
  { code: '+673', flag: '🇧🇳', country: 'Brunei' },
  { code: '+359', flag: '🇧🇬', country: 'Bulgarie' },
  { code: '+226', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', country: 'Burundi' },
  { code: '+855', flag: '🇰🇭', country: 'Cambodge' },
  { code: '+237', flag: '🇨🇲', country: 'Cameroun' },
  { code: '+1',   flag: '🇨🇦', country: 'Canada' },
  { code: '+238', flag: '🇨🇻', country: 'Cap-Vert' },
  { code: '+56',  flag: '🇨🇱', country: 'Chili' },
  { code: '+86',  flag: '🇨🇳', country: 'Chine' },
  { code: '+357', flag: '🇨🇾', country: 'Chypre' },
  { code: '+57',  flag: '🇨🇴', country: 'Colombie' },
  { code: '+269', flag: '🇰🇲', country: 'Comores' },
  { code: '+242', flag: '🇨🇬', country: 'Congo' },
  { code: '+243', flag: '🇨🇩', country: 'Congo (RDC)' },
  { code: '+82',  flag: '🇰🇷', country: 'Corée du Sud' },
  { code: '+850', flag: '🇰🇵', country: 'Corée du Nord' },
  { code: '+506', flag: '🇨🇷', country: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', country: 'Croatie' },
  { code: '+53',  flag: '🇨🇺', country: 'Cuba' },
  { code: '+45',  flag: '🇩🇰', country: 'Danemark' },
  { code: '+253', flag: '🇩🇯', country: 'Djibouti' },
  { code: '+1',   flag: '🇩🇲', country: 'Dominique' },
  { code: '+20',  flag: '🇪🇬', country: 'Égypte' },
  { code: '+971', flag: '🇦🇪', country: 'Émirats arabes unis' },
  { code: '+593', flag: '🇪🇨', country: 'Équateur' },
  { code: '+291', flag: '🇪🇷', country: 'Érythrée' },
  { code: '+34',  flag: '🇪🇸', country: 'Espagne' },
  { code: '+372', flag: '🇪🇪', country: 'Estonie' },
  { code: '+1',   flag: '🇺🇸', country: 'États-Unis' },
  { code: '+251', flag: '🇪🇹', country: 'Éthiopie' },
  { code: '+679', flag: '🇫🇯', country: 'Fidji' },
  { code: '+358', flag: '🇫🇮', country: 'Finlande' },
  { code: '+33',  flag: '🇫🇷', country: 'France' },
  { code: '+241', flag: '🇬🇦', country: 'Gabon' },
  { code: '+220', flag: '🇬🇲', country: 'Gambie' },
  { code: '+995', flag: '🇬🇪', country: 'Géorgie' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+30',  flag: '🇬🇷', country: 'Grèce' },
  { code: '+1',   flag: '🇬🇩', country: 'Grenade' },
  { code: '+502', flag: '🇬🇹', country: 'Guatemala' },
  { code: '+224', flag: '🇬🇳', country: 'Guinée' },
  { code: '+245', flag: '🇬🇼', country: 'Guinée-Bissau' },
  { code: '+240', flag: '🇬🇶', country: 'Guinée équatoriale' },
  { code: '+592', flag: '🇬🇾', country: 'Guyana' },
  { code: '+509', flag: '🇭🇹', country: 'Haïti' },
  { code: '+504', flag: '🇭🇳', country: 'Honduras' },
  { code: '+36',  flag: '🇭🇺', country: 'Hongrie' },
  { code: '+91',  flag: '🇮🇳', country: 'Inde' },
  { code: '+62',  flag: '🇮🇩', country: 'Indonésie' },
  { code: '+964', flag: '🇮🇶', country: 'Irak' },
  { code: '+98',  flag: '🇮🇷', country: 'Iran' },
  { code: '+353', flag: '🇮🇪', country: 'Irlande' },
  { code: '+354', flag: '🇮🇸', country: 'Islande' },
  { code: '+972', flag: '🇮🇱', country: 'Israël' },
  { code: '+39',  flag: '🇮🇹', country: 'Italie' },
  { code: '+1',   flag: '🇯🇲', country: 'Jamaïque' },
  { code: '+81',  flag: '🇯🇵', country: 'Japon' },
  { code: '+962', flag: '🇯🇴', country: 'Jordanie' },
  { code: '+7',   flag: '🇰🇿', country: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },
  { code: '+996', flag: '🇰🇬', country: 'Kirghizistan' },
  { code: '+686', flag: '🇰🇮', country: 'Kiribati' },
  { code: '+383', flag: '🇽🇰', country: 'Kosovo' },
  { code: '+965', flag: '🇰🇼', country: 'Koweït' },
  { code: '+856', flag: '🇱🇦', country: 'Laos' },
  { code: '+266', flag: '🇱🇸', country: 'Lesotho' },
  { code: '+371', flag: '🇱🇻', country: 'Lettonie' },
  { code: '+961', flag: '🇱🇧', country: 'Liban' },
  { code: '+231', flag: '🇱🇷', country: 'Libéria' },
  { code: '+218', flag: '🇱🇾', country: 'Libye' },
  { code: '+423', flag: '🇱🇮', country: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', country: 'Lituanie' },
  { code: '+352', flag: '🇱🇺', country: 'Luxembourg' },
  { code: '+389', flag: '🇲🇰', country: 'Macédoine du Nord' },
  { code: '+261', flag: '🇲🇬', country: 'Madagascar' },
  { code: '+60',  flag: '🇲🇾', country: 'Malaisie' },
  { code: '+265', flag: '🇲🇼', country: 'Malawi' },
  { code: '+960', flag: '🇲🇻', country: 'Maldives' },
  { code: '+223', flag: '🇲🇱', country: 'Mali' },
  { code: '+356', flag: '🇲🇹', country: 'Malte' },
  { code: '+212', flag: '🇲🇦', country: 'Maroc' },
  { code: '+692', flag: '🇲🇭', country: 'Îles Marshall' },
  { code: '+230', flag: '🇲🇺', country: 'Maurice' },
  { code: '+222', flag: '🇲🇷', country: 'Mauritanie' },
  { code: '+52',  flag: '🇲🇽', country: 'Mexique' },
  { code: '+691', flag: '🇫🇲', country: 'Micronésie' },
  { code: '+373', flag: '🇲🇩', country: 'Moldavie' },
  { code: '+377', flag: '🇲🇨', country: 'Monaco' },
  { code: '+976', flag: '🇲🇳', country: 'Mongolie' },
  { code: '+382', flag: '🇲🇪', country: 'Monténégro' },
  { code: '+258', flag: '🇲🇿', country: 'Mozambique' },
  { code: '+264', flag: '🇳🇦', country: 'Namibie' },
  { code: '+674', flag: '🇳🇷', country: 'Nauru' },
  { code: '+977', flag: '🇳🇵', country: 'Népal' },
  { code: '+505', flag: '🇳🇮', country: 'Nicaragua' },
  { code: '+227', flag: '🇳🇪', country: 'Niger' },
  { code: '+234', flag: '🇳🇬', country: 'Nigéria' },
  { code: '+47',  flag: '🇳🇴', country: 'Norvège' },
  { code: '+64',  flag: '🇳🇿', country: 'Nouvelle-Zélande' },
  { code: '+968', flag: '🇴🇲', country: 'Oman' },
  { code: '+256', flag: '🇺🇬', country: 'Ouganda' },
  { code: '+998', flag: '🇺🇿', country: 'Ouzbékistan' },
  { code: '+92',  flag: '🇵🇰', country: 'Pakistan' },
  { code: '+680', flag: '🇵🇼', country: 'Palaos' },
  { code: '+970', flag: '🇵🇸', country: 'Palestine' },
  { code: '+507', flag: '🇵🇦', country: 'Panama' },
  { code: '+675', flag: '🇵🇬', country: 'Papouasie-Nouvelle-Guinée' },
  { code: '+595', flag: '🇵🇾', country: 'Paraguay' },
  { code: '+31',  flag: '🇳🇱', country: 'Pays-Bas' },
  { code: '+51',  flag: '🇵🇪', country: 'Pérou' },
  { code: '+63',  flag: '🇵🇭', country: 'Philippines' },
  { code: '+48',  flag: '🇵🇱', country: 'Pologne' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+974', flag: '🇶🇦', country: 'Qatar' },
  { code: '+236', flag: '🇨🇫', country: 'République centrafricaine' },
  { code: '+1',   flag: '🇩🇴', country: 'République dominicaine' },
  { code: '+420', flag: '🇨🇿', country: 'République tchèque' },
  { code: '+40',  flag: '🇷🇴', country: 'Roumanie' },
  { code: '+44',  flag: '🇬🇧', country: 'Royaume-Uni' },
  { code: '+7',   flag: '🇷🇺', country: 'Russie' },
  { code: '+250', flag: '🇷🇼', country: 'Rwanda' },
  { code: '+1',   flag: '🇰🇳', country: 'Saint-Kitts-et-Nevis' },
  { code: '+1',   flag: '🇱🇨', country: 'Sainte-Lucie' },
  { code: '+378', flag: '🇸🇲', country: 'Saint-Marin' },
  { code: '+1',   flag: '🇻🇨', country: 'Saint-Vincent-et-les-Grenadines' },
  { code: '+503', flag: '🇸🇻', country: 'Salvador' },
  { code: '+685', flag: '🇼🇸', country: 'Samoa' },
  { code: '+239', flag: '🇸🇹', country: 'Sao Tomé-et-Principe' },
  { code: '+221', flag: '🇸🇳', country: 'Sénégal' },
  { code: '+381', flag: '🇷🇸', country: 'Serbie' },
  { code: '+248', flag: '🇸🇨', country: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', country: 'Sierra Leone' },
  { code: '+65',  flag: '🇸🇬', country: 'Singapour' },
  { code: '+421', flag: '🇸🇰', country: 'Slovaquie' },
  { code: '+386', flag: '🇸🇮', country: 'Slovénie' },
  { code: '+252', flag: '🇸🇴', country: 'Somalie' },
  { code: '+249', flag: '🇸🇩', country: 'Soudan' },
  { code: '+211', flag: '🇸🇸', country: 'Soudan du Sud' },
  { code: '+94',  flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+46',  flag: '🇸🇪', country: 'Suède' },
  { code: '+41',  flag: '🇨🇭', country: 'Suisse' },
  { code: '+597', flag: '🇸🇷', country: 'Suriname' },
  { code: '+268', flag: '🇸🇿', country: 'Eswatini' },
  { code: '+963', flag: '🇸🇾', country: 'Syrie' },
  { code: '+992', flag: '🇹🇯', country: 'Tadjikistan' },
  { code: '+255', flag: '🇹🇿', country: 'Tanzanie' },
  { code: '+235', flag: '🇹🇩', country: 'Tchad' },
  { code: '+66',  flag: '🇹🇭', country: 'Thaïlande' },
  { code: '+670', flag: '🇹🇱', country: 'Timor oriental' },
  { code: '+228', flag: '🇹🇬', country: 'Togo' },
  { code: '+676', flag: '🇹🇴', country: 'Tonga' },
  { code: '+1',   flag: '🇹🇹', country: 'Trinité-et-Tobago' },
  { code: '+216', flag: '🇹🇳', country: 'Tunisie' },
  { code: '+993', flag: '🇹🇲', country: 'Turkménistan' },
  { code: '+90',  flag: '🇹🇷', country: 'Turquie' },
  { code: '+688', flag: '🇹🇻', country: 'Tuvalu' },
  { code: '+380', flag: '🇺🇦', country: 'Ukraine' },
  { code: '+598', flag: '🇺🇾', country: 'Uruguay' },
  { code: '+678', flag: '🇻🇺', country: 'Vanuatu' },
  { code: '+379', flag: '🇻🇦', country: 'Vatican' },
  { code: '+58',  flag: '🇻🇪', country: 'Venezuela' },
  { code: '+84',  flag: '🇻🇳', country: 'Viêt Nam' },
  { code: '+967', flag: '🇾🇪', country: 'Yémen' },
  { code: '+260', flag: '🇿🇲', country: 'Zambie' },
  { code: '+263', flag: '🇿🇼', country: 'Zimbabwe' },
]

const FRN_ZONE_SECTIONS = [
  {title:'Abidjan & communes',zones:['Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé','Koumassi','Port-Bouët','Bingerville','Anyama','Songon']},
  {title:'Grandes villes',zones:['Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo','Abengourou','Grand-Bassam']},
  {title:'Sud & Lagunes',zones:['Dabou','Jacqueville','Tiassalé','Agboville','Adzopé','Aboisso','Bonoua']},
  {title:'Centre & Nord',zones:['Toumodi','Dimbokro','Bondoukou','Katiola','Ferkessédougou','Odienné','Séguéla','Mankono']},
  {title:'Ouest & Sud-Ouest',zones:['Soubré','Sassandra','Tabou','Guiglo','Duékoué','Danané','Issia']},
  {title:'Couverture',zones:['Tout le territoire national','Zones rurales & villages']},
]

// ─── Regex format RCCM / NCC (validation visuelle uniquement — INS-01) ─────
const RCCM_RE = /^CI-ABJ-\d{4}-[A-Z]-\d{4,6}$/
const TAX_RE = /^CI-\d{7}-[A-Z]$/

// ─── SVG Components ─────────────────────────────────────────────────────────

const LogoSVG = () => <MeereoLogo size={36} />
const CheckSVG = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ArrowSVG = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>

// ─── Page Header (gabarit unique v5 — 15 écrans) ───────────────────────────

const PageHeader = memo(function PageHeader() {
  return (
    <header className="page-head">
      <div className="ph-brand">
        <div className="ph-mark">MEE<br/>REO</div>
        <div className="ph-name">MEEREO</div>
        <div className="ph-sep" />
        <div className="ph-kind">Plateforme BTP et immobilier</div>
      </div>
      <p className="ph-tag">Tout votre projet, piloté d'un seul endroit.</p>
      <div className="ph-pillars">
        <span className="ph-p">Appels d'offres</span>
        <span className="ph-p">Marketplace</span>
        <span className="ph-p">Paiements</span>
        <span className="ph-p is-kai">KAi, votre IA personnelle</span>
      </div>
    </header>
  )
})

// ─── Stepper (barre d'étapes horizontale, couleur du rôle) ─────────────────

function Stepper({ total, current }) {
  return (
    <div className="ob-stepper-v5">
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1
        const cls = idx < current ? 'on' : idx === current ? 'now' : ''
        return <i key={i} className={cls} />
      })}
    </div>
  )
}

// ─── Shared Components ──────────────────────────────────────────────────────

const Field = ({label,required,error,hint,children}) => (
  <div className="ob-field">
    <label className="ob-label-v2">{label}{required&&' *'}</label>
    {children}
    {hint && !error && <div style={{fontSize:10,color:'var(--t4)',marginTop:2}}>{hint}</div>}
    {error && <div style={{fontSize:11,color:'#EF4444',marginTop:3}}>{error}</div>}
  </div>
)

const Chips = ({ items, selected, onToggle, multi = true }) => (
  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
    {items.map(item => {
      const label = typeof item === 'string' ? item : item.label
      const value = typeof item === 'string' ? item : item.id || item.label
      const active = multi ? selected.includes(value) : selected === value
      return (
        <button key={value} type="button" className={`ob-chip ${active ? 'active' : ''}`}
          onClick={() => onToggle(value)}>
          {typeof item === 'object' && item.em && <span style={{marginRight:4}}>{item.em}</span>}
          {label}
        </button>
      )
    })}
  </div>
)

// ─── Validation helpers ─────────────────────────────────────────────────────

const required = (v) => (!v || !String(v).trim()) ? 'Champ requis' : null
const validEmail = (v) => (!v || !v.includes('@') || !v.includes('.')) ? 'Email invalide' : null
const validPhone = (v) => {
  if (!v?.trim()) return 'Téléphone requis'
  const digits = v.replace(/\D/g, '')
  if (digits.length < 6) return 'Au moins 6 chiffres'
  if (digits.length > 15) return '15 chiffres maximum'
  return null
}
const validPassword = (v) => {
  if (!v) return 'Mot de passe requis'
  if (v.length < 10) return 'Au moins 10 caractères'
  if (!/[a-zA-Z]/.test(v)) return 'Au moins une lettre'
  if (!/\d/.test(v)) return 'Au moins un chiffre'
  return null
}
const passwordsMatch = (_v, all) => {
  if (all.password && all.passwordConfirm && all.password !== all.passwordConfirm) return 'Ne correspondent pas'
  return null
}
const requireCgu = (v) => !v ? 'Acceptation requise' : null
const requireArr = (msg) => (v) => (!v || v.length === 0) ? msg : null

// ─── Step validation schemas — source : schemas.ts du paquet ────────────────
// L'état du bouton est DÉRIVÉ de ces schémas (INS-06). Jamais posé à la main.

const SCHEMAS = {
  // AccountStep — all roles (INS-08 : ville obligatoire pour pro/fournisseur)
  client_account: {
    prenom: required, nom: required, tel: validPhone,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  pro_account: {
    entreprise: required, tel: validPhone, ville: required,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  fournisseur_account: {
    entreprise: required, tel: validPhone, ville: required,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },

  // ProStructureStep — raison sociale, RCCM, NCC, secteurs (INS-01, INS-11)
  pro_structure: {
    entreprise: required,
    rccm: required,
    ncc: required,
    secteurs: requireArr('Au moins un secteur'),
  },

  // SupplierStructureStep — identité + catégories + livraison (MKT-06 §2-3)
  fournisseur_structure: {
    entreprise: required,
    rccm: required,
    ncc: required,
    categories: requireArr('Au moins une catégorie'),
    deliveryModes: requireArr('Au moins un mode de livraison'),
    zones: requireArr('Au moins une zone'),
  },

  // LogoStep — franchissable (INS-12)
  pro_logo: {},
  fournisseur_logo: {},

  // SupplierPayoutStep — obligatoire (MKT-06 §4)
  fournisseur_payout: {
    payoutType: (v) => !v ? 'Opérateur requis' : null,
    payoutPhone: validPhone,
    payoutHolder: required,
  },

  // SupplierProductStep — facultatif (arbitrage 9)
  fournisseur_product: {},
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function Onboarding() {
  const navigate = useNavigate()
  const { loginUser, showToast } = useMeereo()

  // ─── State ──────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState('auth')   // auth | wizard | done
  const [authView, setAuthView] = useState('login') // login | forgot | sent | role
  const [userType, setUserType] = useState(null)  // pro | client | fournisseur
  const [selectedRole, setSelectedRole] = useState('client') // role selection on role screen
  const [wizStep, setWizStep] = useState(1)
  const [steps, setSteps] = useState([])          // from GET /api/onboarding/steps/:role
  const [stepsLoading, setStepsLoading] = useState(false)
  const [draftId, setDraftId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneData, setDoneData] = useState(null)  // { email, warnings }

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')

  // Form state — single object for all roles
  const [form, setForm] = useState({
    // AccountStep (all roles)
    prenom: '', nom: '', email: '', tel: '', telPrefix: '+225',
    ville: '', pays: "Côte d'Ivoire",
    password: '', passwordConfirm: '', cgu: false, comms: false,
    // ProStructureStep / SupplierStructureStep
    entreprise: '', rccm: '', ncc: '',
    secteurs: [],
    // SupplierStructureStep extra fields
    categories: [], deliveryModes: [], zones: [], delaiLivraison: '',
    // Photo de profil (client — INS)
    photoUrl: null,
    // LogoStep
    logoColor: '#1D1D1F', logoShape: 'Hexagone', logoTypo: 'Gras', logoTab: 'generate', logoFileUrl: null,
    // SupplierPayoutStep (MKT-06 §4)
    payoutType: '', payoutPhone: '', payoutHolder: '',
    // SupplierProductStep (facultatif — arbitrage 9)
    productName: '', productCategory: '', productUnit: '', productStock: '',
    pricingMode: 'FIXED', productPrice: '',
  })

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])
  const toggleArr = useCallback((k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  })), [])

  // ─── Step validation ──────────────────────────────────────────────────
  const currentStepKey = steps[wizStep - 1]?.key
  const schemaKey = userType && currentStepKey ? `${userType}_${currentStepKey}` : null
  const schema = useMemo(() => (schemaKey ? SCHEMAS[schemaKey] || null : null), [schemaKey])
  const { isValid } = useStepForm(form, schema)

  // ─── Role metadata ───────────────────────────────────────────────────
  // Sur l'écran de sélection, userType est encore null : on thème depuis
  // selectedRole pour que la couleur du bouton change dès la sélection (INS).
  const themeRole = userType || selectedRole
  const roleMeta = ROLE_META[themeRole] || ROLE_META.client
  const dataActiveRole = roleMeta?.dataRole || 'client'
  // Total steps including "role" as step 1
  const totalSteps = steps.length + 1
  // Current step index (role=1, then wizard steps)
  const currentStepIdx = wizStep + 1

  // ─── Fetch steps from API when role is selected (INS-15) ──────────────
  useEffect(() => {
    if (!userType) return
    let cancelled = false
    setStepsLoading(true)
    api.onboarding.steps(userType)
      .then(data => { if (!cancelled) setSteps(data.steps || []) })
      .catch(() => { if (!cancelled) setSteps([]) })
      .finally(() => { if (!cancelled) setStepsLoading(false) })
    return () => { cancelled = true }
  }, [userType])

  // ─── Save draft to server at each step transition (INS-13) ────────────
  const saveDraft = useCallback(async (currentForm) => {
    try {
      const { password, passwordConfirm, ...safeData } = currentForm
      const res = await api.onboarding.createDraft({
        email: currentForm.email || undefined,
        role: userType,
        data: safeData,
        draftId: draftId || undefined,
      })
      const draft = res.draft
      if (draft?.id && !draftId) setDraftId(draft.id)
    } catch {
      // Draft save failure is non-blocking (INS-13)
    }
  }, [userType, draftId])

  // ─── Navigation ───────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (!isValid) return
    saveDraft(form)
    if (wizStep < steps.length) {
      setWizStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }, [isValid, wizStep, steps.length, form])

  const goBack = useCallback(() => {
    if (wizStep > 1) setWizStep(s => s - 1)
    else { setScreen('auth'); setAuthView('role'); setSteps([]) }
  }, [wizStep])

  const startWizard = useCallback((type) => {
    setSteps([])
    setUserType(type)
    setScreen('wizard')
    setWizStep(1)
    setSuppressSessionExpired(true)
  }, [])

  // ─── Logo upload ──────────────────────────────────────────────────────
  const handleLogoUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 10 * 1024 * 1024) { showToast('Fichier trop volumineux — 10 Mo max', 'red'); return }
    const compressed = await compressImage(f, 200, 0.85)
    set('logoFileUrl', compressed)
    set('logoTab', 'upload')
    try {
      const fd = new FormData(); fd.append('logo', f)
      const res = await api.onboarding.uploadLogo(fd)
      if (res.url) set('logoFileUrl', res.url)
    } catch { /* keep compressed preview */ }
  }

  // ─── Photo de profil client (réutilise l'endpoint /onboarding/logo) ───
  const handlePhotoUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 10 * 1024 * 1024) { showToast('Fichier trop volumineux — 10 Mo max', 'red'); return }
    const compressed = await compressImage(f, 400, 0.85)
    set('photoUrl', compressed)
    try {
      const fd = new FormData(); fd.append('logo', f)
      const res = await api.onboarding.uploadLogo(fd)
      if (res.url) set('photoUrl', res.url)
    } catch { /* on conserve l'aperçu compressé */ }
  }

  // ─── Submit (NAV-07 : session ouverte dans la même réponse) ───────────
  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const name = userType === 'client'
        ? `${form.prenom} ${form.nom}`.trim()
        : form.entreprise || `${form.prenom} ${form.nom}`.trim()

      const payload = {
        email: form.email,
        password: form.password,
        name,
        type: userType,
        company: form.entreprise || undefined,
        phone: `${form.telPrefix} ${form.tel}`.trim(),
        ville: form.ville,
        draftId: draftId || undefined,
      }

      // Profile fields
      const profile = {}
      if (userType === 'pro') {
        Object.assign(profile, {
          entreprise: form.entreprise, ville: form.ville, pays: form.pays,
          rccm: form.rccm, ncc: form.ncc,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          secteurs: form.secteurs,
          logoColor: form.logoColor, logoShape: form.logoShape, logoTypo: form.logoTypo,
          logoFileUrl: form.logoTab === 'upload' ? form.logoFileUrl : undefined,
          activeLogoType: form.logoTab === 'upload' && form.logoFileUrl ? 'uploaded' : 'generated',
        })
      } else if (userType === 'client') {
        Object.assign(profile, {
          prenom: form.prenom, nom: form.nom,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          ville: form.ville, pays: form.pays,
          photoUrl: form.photoUrl || undefined,
        })
      } else if (userType === 'fournisseur') {
        Object.assign(profile, {
          entreprise: form.entreprise, ville: form.ville, pays: form.pays,
          rccm: form.rccm, ncc: form.ncc,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          logoColor: form.logoColor, logoShape: form.logoShape, logoTypo: form.logoTypo,
          logoFileUrl: form.logoTab === 'upload' ? form.logoFileUrl : undefined,
          categories: form.categories, zones: form.zones,
          delaiLivraison: form.delaiLivraison || undefined,
        })
      }
      payload.profile = profile

      // Entreprise entity (pro/fournisseur — INS-20)
      if ((userType === 'pro' || userType === 'fournisseur') && form.entreprise) {
        payload.entreprise = {
          legalName: form.entreprise,
          rccm: form.rccm || undefined,
          ncc: form.ncc || undefined,
        }
      }

      // PayoutMethod (fournisseur — MKT-06 §4)
      if (userType === 'fournisseur' && form.payoutType) {
        payload.payoutMethod = {
          type: form.payoutType,
          label: form.payoutHolder || form.payoutType,
          details: form.payoutPhone ? { phone: form.payoutPhone } : {},
        }
      }

      // First product (facultatif — arbitrage 9, FIN-04 : zéro ≠ sur devis)
      if (userType === 'fournisseur' && form.productName?.trim()) {
        const price = form.pricingMode === 'FIXED' ? (parseFloat(form.productPrice) || undefined) : undefined
        payload.firstProduct = {
          name: form.productName,
          category: form.productCategory || '',
          price,
          unit: form.productUnit || 'unite',
        }
      }

      const res = await api.onboarding.submit(payload)

      // Session opened by API (NAV-07)
      if (res.token) {
        setInMemoryToken(res.token)
        try { sessionStorage.setItem('meereo_session_token', res.token) } catch {}
      }
      if (res.user) {
        try { sessionStorage.setItem('meereo_cached_user', JSON.stringify(res.user)) } catch {}
      }

      setSuppressSessionExpired(false)

      // INS — connexion automatique + redirection vers la plateforme.
      // On établit la session DANS le store React (store.user), sinon les
      // gardes de route (RoleGuard) éjectent l'utilisateur vers l'inscription.
      showToast('Compte créé — bienvenue sur MEEREO !', 'green')
      const dest = userType === 'client' ? '/client'
        : userType === 'fournisseur' ? '/fournisseur' : '/cockpit'
      let logged = null
      try { logged = await loginUser(form.email, form.password) } catch { /* repli ci-dessous */ }
      if (logged) { navigate(dest); return }

      // Repli : la session cookie/Bearer est déjà ouverte — on montre l'écran
      // de fin, dont les boutons rechargent en dur (le boot ré-hydrate alors
      // la session et redirige proprement vers la plateforme).
      const warnings = []
      if (userType === 'fournisseur' && !form.productName?.trim()) {
        warnings.push('Catalogue vide — ajoutez vos premiers produits depuis votre espace.')
      }
      if (userType !== 'client' && !(form.logoTab === 'upload' && form.logoFileUrl)) {
        warnings.push('Page publique créée en brouillon. Elle ne sera visible qu\'une fois publiée.')
      }

      setDoneData({ email: form.email, warnings })
      setScreen('done')
    } catch (err) {
      // INS-06 — une erreur ramène à son étape (step, field)
      if (err.status === 409) {
        showToast(err.message || 'Conflit — email ou RCCM déjà utilisé', 'red')
        const accountStep = steps.findIndex(s => s.key === 'account')
        if (accountStep >= 0) setWizStep(accountStep + 1)
      } else if (err.status === 422 && err.errors) {
        const first = err.errors[0]
        showToast(first?.message || 'Données invalides', 'red')
        setWizStep(1)
      } else {
        showToast(err.message || 'Erreur lors de la création du compte', 'red')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginEmail) { showToast('Saisissez votre email', 'orange'); return }
    if (!loginPassword) { showToast('Mot de passe requis', 'orange'); return }
    try {
      const user = await loginUser(loginEmail, loginPassword)
      if (!user) { showToast('Aucun compte trouvé', 'orange'); return }
      showToast('Connexion réussie !', 'green')
      const t = user?.type
      navigate(t === 'client' ? '/client' : t === 'fournisseur' ? '/fournisseur' : '/cockpit')
    } catch (e) {
      showToast(e.message || 'Erreur de connexion', 'red')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="onboarding-shell" data-active-role={dataActiveRole}>

      {/* ════ AUTH SCREENS (login / forgot / sent / role) ════ */}
      {screen === 'auth' && (
        <div className="ob-screen">
          <PageHeader />

          {/* ── LOGIN ── */}
          {authView === 'login' && (
            <div className="ob-card-v5">
              <div className="ob-eyebrow-v5">Connexion</div>
              <h1 className="ob-title-v5">Bienvenue.</h1>
              <p className="ob-lede-v5">Heureux de vous revoir.</p>

              <div className="ob-field">
                <label className="ob-label-v5">Email</label>
                <input className="ob-input-v5" type="email" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)} placeholder="contact@entreprise.com"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="ob-field">
                <div className="ob-label-row-v5">
                  <label className="ob-label-v5" style={{marginBottom:0}}>Mot de passe</label>
                  <span className="ob-link-v5" onClick={() => setAuthView('forgot')}>Mot de passe oublié ?</span>
                </div>
                <div style={{position:'relative',marginTop:8}}>
                  <input className="ob-input-v5" type={showLoginPwd ? 'text' : 'password'}
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{paddingRight:60}} />
                  <button type="button" className="ob-reveal-v5" onClick={() => setShowLoginPwd(!showLoginPwd)}>
                    {showLoginPwd ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>

              <button className="ob-btn-role" style={{background:'var(--ink)',marginTop:8}} onClick={handleLogin}>
                Connexion
              </button>
              <div className="ob-divider-v5">ou</div>
              <button className="ob-btn-sec-v5" style={{width:'100%'}} onClick={() => setAuthView('role')}>
                Créer un espace
              </button>
              <div className="ob-trust">
                <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                Connexion sécurisée · SSL · RGPD
              </div>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {authView === 'forgot' && (
            <div className="ob-card-v5">
              <div className="ob-eyebrow-v5">Récupération</div>
              <h1 className="ob-title-v5">Mot de passe oublié.</h1>
              <p className="ob-lede-v5">Saisissez votre email : nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

              <div className="ob-field">
                <label className="ob-label-v5">Email</label>
                <input className="ob-input-v5" type="email" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)} placeholder="contact@entreprise.com"
                  onKeyDown={e => e.key === 'Enter' && setAuthView('sent')} />
              </div>
              <button className="ob-btn-role" style={{background:'var(--ink)',marginTop:8}}
                onClick={() => setAuthView('sent')}>
                Envoyer le lien
              </button>
              <div className="ob-foot-v5">
                ← <span className="link" onClick={() => setAuthView('login')}>Retour à la connexion</span>
              </div>
            </div>
          )}

          {/* ── EMAIL SENT ── */}
          {authView === 'sent' && (
            <div className="ob-card-v5">
              <div className="ob-eyebrow-v5">Récupération</div>
              <h1 className="ob-title-v5">Vérifiez vos emails.</h1>
              <p className="ob-lede-v5">Un lien de réinitialisation vient d'être envoyé. Il est valable 30 minutes.</p>

              <div className="ob-msg-ok">
                <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
                <span>Si aucun email n'arrive, vérifiez vos spams ou réessayez dans quelques instants.</span>
              </div>
              <div className="ob-foot-v5">
                ← <span className="link" onClick={() => setAuthView('login')}>Retour à la connexion</span>
              </div>
            </div>
          )}

          {/* ── ROLE SELECTION (Vous êtes…) ── */}
          {authView === 'role' && (
            <div className="ob-card-v5 wide">
              <div className="ob-eyebrow-v5">
                <span>Inscription</span>
                <span className="ob-step-count-v5">Étape 1</span>
              </div>
              <h1 className="ob-title-v5">Vous êtes…</h1>
              <p className="ob-lede-v5">Choisissez le rôle qui correspond à votre activité. Votre parcours sera adapté.</p>

              <div className="ob-roles-v5">
                {V5_ROLES.map(r => (
                  <div key={r.id} className={`ob-role-v5 ${selectedRole === r.id ? 'sel' : ''}`}
                    data-role={r.dataRole}
                    onClick={() => setSelectedRole(r.id)}>
                    <div className="ob-role-ic-v5">{r.icon}</div>
                    <div style={{flex:1}}>
                      <div className="ob-role-t-v5">{r.title}</div>
                      <div className="ob-role-d-v5">{r.desc}</div>
                    </div>
                    <div className="ob-role-radio-v5" />
                  </div>
                ))}
              </div>

              <button className="ob-btn-role" style={{marginTop:8}}
                onClick={() => startWizard(selectedRole)}>
                Continuer →
              </button>
              <div className="ob-foot-v5">
                Déjà un compte ? <span className="link" onClick={() => setAuthView('login')}>Se connecter</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ WIZARD SCREEN — loading state ════ */}
      {screen === 'wizard' && stepsLoading && (
        <div className="ob-screen">
          <PageHeader />
          <div className="ob-card-v5 wide" style={{textAlign:'center',padding:'60px 40px'}}>
            <div className="ob-eyebrow-v5">
              <span>Inscription · <span className="ob-role-dot">{roleMeta.label}</span></span>
            </div>
            <p className="ob-lede-v5" style={{marginTop:20}}>Chargement du formulaire…</p>
          </div>
        </div>
      )}

      {/* ════ WIZARD SCREEN — error state (API failed, no steps) ════ */}
      {screen === 'wizard' && !stepsLoading && steps.length === 0 && (
        <div className="ob-screen">
          <PageHeader />
          <div className="ob-card-v5 wide" style={{textAlign:'center',padding:'60px 40px'}}>
            <div className="ob-eyebrow-v5">
              <span>Inscription · <span className="ob-role-dot">{roleMeta.label}</span></span>
            </div>
            <h1 className="ob-title-v5">Oups.</h1>
            <p className="ob-lede-v5">Impossible de charger le formulaire. Vérifiez votre connexion et réessayez.</p>
            <div className="wiz-nav-v5">
              <button className="ob-btn-out" style={{flex:1}} onClick={goBack}>← Retour</button>
              <button className="ob-btn-role" style={{flex:1}} onClick={() => {
                setStepsLoading(true)
                api.onboarding.steps(userType)
                  .then(data => setSteps(data.steps || []))
                  .catch(() => setSteps([]))
                  .finally(() => setStepsLoading(false))
              }}>Réessayer</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ WIZARD SCREEN (single column + stepper) ════ */}
      {screen === 'wizard' && !stepsLoading && steps.length > 0 && (
        <div className="ob-screen">
          <PageHeader />
          <div className="ob-card-v5 wide">
            <div className="ob-eyebrow-v5">
              <span>Inscription · <span className="ob-role-dot">{roleMeta.label}</span></span>
              <span className="ob-step-count-v5">Étape {currentStepIdx}</span>
            </div>
            <Stepper total={totalSteps} current={currentStepIdx} />

            <h1 className="ob-title-v5">{steps[wizStep-1]?.label ? `${steps[wizStep-1].label}.` : ''}</h1>

            {/* ── STEP CONTENT ── */}
            {renderStep(userType, currentStepKey, form, set, toggleArr, handleLogoUpload, handlePhotoUpload)}

            {/* ── NAVIGATION ── */}
            <div className="wiz-nav-v5">
              <button className="ob-btn-out" style={{flex:2}} onClick={goBack}>
                {wizStep === 1 ? '← Rôle' : '← Retour'}
              </button>
              <button
                className="ob-btn-role"
                style={{flex:3, ...((!isValid || submitting) ? {opacity:.5,cursor:'not-allowed'} : {})}}
                disabled={!isValid || submitting}
                onClick={goNext}
              >
                {submitting ? 'Création...' : wizStep === steps.length ? 'Créer mon compte' : 'Continuer →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DONE SCREEN (role-specific) ════ */}
      {screen === 'done' && doneData && (
        <div className="ob-screen">
          <PageHeader />
          <div className="ob-card-v5" style={{maxWidth: userType === 'client' ? 560 : 440}}>
            <DoneStep
              role={userType}
              email={doneData.email}
              warnings={doneData.warnings}
              onNavigate={() => {
                // Rechargement dur : le boot ré-hydrate la session (Bearer +
                // cookie) et le RoleGuard laisse alors passer vers la plateforme.
                const dest = userType === 'client' ? '/client'
                  : userType === 'fournisseur' ? '/fournisseur' : '/cockpit'
                window.location.href = dest
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP RENDERERS — source: steps.parts.tsx du paquet, habillage v5
// ═════════════════════════════════════════════════════════════════════════════

function renderStep(role, stepKey, form, set, toggleArr, handleLogoUpload, handlePhotoUpload) {
  // AccountStep — shared across all roles
  if (stepKey === 'account') return <AccountStep role={role} form={form} set={set} handlePhotoUpload={handlePhotoUpload} />
  // Structure — role-specific
  if (stepKey === 'structure') {
    if (role === 'pro') return <ProStructureStep form={form} set={set} toggleArr={toggleArr} />
    if (role === 'fournisseur') return <SupplierStructureStep form={form} set={set} toggleArr={toggleArr} />
  }
  // Logo — shared (INS-12 : franchissable)
  if (stepKey === 'logo') return <LogoStep form={form} set={set} handleLogoUpload={handleLogoUpload} />
  // Fournisseur-specific
  if (stepKey === 'payout') return <SupplierPayoutStep form={form} set={set} />
  if (stepKey === 'product') return <SupplierProductStep form={form} set={set} toggleArr={toggleArr} />
  return null
}

// ── AccountStep (Votre compte) — source: steps.parts.tsx AccountStep ────────

function AccountStep({ role, form, set, handlePhotoUpload }) {
  const isClient = role === 'client'
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Ces informations sont obligatoires pour créer votre espace.</p>
    {isClient && <ProfilePhotoField form={form} handlePhotoUpload={handlePhotoUpload} set={set} />}
    {isClient ? (
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <Field label="Prénom" required><input className="ob-input" name="ob-prenom" value={form.prenom} onChange={e=>set('prenom',e.target.value)} placeholder="Prénom" autoComplete="off"/></Field>
        <Field label="Nom" required><input className="ob-input" name="ob-nom" value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder="Nom" autoComplete="off"/></Field>
      </div>
    ) : (
      <Field label="Nom de l'entreprise" required><input className="ob-input" name="ob-entreprise" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="Nom de votre entreprise" autoComplete="off"/></Field>
    )}
    <Field label="Adresse e-mail" required>
      <input className="ob-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="contact@entreprise.com" autoComplete="email"/>
    </Field>
    {/* Téléphone sur toute la largeur (INS — zone plus lisible) */}
    <PhoneField form={form} set={set} />
    {isClient ? (
      <Field label="Pays">
        <select className="ob-input" value={form.pays} onChange={e=>set('pays',e.target.value)}>
          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </Field>
    ) : (
      <Field label="Ville" required>
        <select className="ob-input" value={form.ville} onChange={e=>set('ville',e.target.value)}>
          <option value="">— Choisir —</option>
          {VILLES_CI.map(v=><option key={v}>{v}</option>)}
        </select>
      </Field>
    )}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Mot de passe" required hint="10 caractères minimum, une lettre, un chiffre.">
        <PasswordInput value={form.password} onChange={v=>set('password',v)} placeholder="10+ caractères" />
      </Field>
      <Field label="Confirmer" required>
        <input className="ob-input" type="password" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} placeholder="••••••••" autoComplete="new-password"/>
      </Field>
    </div>
    {/* INS-10 — consentements explicites, jamais pré-cochés */}
    <label className="ob-cgu-v5">
      <input type="checkbox" checked={!!form.cgu} onChange={e=>set('cgu',e.target.checked)} />
      <span>J'accepte les <a href="/conditions" target="_blank" rel="noopener noreferrer">conditions générales d'utilisation</a> et la <a href="/confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>. *
        <small>Version 2026-07-CI-v1 — votre acceptation est horodatée et conservée</small>
      </span>
    </label>
  </>
}

// ── ProStructureStep (Votre structure) — avec validation RCCM/NCC visuelle ──

function ProStructureStep({ form, set, toggleArr }) {
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Renseignez votre entreprise. Logo, portfolio et équipe se complètent ensuite depuis le cockpit.</p>
    <Field label="Nom de la structure" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="Ex : Traoré Architecture & Design"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <LegalField label="N° RCCM" value={form.rccm} onChange={v=>set('rccm',v)}
        regex={RCCM_RE} hint="Format : CI-ABJ-AAAA-X-NNNNN" errMsg="Format attendu : CI-ABJ-AAAA-X-NNNNN"
        placeholder="CI-ABJ-2024-B-12345" />
      <LegalField label="N° Contribuable" value={form.ncc} onChange={v=>set('ncc',v)}
        regex={TAX_RE} hint="Format : CI-NNNNNNN-X" errMsg="Format attendu : CI-NNNNNNN-X"
        placeholder="CI-0000000-A" />
    </div>
    <Field label="Secteurs d'activité" required>
      <Chips items={PRO_SECTEURS} selected={form.secteurs} onToggle={v=>toggleArr('secteurs',v)} />
    </Field>
    <div className="ob-msg-ok" style={{marginTop:16}}>
      <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
      <span><strong>Vérification en deux temps.</strong> Numéros uniques et liés à un seul compte MEEREO. La <strong>vérification officielle par KAi</strong> aura lieu au dépôt de votre RCCM (section Documents) et activera le badge « Vérifié par MEEREO ».</span>
    </div>
  </>
}

// ── SupplierStructureStep (Votre structure) — avec validation RCCM/NCC ──────

function SupplierStructureStep({ form, set, toggleArr }) {
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Renseignez votre entreprise. Catalogue et zones de livraison se complètent depuis votre espace.</p>
    <Field label="Nom de l'entreprise" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="Ex : Matériaux Pro CI"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <LegalField label="N° RCCM" value={form.rccm} onChange={v=>set('rccm',v)}
        regex={RCCM_RE} hint="Format : CI-ABJ-AAAA-X-NNNNN" errMsg="Format attendu : CI-ABJ-AAAA-X-NNNNN"
        placeholder="CI-ABJ-2024-B-12345" />
      <LegalField label="N° Contribuable" value={form.ncc} onChange={v=>set('ncc',v)}
        regex={TAX_RE} hint="Format : CI-NNNNNNN-X" errMsg="Format attendu : CI-NNNNNNN-X"
        placeholder="CI-0000000-A" />
    </div>
    <div className="ob-msg-ok" style={{marginTop:16}}>
      <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
      <span><strong>Vérification en deux temps.</strong> Numéros uniques et liés à un seul compte MEEREO. La <strong>vérification officielle par KAi</strong> aura lieu au dépôt de votre RCCM et activera le badge « Vérifié par MEEREO ».</span>
    </div>
    <Field label="Catégories vendues" required>
      <Chips items={MARKETPLACE_CATEGORIES} selected={form.categories} onToggle={v=>toggleArr('categories',v)} />
    </Field>
    <Field label="Modes de livraison" required>
      <Chips items={DELIVERY_MODES} selected={form.deliveryModes} onToggle={v=>toggleArr('deliveryModes',v)} />
    </Field>
    <Field label="Zones de livraison" required>
      {FRN_ZONE_SECTIONS.map(sec => (
        <div key={sec.title} style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.03em'}}>{sec.title}</div>
          <Chips items={sec.zones} selected={form.zones} onToggle={v=>toggleArr('zones',v)} />
        </div>
      ))}
    </Field>
    <Field label="Délai de livraison (jours)">
      <input className="ob-input" type="number" value={form.delaiLivraison} onChange={e=>set('delaiLivraison',e.target.value)} placeholder="2" min="0" max="365"/>
    </Field>
  </>
}

// ── LogoStep (INS-12 — franchissable, monogramme calculé à l'affichage) ─────

function LogoStep({ form, set, handleLogoUpload }) {
  const fileRef = useRef()
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Générez un logo avec KAi, ou importez le vôtre. Un seul logo reste actif.</p>
    <div style={{display:'flex',gap:10,marginBottom:16}}>
      <button className={`ob-tab ${form.logoTab==='generate'?'active':''}`} onClick={()=>set('logoTab','generate')}>Générer</button>
      <button className={`ob-tab ${form.logoTab==='upload'?'active':''}`} onClick={()=>set('logoTab','upload')}>Uploader</button>
    </div>
    {form.logoTab === 'generate' ? <>
      <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
        <CompanyLogo
          pro={{ entreprise: form.entreprise, logoColor: form.logoColor, logoShape: form.logoShape }}
          name={form.entreprise}
          size={72}
        />
      </div>
      <Field label="Couleur">
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {LOGO_COLORS.map(c=>(
            <button key={c.hex} title={c.label} onClick={()=>set('logoColor',c.hex)}
              style={{width:28,height:28,borderRadius:'50%',background:c.hex,border:form.logoColor===c.hex?'3px solid #7C3AED':'2px solid transparent',cursor:'pointer'}} />
          ))}
        </div>
      </Field>
      <Field label="Forme">
        <div style={{display:'flex',gap:6}}>
          {LOGO_SHAPES.map(s=>(
            <button key={s} className={`ob-chip ${form.logoShape===s?'active':''}`} onClick={()=>set('logoShape',s)}>{s}</button>
          ))}
        </div>
      </Field>
      <Field label="Typographie">
        <div style={{display:'flex',gap:6}}>
          {LOGO_TYPOS.map(t=>(
            <button key={t} className={`ob-chip ${form.logoTypo===t?'active':''}`} onClick={()=>set('logoTypo',t)}>{t}</button>
          ))}
        </div>
      </Field>
    </> : <>
      <div style={{textAlign:'center'}}>
        {form.logoFileUrl && <img src={form.logoFileUrl} alt="Logo" style={{width:72,height:72,objectFit:'contain',borderRadius:12,marginBottom:12}} />}
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={handleLogoUpload} style={{display:'none'}} />
        <button className="ob-btn-out" onClick={()=>fileRef.current?.click()}>Choisir un fichier</button>
        <div style={{fontSize:10,color:'var(--t4)',marginTop:6}}>PNG, JPG, WebP ou SVG — 10 Mo max</div>
      </div>
    </>}
  </>
}

// ── SupplierPayoutStep (MKT-06 §4 — OBLIGATOIRE) ───────────────────────────

function SupplierPayoutStep({ form, set }) {
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Les acheteurs vous règlent directement. Ce numéro reçoit vos paiements.</p>
    <div className="ob-msg-info" style={{marginBottom:16}}>
      <span><strong>MEEREO n'encaisse pas à votre place.</strong> Sans ce moyen de réception, aucune vente n'est possible — et rien ne peut être rattrapé côté plateforme.</span>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
      {PAYOUT_METHODS.map(m => (
        <button key={m.id} type="button" onClick={()=>set('payoutType',m.id)}
          className={`ob-payout-pick ${form.payoutType===m.id ? 'active' : ''}`}
          style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,border:form.payoutType===m.id?'2px solid var(--role-four)':'1px solid var(--border-card)',background:form.payoutType===m.id?'rgba(65,143,175,.04)':'transparent',cursor:'pointer',textAlign:'left'}}>
          <span style={{fontSize:20}}>{m.icon}</span>
          <span style={{fontSize:13,fontWeight:600}}>{m.label}</span>
        </button>
      ))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Numéro mobile" required hint="Un numéro mobile est requis pour le Mobile Money.">
        <input className="ob-input" value={form.payoutPhone} onChange={e=>set('payoutPhone',e.target.value)} placeholder="+225 07 00 00 00" autoComplete="tel"/>
      </Field>
      <Field label="Titulaire du compte" required>
        <input className="ob-input" value={form.payoutHolder} onChange={e=>set('payoutHolder',e.target.value)} placeholder="Nom complet du titulaire"/>
      </Field>
    </div>
  </>
}

// ── SupplierProductStep (facultatif — arbitrage 9) ──────────────────────────
// FIN-04 : le zéro NE signifie plus « sur devis ». pricingMode = FIXED | ON_QUOTE.

function SupplierProductStep({ form, set, toggleArr }) {
  const onQuote = form.pricingMode === 'ON_QUOTE'
  return <>
    <p className="ob-lede-v5" style={{marginTop:-10}}>Référencez un premier matériau pour lancer votre catalogue. Vous en ajouterez d'autres depuis votre espace.</p>
    <Field label="Nom du produit"><input className="ob-input" value={form.productName} onChange={e=>set('productName',e.target.value)} placeholder="Ex : Ciment CPA 42.5 — sac 50 kg"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Catégorie">
        <Chips items={MARKETPLACE_CATEGORIES} selected={form.productCategory ? [form.productCategory] : []}
          onToggle={v => set('productCategory', form.productCategory === v ? '' : v)} multi={false} />
      </Field>
      <Field label="Unité de vente">
        <Chips items={SALE_UNITS} selected={form.productUnit ? [form.productUnit] : []}
          onToggle={v => set('productUnit', form.productUnit === v ? '' : v)} multi={false} />
      </Field>
    </div>
    <Field label="Stock disponible">
      <input className="ob-input" type="number" value={form.productStock} onChange={e=>set('productStock',e.target.value)} placeholder="100" min="0"/>
    </Field>
    <Field label="Prix">
      <div style={{display:'flex',gap:6,marginBottom:8}}>
        <button type="button" className={`ob-chip ${!onQuote?'active':''}`}
          onClick={()=>{set('pricingMode','FIXED');set('productPrice','')}}>Prix ferme</button>
        <button type="button" className={`ob-chip ${onQuote?'active':''}`}
          onClick={()=>{set('pricingMode','ON_QUOTE');set('productPrice','')}}>Sur devis</button>
      </div>
      {!onQuote ? (
        <input className="ob-input" type="number" value={form.productPrice} onChange={e=>set('productPrice',e.target.value)} placeholder="5 500 FCFA" min="1"/>
      ) : (
        <div style={{fontSize:11,color:'var(--t3)',padding:'8px 0'}}>Les acheteurs vous adresseront une demande de devis depuis la Marketplace.</div>
      )}
    </Field>
    {!form.productName?.trim() && (
      <div style={{padding:'10px 12px',borderRadius:8,background:'rgba(234,88,12,.06)',fontSize:11,color:'#B45309',marginTop:8,display:'flex',alignItems:'center',gap:8}}>
        <Package size={14} /> Catalogue vide — vous pourrez ajouter des produits plus tard.
      </div>
    )}
    <div className="ob-foot-v5" style={{marginTop:16}}>
      <span className="link" onClick={() => {}}>Passer cette étape</span>
    </div>
  </>
}

// ── DoneStep — role-specific (v5) ──────────────────────────────────────────
// Client : « Et maintenant ? » + actions
// Pro : « Votre cockpit est prêt »
// Fournisseur : « Votre marketplace est prête » + avertissement catalogue vide

function DoneStep({ role, email, warnings, onNavigate }) {
  // ── Client done ──
  if (role === 'client') {
    return (
      <div>
        <div className="ob-eyebrow-v5">
          <span>Inscription · Client</span>
          <span className="ob-step-count-v5">Dernière étape</span>
        </div>
        <h1 className="ob-title-v5">Et maintenant ?</h1>
        <p className="ob-lede-v5">Votre compte est créé et vous êtes déjà connecté. Voici comment démarrer.</p>

        <div className="ob-msg-ok">
          <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
          <span>Votre compte est créé et vous êtes déjà connecté.</span>
        </div>

        {/* INS-09 — bandeau de correction d'adresse */}
        <div className="ob-msg-info" style={{marginTop:16}}>
          <span><strong>Confirmez votre adresse.</strong> Un lien a été envoyé à <strong>{email}</strong>.{' '}
            <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Renvoyer le lien</a> · {' '}
            <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Corriger mon adresse</a>
          </span>
        </div>

        <button className="ob-btn-role btn-tall" style={{marginTop:20}} onClick={onNavigate}>
          Publier un appel d'offres
          <span className="sub">Recevez plusieurs devis d'entreprises qualifiées à comparer</span>
        </button>
        <button className="ob-btn-sec-v5" style={{marginTop:12}} onClick={onNavigate}>
          Chercher un professionnel dans l'annuaire
          <span className="sub">Parcourez les architectes et entreprises disponibles</span>
        </button>

        <div className="ob-foot-v5" style={{marginTop:16}}>
          <span className="link" onClick={onNavigate}>Accéder à mon espace</span>
        </div>
      </div>
    )
  }

  // ── Pro done ──
  if (role === 'pro') {
    return (
      <div>
        <div className="ob-eyebrow-v5">
          <span>Inscription · Professionnel</span>
          <span className="ob-step-count-v5">Terminé</span>
        </div>
        <h1 className="ob-title-v5">Votre cockpit est prêt.</h1>
        <p className="ob-lede-v5">Votre espace professionnel est configuré. Vous pouvez recevoir des appels d'offres.</p>

        <div className="ob-msg-ok">
          <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
          <span>Page publique, missions, équipe et messagerie sont accessibles depuis votre cockpit.</span>
        </div>

        <div className="ob-msg-info" style={{marginTop:16}}>
          <span><strong>Confirmez votre adresse.</strong> Un lien a été envoyé à <strong>{email}</strong>.{' '}
            <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Renvoyer le lien</a> · {' '}
            <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Corriger mon adresse</a>
          </span>
        </div>

        <div className="ob-msg-info" style={{marginTop:10}}>
          <span>Votre <strong>page publique est créée en brouillon</strong>. Elle ne sera visible qu'une fois publiée depuis votre espace.</span>
        </div>

        <button className="ob-btn-role" style={{marginTop:20}} onClick={onNavigate}>
          Accéder au cockpit →
        </button>
      </div>
    )
  }

  // ── Fournisseur done ──
  return (
    <div>
      <div className="ob-eyebrow-v5">
        <span>Inscription · Fournisseur</span>
        <span className="ob-step-count-v5">Terminé</span>
      </div>
      <h1 className="ob-title-v5">Votre marketplace est prête.</h1>
      <p className="ob-lede-v5">Votre espace fournisseur est configuré. Vous pouvez commencer à vendre sur MEEREO.</p>

      <div className="ob-msg-ok">
        <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
        <span>Catalogue, commandes, ventes et zones de livraison sont accessibles depuis votre espace.</span>
      </div>

      <div className="ob-msg-info" style={{marginTop:16}}>
        <span><strong>Confirmez votre adresse.</strong> Un lien a été envoyé à <strong>{email}</strong>.{' '}
          <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Renvoyer le lien</a> · {' '}
          <a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--ink)',textDecoration:'underline'}}>Corriger mon adresse</a>
        </span>
      </div>

      <div className="ob-msg-info" style={{marginTop:10}}>
        <span>Votre <strong>page publique est créée en brouillon</strong>. Elle ne sera visible qu'une fois publiée depuis votre espace.</span>
      </div>

      {warnings.length > 0 && (
        <div style={{marginTop:10}}>
          {warnings.map(w => (
            <div key={w} style={{padding:'8px 12px',borderRadius:8,background:'rgba(234,88,12,.06)',fontSize:11,color:'#B45309',marginBottom:6,lineHeight:1.5}}>
              {w}
            </div>
          ))}
        </div>
      )}

      <button className="ob-btn-role" style={{marginTop:20}} onClick={onNavigate}>
        Accéder à mon espace →
      </button>
    </div>
  )
}

// ─── Legal Field (RCCM / NCC — validation visuelle à la frappe) ─────────────
// La validité du formulaire reste pilotée par useStepForm + SCHEMAS.
// Ce composant ne fournit que la FORME visuelle des états (items 4 du v5).

function LegalField({ label, value, onChange, regex, hint, errMsg, placeholder }) {
  const upper = value.toUpperCase()
  const empty = !upper.trim()
  const valid = !empty && regex.test(upper)
  const invalid = !empty && !regex.test(upper)

  return (
    <div className="ob-field">
      <label className="ob-label-v2">{label} *</label>
      <input
        className={`ob-input ob-legal-input ${valid ? 'legal-ok' : ''} ${invalid ? 'legal-err' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{textTransform:'uppercase'}}
      />
      {empty && <div className="ob-legal-hint">{hint}</div>}
      {valid && (
        <div className="ob-legal-status s-ok">
          <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
          Format valide
        </div>
      )}
      {invalid && (
        <div className="ob-legal-status s-err">
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          <span>{errMsg}</span>
        </div>
      )}
    </div>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function ProfilePhotoField({ form, handlePhotoUpload, set }) {
  const fileRef = useRef()
  const initials = `${form.prenom?.[0] || ''}${form.nom?.[0] || ''}`.toUpperCase()
  return (
    <div className="ob-field">
      <label className="ob-label-v2">Photo de profil</label>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:64,height:64,borderRadius:'50%',flexShrink:0,overflow:'hidden',background:'var(--role-client-bg,#F3E9E2)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border-card,#e5e5e5)'}}>
          {form.photoUrl
            ? <img src={form.photoUrl} alt="Photo de profil" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            : <span style={{fontSize:20,fontWeight:700,color:'var(--role-client,#D9622B)'}}>{initials || '👤'}</span>}
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handlePhotoUpload} style={{display:'none'}} />
          <button type="button" className="ob-btn-out" onClick={()=>fileRef.current?.click()}>
            {form.photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
          {form.photoUrl && (
            <button type="button" className="ob-btn-out" style={{marginLeft:8}} onClick={()=>set('photoUrl',null)}>Retirer</button>
          )}
          <div style={{fontSize:10,color:'var(--t4)',marginTop:6}}>Facultatif · PNG, JPG ou WebP — 10 Mo max</div>
        </div>
      </div>
    </div>
  )
}

function PhoneField({ form, set }) {
  return (
    <Field label="Téléphone" required hint="Ex. : +225 07 07 12 34 56">
      <div style={{display:'flex',gap:8}}>
        <select className="ob-input" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:150,flexShrink:0,height:48,fontSize:15}}>
          {PHONE_PREFIXES.map(p=><option key={p.country} value={p.code}>{p.flag} {p.code} · {p.country}</option>)}
        </select>
        <input className="ob-input" value={form.tel} onChange={e=>set('tel',e.target.value)} placeholder="07 07 12 34 56" style={{flex:1,height:48,fontSize:15,letterSpacing:'.02em'}} autoComplete="tel"/>
      </div>
    </Field>
  )
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{position:'relative'}}>
      <input className="ob-input" type={show?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{paddingRight:40}} autoComplete="new-password"/>
      <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--t3)'}}>{show?'Masquer':'Voir'}</button>
    </div>
  )
}
