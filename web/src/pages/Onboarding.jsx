import { useState, useRef, useEffect, memo, useCallback } from 'react'
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

const CARDS = [
  { id:'client', step:'01', title:'Je suis client',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    iconBg:'rgba(234,88,12,.08)',
    description:'Pilotez votre projet de construction, rénovation ou aménagement.',
    tags:['Logement','Commerce','Immeuble','Rénovation'],
  },
  { id:'pro', step:'02', title:'Je suis professionnel',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    iconBg:'rgba(124,58,237,.08)',
    description:'Centralisez vos missions, vos offres, vos équipes et votre exécution.',
    tags:['BTP','BET','Architecture','Entreprise'],
  },
  { id:'fournisseur', step:'03', title:'Je suis fournisseur',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    iconBg:'rgba(8,145,178,.08)',
    description:'Référencez vos produits, recevez des demandes et gérez vos commandes.',
    tags:['Matériaux','Équipements','Services','Commandes'],
  },
]

const FEATURES = [
  { num:'01', dot:'#EA580C', title:"Bourse des appels d'offres", desc:'Publiez vos besoins, comparez des offres qualifiées et composez votre équipe projet.' },
  { num:'02', dot:'#16A34A', title:'Marketplace intégrée', desc:'Accédez aux matériaux et équipements, commandez et faites livrer directement sur chantier.' },
  { num:'03', dot:'#0891B2', title:'Suivi & paiements sécurisés', desc:"Pilotez l'avancement, validez les étapes et sécurisez chaque flux financier." },
  { num:'04', dot:'#7C3AED', title:'Intelligence artificielle', desc:'Analyse, recommandations et orchestration intelligente pour piloter vos projets.' },
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

const PHONE_PREFIXES = [
  { code: '+225', flag: '🇨🇮', country: "Côte d'Ivoire" },
  { code: '+221', flag: '🇸🇳', country: 'Sénégal' },
  { code: '+223', flag: '🇲🇱', country: 'Mali' },
  { code: '+226', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: '+224', flag: '🇬🇳', country: 'Guinée' },
  { code: '+237', flag: '🇨🇲', country: 'Cameroun' },
  { code: '+33',  flag: '🇫🇷', country: 'France' },
]

const FRN_ZONE_SECTIONS = [
  {title:'Abidjan & communes',zones:['Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé','Koumassi','Port-Bouët','Bingerville','Anyama','Songon']},
  {title:'Grandes villes',zones:['Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo','Abengourou','Grand-Bassam']},
  {title:'Sud & Lagunes',zones:['Dabou','Jacqueville','Tiassalé','Agboville','Adzopé','Aboisso','Bonoua']},
  {title:'Centre & Nord',zones:['Toumodi','Dimbokro','Bondoukou','Katiola','Ferkessédougou','Odienné','Séguéla','Mankono']},
  {title:'Ouest & Sud-Ouest',zones:['Soubré','Sassandra','Tabou','Guiglo','Duékoué','Danané','Issia']},
  {title:'Couverture',zones:['Tout le territoire national','Zones rurales & villages']},
]

// ─── SVG Components ─────────────────────────────────────────────────────────

const ConstructionSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" fill="none" style={{width:'100%',display:'block'}}>
    <line x1="0" y1="232" x2="420" y2="232" stroke="#BBBBBB" strokeWidth="2"/>
    <rect x="14" y="190" width="52" height="26" rx="4" stroke="#BBBBBB" strokeWidth="1.5"/>
    <line x1="58" y1="198" x2="92" y2="152" stroke="#BBBBBB" strokeWidth="3" strokeLinecap="round"/>
    <rect x="138" y="72" width="84" height="160" stroke="#BFBFBF" strokeWidth="1.8"/>
    <line x1="138" y1="112" x2="222" y2="112" stroke="#CCCCCC" strokeWidth="1.2"/>
    <line x1="138" y1="148" x2="222" y2="148" stroke="#CCCCCC" strokeWidth="1.2"/>
    <rect x="166" y="196" width="24" height="36" rx="2" stroke="#CCCCCC" strokeWidth="1.5"/>
    <line x1="276" y1="8" x2="276" y2="232" stroke="#BBBBBB" strokeWidth="2.8" strokeLinecap="round"/>
    <line x1="276" y1="12" x2="390" y2="12" stroke="#BBBBBB" strokeWidth="2.2"/>
    <rect x="318" y="190" width="88" height="32" rx="3" stroke="#BBBBBB" strokeWidth="1.5"/>
    <circle cx="333" cy="226" r="9" stroke="#BBBBBB" strokeWidth="1.8"/>
    <circle cx="388" cy="226" r="9" stroke="#BBBBBB" strokeWidth="1.8"/>
  </svg>
)
const LogoSVG = () => (
  <svg width="36" height="36" viewBox="0 0 44 44" fill="none" style={{borderRadius:10,flexShrink:0}}>
    <rect width="44" height="44" fill="#1D1D1F"/><rect x="2" y="2" width="40" height="40" stroke="#FFFFFF" strokeWidth="2"/>
    <text x="7" y="19" fontFamily="'Inter',-apple-system,sans-serif" fontSize="11.5" fontWeight="300" letterSpacing="2.5" fill="#FFFFFF">MEE</text>
    <text x="7" y="34" fontFamily="'Inter',-apple-system,sans-serif" fontSize="11.5" fontWeight="300" letterSpacing="2.5" fill="#FFFFFF">REO</text>
  </svg>
)
const CheckSVG = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ArrowSVG = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>

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

const WizardLeftPanel = memo(function WizardLeftPanel({ steps, currentStep }) {
  return (
    <div className="wiz-panel-left">
      <ConstructionSVG />
      <div className="wiz-left-fade" />
      <div className="wiz-left-content">
        <div className="ob-logo-row"><LogoSVG /><div><div className="ob-logo-name">Meereo</div><div className="ob-logo-sub">Plateforme BTP & Immobilier — Cote d'Ivoire</div></div></div>
        <div className="wiz-left-mid">
          <div className="wiz-left-label">Votre inscription</div>
          <div className="wiz-steps-col">
            {steps.map((s,i) => {
              const stepNum = i + 1
              const active = currentStep === stepNum
              const done = currentStep > stepNum
              return (
                <div key={s.key}>
                  <div className={`wiz-step-row ${active ? 'active' : ''}`}>
                    <div className={`wiz-step-num ${done||active ? 'filled' : ''}`}>{done ? <CheckSVG /> : stepNum}</div>
                    <span className={`wiz-step-text ${active ? 'active' : ''}`}>{s.label}</span>
                  </div>
                  {i < steps.length-1 && <div className="wiz-step-line" />}
                </div>
              )
            })}
          </div>
          <div className="wiz-security-card">
            <div className="wiz-security-title" style={{display:'flex',alignItems:'center',gap:5}}><Lock size={13}/> Vos données sont protégées</div>
            <div className="wiz-security-desc">Chiffrement SSL · Conformité RGPD · Hébergement sécurisé</div>
          </div>
        </div>
      </div>
    </div>
  )
})

// ─── Validation helpers ─────────────────────────────────────────────────────

const required = (v) => (!v || !String(v).trim()) ? 'Champ requis' : null
const validEmail = (v) => (!v || !v.includes('@') || !v.includes('.')) ? 'Email invalide' : null
const validPhone = (v) => {
  if (!v?.trim()) return 'Téléphone requis'
  const digits = v.replace(/\D/g, '')
  if (digits.length < 8) return 'Au moins 8 chiffres'
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
    prenom: required, nom: required, tel: validPhone, ville: required,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  fournisseur_account: {
    prenom: required, nom: required, tel: validPhone, ville: required,
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
  const [userType, setUserType] = useState(null)  // pro | client | fournisseur
  const [wizStep, setWizStep] = useState(1)
  const [steps, setSteps] = useState([])          // from GET /api/onboarding/steps/:role
  const [draftId, setDraftId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneData, setDoneData] = useState(null)  // { email, warnings }

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd] = useState(false)

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
  const schema = schemaKey ? SCHEMAS[schemaKey] || {} : {}
  const { isValid } = useStepForm(form, schema)

  // ─── Fetch steps from API when role is selected (INS-15) ──────────────
  useEffect(() => {
    if (!userType) return
    api.onboarding.steps(userType)
      .then(data => setSteps(data.steps || []))
      .catch(() => setSteps([]))
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
    else { setScreen('auth'); setSteps([]) }
  }, [wizStep])

  const startWizard = useCallback((type) => {
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

      // Build warnings for DoneStep
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
    <div className="onboarding-shell">

      {/* ════ AUTH SCREEN ════ */}
      {screen === 'auth' && (
        <div className="ob-screen">
          <div className="ob-left">
            <div className="ob-z1">
              <div className="ob-logo-row"><span style={{fontSize:28,lineHeight:1}}>🇨🇮</span><LogoSVG /><div><div className="ob-brand">MEEREO</div><div className="ob-brand-sub">Plateforme BTP et Immobilier — Côte-d'Ivoire</div></div></div>
              <div className="ob-z3"><span className="ob-z3-dot" /> ACTUELLEMENT DISPONIBLE QU'EN CÔTE D'IVOIRE</div>
            </div>
            <div className="ob-z2" />
            <h1 className="ob-z4">Structure, pilote et sécurise<br/><em>vos projets</em><br/><em>immobiliers.</em></h1>
            <p className="ob-z5">Centralisez chaque acteur, chaque étape et chaque décision sur une seule plateforme.</p>
            <div className="ob-z6">
              {FEATURES.map(f => (
                <div key={f.num} className="ob-z6-item"><span className="ob-z6-num">{f.num}</span><div><div className="ob-z6-hdr"><div className="ob-z6-dot" style={{background:f.dot}} /><div className="ob-z6-title">{f.title}</div></div><div className="ob-z6-text">{f.desc}</div></div></div>
              ))}
            </div>
          </div>
          <div className="ob-panel-white ob-panel-white--auth">
            <div className="ob-auth-content">
              <div className="ob-auth-intro">
                <div className="ob-badge" style={{marginBottom:14}}><div className="ob-badge-dot" style={{width:8,height:8}} /><span style={{fontSize:13}}>Choisissez votre rôle sur la plateforme</span></div>
                <div className="ob-auth-headline">Une entrée pensée pour chaque acteur du projet.</div>
              </div>
              <div className="ob-auth-card">
                <div className="ob-auth-card-title">Accédez à votre espace MEEREO</div>
                <div style={{fontSize:11.5,fontWeight:500,color:'var(--t4)',marginTop:10}}>Votre centre de pilotage immobilier.</div>

                {/* Login */}
                <div style={{marginTop:18}}>
                  <Field label="Email"><input className="ob-input" type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="mon@email.ci" onKeyDown={e=>e.key==='Enter'&&handleLogin()}/></Field>
                  <Field label="Mot de passe">
                    <div style={{position:'relative'}}>
                      <input className="ob-input" type={showLoginPwd?'text':'password'} value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={{paddingRight:40}}/>
                      <button type="button" onClick={()=>setShowLoginPwd(!showLoginPwd)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--t3)'}}>{showLoginPwd?'Masquer':'Voir'}</button>
                    </div>
                  </Field>
                  <button className="ob-btn-blk" style={{width:'100%',marginTop:10}} onClick={handleLogin}>Se connecter</button>
                </div>

                {/* Role selection */}
                <div style={{marginTop:28}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:'var(--t2)'}}>Ou créez votre espace</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {CARDS.map(c => (
                      <button key={c.id} className="ob-role-card" onClick={() => startWizard(c.id)}>
                        <div style={{width:36,height:36,borderRadius:10,background:c.iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{c.icon}</div>
                        <div style={{flex:1,textAlign:'left'}}>
                          <div style={{fontSize:13,fontWeight:700}}>{c.title}</div>
                          <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{c.description}</div>
                        </div>
                        <ArrowSVG />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ WIZARD SCREEN ════ */}
      {screen === 'wizard' && steps.length > 0 && (
        <div className="ob-screen">
          <WizardLeftPanel steps={steps} currentStep={wizStep} />
          <div className="ob-panel-white">
            <div className="ob-form-wrap" style={{maxWidth:440}}>
              <div className="ob-form-title">{steps[wizStep-1]?.label || ''}</div>

              {/* ── STEP CONTENT ── */}
              {renderStep(userType, currentStepKey, form, set, toggleArr, handleLogoUpload)}

              {/* ── NAVIGATION ── */}
              <div className="wiz-nav">
                <button className="ob-btn-out" onClick={goBack}>
                  {wizStep === 1 ? '← Rôle' : '← Retour'}
                </button>
                <button
                  className="ob-btn-blk"
                  disabled={!isValid || submitting}
                  style={(!isValid || submitting) ? {opacity:.5,cursor:'not-allowed'} : undefined}
                  onClick={goNext}
                >
                  {submitting ? 'Création...' : wizStep === steps.length ? 'Créer mon compte' : 'Étape suivante'}
                  {!submitting && wizStep < steps.length && <> <ArrowSVG /></>}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ════ DONE SCREEN (DoneStep du paquet) ════ */}
      {screen === 'done' && doneData && (
        <div className="ob-screen">
          <WizardLeftPanel steps={steps} currentStep={steps.length + 1} />
          <div className="ob-panel-white">
            <div className="ob-form-wrap" style={{maxWidth:440}}>
              <DoneStep
                role={userType}
                email={doneData.email}
                warnings={doneData.warnings}
                onNavigate={() => {
                  if (userType === 'client') navigate('/client')
                  else if (userType === 'fournisseur') navigate('/fournisseur')
                  else navigate('/cockpit')
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP RENDERERS — source: steps.parts.tsx du paquet, habillage Tailwind actuel
// ═════════════════════════════════════════════════════════════════════════════

function renderStep(role, stepKey, form, set, toggleArr, handleLogoUpload) {
  // AccountStep — shared across all roles
  if (stepKey === 'account') return <AccountStep role={role} form={form} set={set} />
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

function AccountStep({ role, form, set }) {
  return <>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Prénom" required><input className="ob-input" value={form.prenom} onChange={e=>set('prenom',e.target.value)} placeholder="Kofi" autoComplete="given-name"/></Field>
      <Field label="Nom" required><input className="ob-input" value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder="Yao" autoComplete="family-name"/></Field>
    </div>
    <Field label="Adresse e-mail" required>
      <input className="ob-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="contact@monentreprise.ci" autoComplete="email"/>
    </Field>
    <PhoneField form={form} set={set} />
    <Field label="Ville" required={role !== 'client'}>
      <select className="ob-input" value={form.ville} onChange={e=>set('ville',e.target.value)}>
        <option value="">— Choisir —</option>
        {VILLES_CI.map(v=><option key={v}>{v}</option>)}
      </select>
    </Field>
    <Field label="Mot de passe" required hint="10 caractères minimum, une lettre, un chiffre.">
      <PasswordInput value={form.password} onChange={v=>set('password',v)} placeholder="10+ caractères" />
    </Field>
    <Field label="Confirmation du mot de passe" required>
      <input className="ob-input" type="password" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} placeholder="••••••••" autoComplete="new-password"/>
    </Field>
    {/* INS-10 — consentements explicites, jamais pré-cochés */}
    <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:8}}>
      <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:11.5,color:'var(--t2)',cursor:'pointer',lineHeight:1.5}}>
        <input type="checkbox" checked={!!form.cgu} onChange={e=>set('cgu',e.target.checked)} style={{marginTop:2,flexShrink:0}} />
        <span>J'accepte les <a href="/conditions" target="_blank" rel="noopener noreferrer" style={{color:'#7C3AED',fontWeight:600}}>conditions générales</a> et la <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{color:'#7C3AED',fontWeight:600}}>politique de confidentialité</a>. *</span>
      </label>
      <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:11.5,color:'var(--t3)',cursor:'pointer',lineHeight:1.5}}>
        <input type="checkbox" checked={!!form.comms} onChange={e=>set('comms',e.target.checked)} style={{marginTop:2,flexShrink:0}} />
        <span>Recevoir les communications MEEREO (facultatif).</span>
      </label>
    </div>
  </>
}

// ── ProStructureStep (Votre entreprise) — source: steps.parts.tsx ────────────

function ProStructureStep({ form, set, toggleArr }) {
  return <>
    <Field label="Raison sociale" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="Mon cabinet"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Numéro RCCM" required hint="Format : CI-ABJ-AAAA-X-NNNNN">
        <input className="ob-input" value={form.rccm} onChange={e=>set('rccm',e.target.value)} placeholder="CI-ABJ-2024-B-12345"/>
      </Field>
      <Field label="N° de contribuable" required>
        <input className="ob-input" value={form.ncc} onChange={e=>set('ncc',e.target.value)} placeholder="1234567A"/>
      </Field>
    </div>
    <Field label="Secteurs d'activité" required>
      <Chips items={PRO_SECTEURS} selected={form.secteurs} onToggle={v=>toggleArr('secteurs',v)} />
    </Field>
  </>
}

// ── SupplierStructureStep (Votre entreprise) — source: steps.parts.tsx ───────
// Inclut catégories vendues, modes et zones de livraison, délai (MKT-06 §2-3).

function SupplierStructureStep({ form, set, toggleArr }) {
  return <>
    <Field label="Raison sociale" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="MatériCI SARL"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Numéro RCCM" required hint="Format : CI-ABJ-AAAA-X-NNNNN">
        <input className="ob-input" value={form.rccm} onChange={e=>set('rccm',e.target.value)} placeholder="CI-ABJ-2024-B-12345"/>
      </Field>
      <Field label="N° de contribuable" required>
        <input className="ob-input" value={form.ncc} onChange={e=>set('ncc',e.target.value)} placeholder="1234567A"/>
      </Field>
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
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Facultatif. Sans logo, vos initiales vous représentent — vous pourrez en ajouter un à tout moment.</div>
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
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Les acheteurs vous règlent directement. Ce numéro reçoit vos paiements.</div>
    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
      {PAYOUT_METHODS.map(m => (
        <button key={m.id} type="button" onClick={()=>set('payoutType',m.id)}
          style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,border:form.payoutType===m.id?'2px solid #7C3AED':'1px solid var(--border-card)',background:form.payoutType===m.id?'rgba(124,58,237,.04)':'transparent',cursor:'pointer',textAlign:'left'}}>
          <span style={{fontSize:20}}>{m.icon}</span>
          <span style={{fontSize:13,fontWeight:600}}>{m.label}</span>
        </button>
      ))}
    </div>
    <Field label="Numéro mobile" required hint="Un numéro mobile est requis pour le Mobile Money.">
      <input className="ob-input" value={form.payoutPhone} onChange={e=>set('payoutPhone',e.target.value)} placeholder="+225 07 00 00 00" autoComplete="tel"/>
    </Field>
    <Field label="Titulaire du compte" required>
      <input className="ob-input" value={form.payoutHolder} onChange={e=>set('payoutHolder',e.target.value)} placeholder="Nom complet du titulaire"/>
    </Field>
  </>
}

// ── SupplierProductStep (facultatif — arbitrage 9) ──────────────────────────
// FIN-04 : le zéro NE signifie plus « sur devis ». pricingMode = FIXED | ON_QUOTE.

function SupplierProductStep({ form, set, toggleArr }) {
  const onQuote = form.pricingMode === 'ON_QUOTE'
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Facultatif. Vous pourrez enrichir votre catalogue depuis votre espace.</div>
    <Field label="Nom du produit"><input className="ob-input" value={form.productName} onChange={e=>set('productName',e.target.value)} placeholder="Ciment CEM II 42.5"/></Field>
    <Field label="Catégorie">
      <Chips items={MARKETPLACE_CATEGORIES} selected={form.productCategory ? [form.productCategory] : []}
        onToggle={v => set('productCategory', form.productCategory === v ? '' : v)} multi={false} />
    </Field>
    <Field label="Unité de vente">
      <Chips items={SALE_UNITS} selected={form.productUnit ? [form.productUnit] : []}
        onToggle={v => set('productUnit', form.productUnit === v ? '' : v)} multi={false} />
    </Field>
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
  </>
}

// ── DoneStep — source: steps.parts.tsx DoneStep ─────────────────────────────
// INS-09 : le bandeau AFFICHE L'ADRESSE pour permettre à l'utilisateur de
// voir une éventuelle faute de frappe.

function DoneStep({ role, email, warnings, onNavigate }) {
  return (
    <div style={{textAlign:'center',padding:'24px 0'}}>
      <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(22,163,74,.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <CheckCircle2 size={28} color="#16A34A" />
      </div>
      <div className="ob-form-title" style={{marginBottom:8}}>Votre compte est créé</div>

      {/* INS-09 — bandeau de vérification d'adresse */}
      <div style={{padding:'14px 16px',borderRadius:12,background:'rgba(37,99,235,.06)',border:'1px solid rgba(37,99,235,.15)',marginBottom:16,textAlign:'left'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <Mail size={14} color="#2563EB" />
          <span style={{fontSize:12,fontWeight:600,color:'#2563EB'}}>Confirmez votre adresse</span>
        </div>
        <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.5}}>
          Un lien de vérification a été envoyé à <strong>{email}</strong>.
        </div>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="ob-btn-out" style={{fontSize:11,padding:'5px 12px'}}>Renvoyer le lien</button>
          <button className="ob-btn-out" style={{fontSize:11,padding:'5px 12px'}}>Corriger mon adresse</button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div style={{marginBottom:16,textAlign:'left'}}>
          {warnings.map(w => (
            <div key={w} style={{padding:'8px 12px',borderRadius:8,background:'rgba(234,88,12,.06)',fontSize:11,color:'#B45309',marginBottom:6,lineHeight:1.5}}>
              {w}
            </div>
          ))}
        </div>
      )}

      {role !== 'client' && (
        <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.5,marginBottom:16}}>
          Votre page publique est créée en <strong>brouillon</strong>. Elle ne sera visible qu'une fois publiée depuis votre espace.
        </div>
      )}

      <button className="ob-btn-blk" style={{width:'100%'}} onClick={onNavigate}>
        Accéder à mon espace
      </button>
    </div>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function PhoneField({ form, set }) {
  return (
    <Field label="Téléphone" required hint="Ex. : +225 07 07 12 34 56">
      <div style={{display:'flex',gap:6}}>
        <select className="ob-input" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:100,flexShrink:0}}>
          {PHONE_PREFIXES.map(p=><option key={p.code} value={p.code}>{p.flag} {p.code}</option>)}
        </select>
        <input className="ob-input" value={form.tel} onChange={e=>set('tel',e.target.value)} placeholder="07 07 12 34 56" style={{flex:1}} autoComplete="tel"/>
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
