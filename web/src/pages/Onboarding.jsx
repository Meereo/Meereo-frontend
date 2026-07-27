import { useState, useRef, useEffect, memo, useCallback } from 'react'
import {
  Home, HardHat, Store, Hammer, Pencil,
  Search, CheckCircle2, Trophy,
  Wrench, Shield, Layers, Droplets, Snowflake, Zap, Sun, Droplet, Leaf,
  Sofa, BedDouble, UtensilsCrossed, ChefHat, Briefcase, Armchair, Building2, Trees, Car,
  PanelTop, Lock, Eye, Package,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import compressImage from '../utils/compressImage'
import { api, setSuppressSessionExpired, setInMemoryToken } from '../services/api/client'
import { useMeereo } from '../hooks/useMeereoStore'
import { MKT_CATS } from '../data/marketplace'
import CompanyLogo from '../components/shared/CompanyLogo'
import useStepForm from '../hooks/useStepForm'
import '../styles/onboarding.css'

// ─── Référentiels ───────────────────────────────────────────────────────────

const FRN_CATEGORIES = MKT_CATS.filter(c => c.id !== 'all')

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
    tags:['Architecte','BTP','BET','Entreprise'],
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

const SITUATIONS = [
  {icon:<Search size={18}/>,bg:'rgba(234,88,12,.07)',title:"Je n'ai pas encore d'architecte",desc:"La plateforme va m'aider à trouver un architecte via un appel d'offres."},
  {icon:<CheckCircle2 size={18}/>,bg:'rgba(22,163,74,.07)',title:"J'ai déjà un architecte",desc:"Mon architecte est sur Meereo ou je peux l'inviter."},
  {icon:<Trophy size={18}/>,bg:'rgba(37,99,235,.07)',title:"Je veux une solution clé en main",desc:"Meereo coordonne l'ensemble — je valide et suis l'avancement."},
  {icon:<Eye size={18}/>,bg:'rgba(99,102,241,.07)',title:"Je souhaite seulement découvrir",desc:"Explorez sans engagement. Vous pourrez créer un projet plus tard."},
]

const PRO_SECTEURS = [
  'Architecte & Design',
  "Bureau d'étude fluides",
  "Bureau d'étude de structure",
  'Construction gros oeuvre',
  'Construction second oeuvre',
]
const PRO_SVC_MAP = {
  'Architecte & Design':['Aménagement intérieur','Rénovation & réhabilitation','Architecture commerciale','Architecture d\'intérieur','Plans & permis de construire','Maîtrise d\'œuvre'],
  "Bureau d'étude fluides":['Études thermiques','Études acoustiques','Études électriques','Études CVC','Audit énergétique','Diagnostic technique'],
  "Bureau d'étude de structure":['Études béton armé','Calculs de structure','Notes de calcul','Plans d\'exécution','Études sismiques','Expertise structure'],
  'Construction gros oeuvre':['Fondations & terrassement','Béton armé & structure','Maçonnerie','Charpente & toiture','Dallage & plancher','VRD & assainissement'],
  'Construction second oeuvre':['Peinture & revêtements','Carrelage & faïence','Faux plafond','Menuiserie intérieure','Isolation thermique','Enduits & crépis'],
}

const LOGO_COLORS = [
  {hex:'#1D1D1F',label:'Noir profond'},{hex:'#1D4ED8',label:'Bleu marine'},{hex:'#0891B2',label:'Bleu acier'},
  {hex:'#7C3AED',label:'Violet'},{hex:'#EA580C',label:'Terracotta'},{hex:'#16A34A',label:'Vert'},
  {hex:'#CA8A04',label:'Or'},{hex:'#BE185D',label:'Bordeaux'}
]
const LOGO_SHAPES = ['Hexagone','Cercle','Carré','Diamant','Triangle']
const LOGO_TYPOS = ['Gras','Serif','Léger']

function logoShapeStyle(shape) {
  switch (shape) {
    case 'Cercle': return { borderRadius: '50%' }
    case 'Carré': return { borderRadius: '4px' }
    case 'Diamant': return { borderRadius: '6px', transform: 'rotate(45deg)' }
    case 'Triangle': return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: 0 }
    case 'Hexagone': default: return { borderRadius: '12px' }
  }
}
function logoContentStyle(shape) {
  if (shape === 'Diamant') return { transform: 'rotate(-45deg)', display: 'block' }
  if (shape === 'Triangle') return { display: 'block', transform: 'translateY(30%)' }
  return {}
}

const FRN_CAT_SECTIONS = [
  {title:'Matériaux de construction',cats:[
    {em:<HardHat size={14}/>,label:'Gros Œuvre',sub:'Béton, agglos, gravier, sable, ciment'},
    {em:<Wrench size={14}/>,label:'Structure & Charpente',sub:'Acier, profilés, rond à béton'},
    {em:<Shield size={14}/>,label:'Isolation & Étanchéité',sub:'Laine de roche, membrane EPDM'},
    {em:<PanelTop size={14}/>,label:'Menuiseries',sub:'Fenêtres, portes, baies vitrées'},
    {em:<Layers size={14}/>,label:'Revêtements',sub:'Carrelage, parquet, peinture, enduit'},
  ]},
  {title:'Installations techniques',cats:[
    {em:<Droplets size={14}/>,label:'Plomberie & Sanitaires',sub:'Robinetterie, WC, chauffe-eau'},
    {em:<Snowflake size={14}/>,label:'CVC & Climatisation',sub:'Splits, VRV, ventilation'},
    {em:<Zap size={14}/>,label:'Électricité',sub:'Tableaux, câbles, LED'},
  ]},
  {title:'Green & Énergie durable',cats:[
    {em:<Sun size={14}/>,label:'Solaire & Photovoltaïque',sub:'Panneaux solaires, onduleurs'},
    {em:<Droplet size={14}/>,label:'Traitement de l\'eau',sub:'Filtration, récupération'},
    {em:<Home size={14}/>,label:'Domotique & Smart Home',sub:'Automatisation, capteurs'},
    {em:<Leaf size={14}/>,label:'Éco-matériaux',sub:'Isolants naturels, bois certifié'},
  ]},
  {title:'Mobilier & Aménagement',cats:[
    {em:<Sofa size={14}/>,label:'Salon & Séjour'},{em:<BedDouble size={14}/>,label:'Chambre & Literie'},
    {em:<UtensilsCrossed size={14}/>,label:'Salle à manger'},{em:<ChefHat size={14}/>,label:'Cuisine & Équipements'},
    {em:<Droplets size={14}/>,label:'Salle de bain'},
  ]},
  {title:'Mobilier professionnel',cats:[
    {em:<Briefcase size={14}/>,label:'Mobilier Bureau'},{em:<Armchair size={14}/>,label:'Mobilier Collectif'},
    {em:<Building2 size={14}/>,label:'Hôtellerie & Restauration'},
  ]},
  {title:'Extérieur',cats:[
    {em:<Trees size={14}/>,label:'Jardin & Terrasse'},{em:<Wrench size={14}/>,label:'Outillage & Quincaillerie'},
    {em:<Car size={14}/>,label:'Portails & Accès'},
  ]},
]

const FRN_ZONE_SECTIONS = [
  {title:'Abidjan & communes',zones:['Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé','Koumassi','Port-Bouët','Bingerville','Anyama','Songon']},
  {title:'Grandes villes',zones:['Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo','Abengourou','Grand-Bassam']},
  {title:'Sud & Lagunes',zones:['Dabou','Jacqueville','Tiassalé','Agboville','Adzopé','Aboisso','Bonoua']},
  {title:'Centre & Nord',zones:['Toumodi','Dimbokro','Bondoukou','Katiola','Ferkessédougou','Odienné','Séguéla','Mankono']},
  {title:'Ouest & Sud-Ouest',zones:['Soubré','Sassandra','Tabou','Guiglo','Duékoué','Danané','Issia']},
  {title:'Couverture',zones:['Tout le territoire national','Zones rurales & villages']},
]

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

const PAYOUT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { id: 'mtn_momo',     label: 'MTN MoMo',     icon: '🟡' },
  { id: 'wave',          label: 'Wave',          icon: '🔵' },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: '🏦' },
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

const Field = ({label,required,error,children}) => (
  <div className="ob-field">
    <label className="ob-label-v2">{label}{required&&' *'}</label>
    {children}
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
  if (v.length < 8) return 'Au moins 8 caractères'
  return null
}
const passwordsMatch = (_v, all) => {
  if (all.password && all.passwordConfirm && all.password !== all.passwordConfirm) return 'Ne correspondent pas'
  return null
}
const requireCgu = (v) => !v ? 'Acceptation requise' : null

// ─── Step validation schemas ────────────────────────────────────────────────

const SCHEMAS = {
  // Client step 1: identity + credentials
  client_identity: {
    prenom: required, nom: required, tel: validPhone,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  // Client step 2: situation (optional — any choice is valid, or none)
  client_situation: {},

  // Pro step 1: structure + credentials
  pro_structure: {
    entreprise: required, ville: required, tel: validPhone,
    secteurs: (v) => (!v || v.length === 0) ? 'Au moins un secteur' : null,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  // Pro step 2: logo (franchissable — no required fields)
  pro_logo: {},
  // Pro step 3: services
  pro_services: {},
  // Pro step 4: portfolio
  pro_portfolio: {},

  // Fournisseur step 1: structure + credentials
  fournisseur_structure: {
    entreprise: required, ville: required, tel: validPhone,
    email: validEmail, password: validPassword, passwordConfirm: passwordsMatch,
    cgu: requireCgu,
  },
  fournisseur_logo: {},
  fournisseur_catalogue: {},
  // Fournisseur step 4: products (FACULTATIF — arbitrage 9)
  fournisseur_products: {},
  // Fournisseur step 5: payout (OBLIGATOIRE)
  fournisseur_payout: {
    payoutType: (v) => !v ? 'Moyen d\'encaissement requis' : null,
  },
  fournisseur_zones: {},
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function Onboarding() {
  const navigate = useNavigate()
  const { loginUser, showToast } = useMeereo()

  // ─── State ──────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState('auth')   // auth | wizard
  const [userType, setUserType] = useState(null)  // pro | client | fournisseur
  const [wizStep, setWizStep] = useState(1)
  const [steps, setSteps] = useState([])          // from API
  const [draftId, setDraftId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // Form state — single object for all roles
  const [form, setForm] = useState({
    // Credentials (all)
    email: '', password: '', passwordConfirm: '', cgu: false, comms: false,
    // Client identity
    prenom: '', nom: '', civilite: '',
    // Pro/Fournisseur structure
    entreprise: '', rccm: '', ncc: '', annee: '',
    // Shared
    tel: '', telPrefix: '+225', ville: 'Abidjan', pays: "Côte d'Ivoire",
    // Pro logo
    logoColor: '#1D1D1F', logoShape: 'Hexagone', logoTypo: 'Gras', logoTab: 'generate', logoFileUrl: null,
    // Pro services
    secteurs: [], services: [], slogan: '', bio: '', projetsN: '', effectif: '',
    // Pro portfolio
    portfolioFiles: [], coverUrl: null, team: [],
    // Fournisseur
    categories: [], zones: [], delaiLivraison: '',
    // Fournisseur payout
    payoutType: '', payoutLabel: '', payoutPhone: '',
    // Fournisseur products
    firstProductName: '', firstProductPrice: '', firstProductUnit: '/unité', firstProductCategory: '',
    // Client situation
    situation: null,
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

  // ─── Fetch steps from API when role is selected ───────────────────────
  useEffect(() => {
    if (!userType) return
    api.onboarding.steps(userType)
      .then(data => setSteps(data.steps || []))
      .catch(() => {
        // Fallback if API unavailable — should not happen in normal flow
        setSteps([])
      })
  }, [userType])

  // ─── Save draft to server at each step transition ─────────────────────
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
      // Draft save failure is non-blocking — user can continue
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

  // ─── Photo handling ───────────────────────────────────────────────────
  const handlePhoto = async (e, field) => {
    const f = e.target.files[0]; if (!f) return
    const compressed = await compressImage(f, 400, 0.8)
    set(field, compressed)
  }

  // ─── Logo upload ──────────────────────────────────────────────────────
  const handleLogoUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 10 * 1024 * 1024) { showToast('Fichier trop volumineux — 10 Mo max', 'red'); return }
    const compressed = await compressImage(f, 200, 0.85)
    set('logoFileUrl', compressed)
    set('logoTab', 'upload')
    // Upload to server in background
    try {
      const fd = new FormData(); fd.append('logo', f)
      const res = await api.onboarding.uploadLogo(fd)
      if (res.url) set('logoFileUrl', res.url)
    } catch { /* keep compressed preview */ }
  }

  // ─── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const name = userType === 'client'
        ? `${form.prenom} ${form.nom}`.trim()
        : form.entreprise || 'Utilisateur'

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
          annee: form.annee || undefined, rccm: form.rccm || undefined, ncc: form.ncc || undefined,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          secteurs: form.secteurs, services: form.services,
          logoColor: form.logoColor, logoShape: form.logoShape, logoTypo: form.logoTypo,
          logoFileUrl: form.logoTab === 'upload' ? form.logoFileUrl : undefined,
          activeLogoType: form.logoTab === 'upload' && form.logoFileUrl ? 'uploaded' : 'generated',
          slogan: form.slogan || undefined, bio: form.bio || undefined,
          projetsN: form.projetsN || undefined, effectif: form.effectif || undefined,
          portfolioFiles: form.portfolioFiles, cockpitTeam: form.team,
          coverUrl: form.coverUrl || undefined,
        })
      } else if (userType === 'client') {
        Object.assign(profile, {
          prenom: form.prenom, nom: form.nom, civilite: form.civilite || undefined,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          ville: form.ville, pays: form.pays,
          situation: form.situation || undefined,
        })
      } else if (userType === 'fournisseur') {
        Object.assign(profile, {
          entreprise: form.entreprise, ville: form.ville, pays: form.pays,
          rccm: form.rccm || undefined, ncc: form.ncc || undefined,
          tel: `${form.telPrefix} ${form.tel}`.trim(),
          logoColor: form.logoColor, logoShape: form.logoShape, logoTypo: form.logoTypo,
          logoFileUrl: form.logoTab === 'upload' ? form.logoFileUrl : undefined,
          categories: form.categories, zones: form.zones,
          delaiLivraison: form.delaiLivraison || undefined,
        })
      }
      payload.profile = profile

      // Entreprise (pro/fournisseur)
      if ((userType === 'pro' || userType === 'fournisseur') && form.entreprise) {
        payload.entreprise = {
          legalName: form.entreprise,
          rccm: form.rccm || undefined,
          ncc: form.ncc || undefined,
        }
      }

      // PayoutMethod (fournisseur)
      if (userType === 'fournisseur' && form.payoutType) {
        payload.payoutMethod = {
          type: form.payoutType,
          label: form.payoutLabel || form.payoutType,
          details: form.payoutPhone ? { phone: form.payoutPhone } : {},
        }
      }

      // First product (facultatif — arbitrage 9)
      if (userType === 'fournisseur' && form.firstProductName?.trim()) {
        payload.firstProduct = {
          name: form.firstProductName,
          category: form.firstProductCategory || '',
          price: parseFloat(form.firstProductPrice) || 0,
          unit: form.firstProductUnit || '/unité',
        }
      }

      // POST /api/onboarding/submit → 201 + { token, user }
      const res = await api.onboarding.submit(payload)

      // Session opened by API (NAV-07) — store token immediately
      if (res.token) {
        setInMemoryToken(res.token)
        try { sessionStorage.setItem('meereo_session_token', res.token) } catch {}
      }
      if (res.user) {
        try { sessionStorage.setItem('meereo_cached_user', JSON.stringify(res.user)) } catch {}
      }

      setSuppressSessionExpired(false)
      showToast('Compte créé avec succès !', 'green')

      // Completion message for fournisseur without product
      if (userType === 'fournisseur' && !form.firstProductName?.trim()) {
        showToast('Catalogue vide — ajoutez vos premiers produits depuis votre espace', 'orange')
      }

      // Redirect to workspace — session already active
      setTimeout(() => {
        if (userType === 'client') navigate('/client')
        else if (userType === 'fournisseur') navigate('/fournisseur')
        else navigate('/cockpit')
      }, 100)
    } catch (err) {
      // Handle domain errors from API
      if (err.status === 409) {
        showToast(err.message || 'Conflit — email ou RCCM déjà utilisé', 'red')
        // Navigate back to the credentials step
        const credStep = steps.findIndex(s => s.key === 'structure' || s.key === 'identity')
        if (credStep >= 0) setWizStep(credStep + 1)
      } else if (err.status === 422 && err.errors) {
        const first = err.errors[0]
        showToast(first?.message || 'Données invalides', 'red')
        // Navigate to the step containing the errored field
        // For now, go back to step 1
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
              {renderStep(userType, currentStepKey, form, set, toggleArr, handlePhoto, handleLogoUpload)}

              {/* ── CGU (only on first step) ── */}
              {wizStep === 1 && (
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
              )}

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
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP RENDERERS — each returns the JSX for a wizard step
// ═════════════════════════════════════════════════════════════════════════════

function renderStep(role, stepKey, form, set, toggleArr, handlePhoto, handleLogoUpload) {
  // ── CLIENT ──
  if (role === 'client') {
    if (stepKey === 'identity') return <ClientIdentityStep form={form} set={set} />
    if (stepKey === 'situation') return <ClientSituationStep form={form} set={set} />
  }
  // ── PRO ──
  if (role === 'pro') {
    if (stepKey === 'structure') return <ProStructureStep form={form} set={set} toggleArr={toggleArr} />
    if (stepKey === 'logo') return <LogoStep form={form} set={set} handleLogoUpload={handleLogoUpload} />
    if (stepKey === 'services') return <ProServicesStep form={form} set={set} toggleArr={toggleArr} />
    if (stepKey === 'portfolio') return <ProPortfolioStep form={form} set={set} handlePhoto={handlePhoto} />
  }
  // ── FOURNISSEUR ──
  if (role === 'fournisseur') {
    if (stepKey === 'structure') return <FrnStructureStep form={form} set={set} />
    if (stepKey === 'logo') return <LogoStep form={form} set={set} handleLogoUpload={handleLogoUpload} />
    if (stepKey === 'catalogue') return <FrnCatalogueStep form={form} toggleArr={toggleArr} />
    if (stepKey === 'products') return <FrnProductsStep form={form} set={set} />
    if (stepKey === 'payout') return <FrnPayoutStep form={form} set={set} />
    if (stepKey === 'zones') return <FrnZonesStep form={form} toggleArr={toggleArr} />
  }
  return null
}

// ── Client: Identity + Credentials ──────────────────────────────────────────

function ClientIdentityStep({ form, set }) {
  return <>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Prénom" required><input className="ob-input" value={form.prenom} onChange={e=>set('prenom',e.target.value)} placeholder="Kofi"/></Field>
      <Field label="Nom" required><input className="ob-input" value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder="Yao"/></Field>
    </div>
    <PhoneField form={form} set={set} />
    <Field label="Ville">
      <select className="ob-input" value={form.ville} onChange={e=>set('ville',e.target.value)}>
        {VILLES_CI.map(v=><option key={v}>{v}</option>)}
      </select>
    </Field>
    <CredentialsFields form={form} set={set} />
  </>
}

// ── Client: Situation ────────────────────────────────────────────────────────

function ClientSituationStep({ form, set }) {
  return <>
    <div style={{fontSize:13,color:'var(--t2)',marginBottom:12}}>Comment souhaitez-vous avancer ?</div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {SITUATIONS.map(s => (
        <button key={s.title} type="button" className={`ob-situation-card ${form.situation===s.title?'active':''}`}
          onClick={()=>set('situation',s.title)} style={{textAlign:'left',padding:'12px 14px',borderRadius:12,border:form.situation===s.title?'2px solid #7C3AED':'1px solid var(--border-card)',background:form.situation===s.title?'rgba(124,58,237,.04)':'var(--surface-1)',cursor:'pointer',display:'flex',gap:10,alignItems:'flex-start'}}>
          <div style={{width:32,height:32,borderRadius:8,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.icon}</div>
          <div><div style={{fontSize:12,fontWeight:700}}>{s.title}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{s.desc}</div></div>
        </button>
      ))}
    </div>
  </>
}

// ── Pro: Structure + Credentials ────────────────────────────────────────────

function ProStructureStep({ form, set, toggleArr }) {
  return <>
    <Field label="Nom de la structure" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="Mon cabinet"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Ville" required>
        <select className="ob-input" value={form.ville} onChange={e=>set('ville',e.target.value)}>
          <option value="">— Choisir —</option>
          {VILLES_CI.map(v=><option key={v}>{v}</option>)}
        </select>
      </Field>
      <Field label="Année de création"><input className="ob-input" type="text" value={form.annee} onChange={e=>set('annee',e.target.value)} placeholder="2018" maxLength={4}/></Field>
    </div>
    <PhoneField form={form} set={set} />
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="RCCM"><input className="ob-input" value={form.rccm} onChange={e=>set('rccm',e.target.value)} placeholder="CI-ABJ-2024-B-12345"/></Field>
      <Field label="NCC"><input className="ob-input" value={form.ncc} onChange={e=>set('ncc',e.target.value)} placeholder="CI0000000A"/></Field>
    </div>
    <Field label="Secteurs d'activité" required>
      <Chips items={PRO_SECTEURS} selected={form.secteurs} onToggle={v=>toggleArr('secteurs',v)} />
    </Field>
    <CredentialsFields form={form} set={set} />
  </>
}

// ── Shared: Logo step ───────────────────────────────────────────────────────

function LogoStep({ form, set, handleLogoUpload }) {
  const fileRef = useRef()
  const initials = (form.entreprise || 'M').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Cette étape est facultative — vous pouvez la passer.</div>
    <div style={{display:'flex',gap:10,marginBottom:16}}>
      <button className={`ob-tab ${form.logoTab==='generate'?'active':''}`} onClick={()=>set('logoTab','generate')}>Générer</button>
      <button className={`ob-tab ${form.logoTab==='upload'?'active':''}`} onClick={()=>set('logoTab','upload')}>Uploader</button>
    </div>
    {form.logoTab === 'generate' ? <>
      {/* Preview — uses CompanyLogo pattern: monogram only, NEVER stored as image */}
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

// ── Pro: Services ───────────────────────────────────────────────────────────

function ProServicesStep({ form, set, toggleArr }) {
  const availableServices = form.secteurs.flatMap(s => PRO_SVC_MAP[s] || [])
  return <>
    {availableServices.length > 0 && (
      <Field label="Services">
        <Chips items={availableServices} selected={form.services} onToggle={v=>toggleArr('services',v)} />
      </Field>
    )}
    <Field label="Slogan"><input className="ob-input" value={form.slogan} onChange={e=>set('slogan',e.target.value)} placeholder="Bâtir avec excellence" maxLength={200}/></Field>
    <Field label="Bio"><textarea className="ob-input" value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Décrivez votre activité..." rows={3} style={{resize:'vertical'}} maxLength={2000}/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Projets réalisés"><input className="ob-input" value={form.projetsN} onChange={e=>set('projetsN',e.target.value)} placeholder="15+"/></Field>
      <Field label="Effectif"><input className="ob-input" value={form.effectif} onChange={e=>set('effectif',e.target.value)} placeholder="5-10"/></Field>
    </div>
  </>
}

// ── Pro: Portfolio ──────────────────────────────────────────────────────────

function ProPortfolioStep({ form, set, handlePhoto }) {
  const coverRef = useRef()
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:8}}>Ajoutez une image de couverture et vos réalisations (facultatif).</div>
    <Field label="Image de couverture">
      <input ref={coverRef} type="file" accept="image/*" onChange={e=>handlePhoto(e,'coverUrl')} style={{display:'none'}} />
      {form.coverUrl ? (
        <div style={{position:'relative'}}>
          <img src={form.coverUrl} alt="Cover" style={{width:'100%',height:120,objectFit:'cover',borderRadius:10}} />
          <button onClick={()=>set('coverUrl',null)} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.5)',color:'#fff',border:'none',borderRadius:'50%',width:24,height:24,cursor:'pointer',fontSize:12}}>x</button>
        </div>
      ) : (
        <button className="ob-btn-out" onClick={()=>coverRef.current?.click()}>Choisir une image</button>
      )}
    </Field>
  </>
}

// ── Fournisseur: Structure + Credentials ────────────────────────────────────

function FrnStructureStep({ form, set }) {
  return <>
    <Field label="Nom de l'entreprise" required><input className="ob-input" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} placeholder="MatériCI SARL"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Ville" required>
        <select className="ob-input" value={form.ville} onChange={e=>set('ville',e.target.value)}>
          <option value="">— Choisir —</option>
          {VILLES_CI.map(v=><option key={v}>{v}</option>)}
        </select>
      </Field>
      <Field label="Délai de livraison"><input className="ob-input" value={form.delaiLivraison} onChange={e=>set('delaiLivraison',e.target.value)} placeholder="24-48h"/></Field>
    </div>
    <PhoneField form={form} set={set} />
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="RCCM"><input className="ob-input" value={form.rccm} onChange={e=>set('rccm',e.target.value)} placeholder="CI-ABJ-2024-B-12345"/></Field>
      <Field label="NCC"><input className="ob-input" value={form.ncc} onChange={e=>set('ncc',e.target.value)} placeholder="CI0000000A"/></Field>
    </div>
    <CredentialsFields form={form} set={set} />
  </>
}

// ── Fournisseur: Catalogue ──────────────────────────────────────────────────

function FrnCatalogueStep({ form, toggleArr }) {
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Sélectionnez vos catégories de produits.</div>
    {FRN_CAT_SECTIONS.map(sec => (
      <div key={sec.title} style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--t2)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.03em'}}>{sec.title}</div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {sec.cats.map(c => {
            const active = form.categories.includes(c.label)
            return (
              <button key={c.label} type="button" onClick={()=>toggleArr('categories',c.label)}
                style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,border:active?'1.5px solid #7C3AED':'1px solid var(--border-card)',background:active?'rgba(124,58,237,.04)':'transparent',cursor:'pointer',textAlign:'left'}}>
                {c.em}<div><div style={{fontSize:12,fontWeight:600}}>{c.label}</div>{c.sub && <div style={{fontSize:10,color:'var(--t4)'}}>{c.sub}</div>}</div>
              </button>
            )
          })}
        </div>
      </div>
    ))}
  </>
}

// ── Fournisseur: Products (FACULTATIF) ──────────────────────────────────────

function FrnProductsStep({ form, set }) {
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>
      Ajoutez votre premier produit (facultatif). Vous pourrez compléter votre catalogue depuis votre espace.
    </div>
    <Field label="Nom du produit"><input className="ob-input" value={form.firstProductName} onChange={e=>set('firstProductName',e.target.value)} placeholder="Ciment CEM II 42.5"/></Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Prix (FCFA)"><input className="ob-input" type="number" value={form.firstProductPrice} onChange={e=>set('firstProductPrice',e.target.value)} placeholder="5500"/></Field>
      <Field label="Unité"><input className="ob-input" value={form.firstProductUnit} onChange={e=>set('firstProductUnit',e.target.value)} placeholder="/sac"/></Field>
    </div>
    <Field label="Catégorie">
      <select className="ob-input" value={form.firstProductCategory} onChange={e=>set('firstProductCategory',e.target.value)}>
        <option value="">— Choisir —</option>
        {FRN_CATEGORIES.map(c=><option key={c.id} value={c.label}>{c.label}</option>)}
      </select>
    </Field>
    {!form.firstProductName?.trim() && (
      <div style={{padding:'10px 12px',borderRadius:8,background:'rgba(234,88,12,.06)',fontSize:11,color:'#B45309',marginTop:8,display:'flex',alignItems:'center',gap:8}}>
        <Package size={14} /> Catalogue vide — vous pourrez ajouter des produits plus tard.
      </div>
    )}
  </>
}

// ── Fournisseur: Payout (OBLIGATOIRE) ───────────────────────────────────────

function FrnPayoutStep({ form, set }) {
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Comment souhaitez-vous recevoir vos paiements ?</div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {PAYOUT_METHODS.map(m => (
        <button key={m.id} type="button" onClick={()=>set('payoutType',m.id)}
          style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,border:form.payoutType===m.id?'2px solid #7C3AED':'1px solid var(--border-card)',background:form.payoutType===m.id?'rgba(124,58,237,.04)':'transparent',cursor:'pointer',textAlign:'left'}}>
          <span style={{fontSize:20}}>{m.icon}</span>
          <span style={{fontSize:13,fontWeight:600}}>{m.label}</span>
        </button>
      ))}
    </div>
    {form.payoutType && (form.payoutType === 'orange_money' || form.payoutType === 'mtn_momo' || form.payoutType === 'wave') && (
      <Field label="Numéro de téléphone associé" required>
        <input className="ob-input" value={form.payoutPhone} onChange={e=>set('payoutPhone',e.target.value)} placeholder="+225 07 00 00 00"/>
      </Field>
    )}
  </>
}

// ── Fournisseur: Zones ──────────────────────────────────────────────────────

function FrnZonesStep({ form, toggleArr }) {
  return <>
    <div style={{fontSize:12,color:'var(--t3)',marginBottom:12}}>Où livrez-vous ?</div>
    {FRN_ZONE_SECTIONS.map(sec => (
      <div key={sec.title} style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--t2)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.03em'}}>{sec.title}</div>
        <Chips items={sec.zones} selected={form.zones} onToggle={v=>toggleArr('zones',v)} />
      </div>
    ))}
  </>
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function PhoneField({ form, set }) {
  return (
    <Field label="Téléphone" required>
      <div style={{display:'flex',gap:6}}>
        <select className="ob-input" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:100,flexShrink:0}}>
          {PHONE_PREFIXES.map(p=><option key={p.code} value={p.code}>{p.flag} {p.code}</option>)}
        </select>
        <input className="ob-input" value={form.tel} onChange={e=>set('tel',e.target.value)} placeholder="07 00 00 00" style={{flex:1}}/>
      </div>
    </Field>
  )
}

function CredentialsFields({ form, set }) {
  const [showPwd, setShowPwd] = useState(false)
  return <>
    <Field label="Email professionnel" required>
      <input className="ob-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="contact@monentreprise.ci"/>
    </Field>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Field label="Mot de passe" required>
        <div style={{position:'relative'}}>
          <input className="ob-input" type={showPwd?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="8+ caractères" style={{paddingRight:40}}/>
          <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--t3)'}}>{showPwd?'Masquer':'Voir'}</button>
        </div>
      </Field>
      <Field label="Confirmation" required>
        <input className="ob-input" type="password" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} placeholder="••••••••"/>
      </Field>
    </div>
  </>
}
