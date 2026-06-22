import { useState, useRef, useEffect, memo } from 'react'
import Modal from '../components/shared/Modal'
import {
  Home, HardHat, Store, Hammer, Pencil,
  Search, CheckCircle2, Trophy,
  Wrench, Shield, Layers, Droplets, Snowflake, Zap, Sun, Droplet, Leaf,
  Sofa, BedDouble, UtensilsCrossed, ChefHat, Briefcase, Armchair, Building2, Trees, Car,
  PanelTop, Lock, Sparkles, FolderOpen, Check, Package, Eye, Megaphone, Ruler,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MoneyInput from '../components/shared/MoneyInput'
import compressImage from '../utils/compressImage'
import { api } from '../services/api/client'
import { useMeereo } from '../hooks/useMeereoStore'
import '../styles/onboarding.css'

/* ══════════════════════════════════════════════════════════
   SHARED DATA
══════════════════════════════════════════════════════════ */

const CARDS = [
  { id:'client', step:'01', title:'Je suis client',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    iconBg:'rgba(234,88,12,.08)',
    description:'Pilotez votre projet de construction, rénovation ou aménagement avec plus de clarté, de suivi et de maîtrise.',
    tags:['Logement','Commerce','Immeuble','Rénovation'],
    stats:[{label:'Suivi',value:'Temps reel'},{label:'Budget',value:'Maitrise'},{label:'Decisions',value:'Simplifiees'}],
  },
  { id:'pro', step:'02', title:'Je suis professionnel',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    iconBg:'rgba(124,58,237,.08)',
    description:'Architecte, entreprise, BET ou prestataire : centralisez vos missions, vos offres, vos équipes et votre exécution.',
    tags:['Architecte','BTP','BET','Prestataire'],
    stats:[{label:'AO',value:'Publier'},{label:'Projets',value:'Piloter'},{label:'Equipe',value:'Coordonner'}],
  },
  { id:'fournisseur', step:'03', title:'Je suis fournisseur',
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    iconBg:'rgba(8,145,178,.08)',
    description:'Référencez vos produits et services, recevez des demandes et gérez vos commandes depuis un même espace.',
    tags:['Matériaux','Équipements','Services','Commandes'],
    stats:[{label:'Catalogue',value:'Gerer'},{label:'Ventes',value:'Suivre'},{label:'Visibilite',value:'Booster'}],
  },
]

const FEATURES = [
  { num:'01', dot:'#EA580C', title:"Bourse des appels d'offres", desc:'Publiez vos besoins, comparez des offres qualifiées et composez votre équipe projet.' },
  { num:'02', dot:'#16A34A', title:'Marketplace intégrée', desc:'Accédez aux matériaux et équipements, commandez et faites livrer directement sur chantier.' },
  { num:'03', dot:'#0891B2', title:'Suivi & paiements sécurisés', desc:"Pilotez l'avancement, validez les étapes et sécurisez chaque flux financier." },
  { num:'04', dot:'#7C3AED', title:'KAI — Assistant personnel IA', desc:'Analyse, recommandations et orchestration intelligente pour piloter vos projets avec précision.' },
]

/* ── Client data ── */
const CLIENT_STEPS = [{n:1,label:'Mon profil'},{n:2,label:'Mon projet'},{n:3,label:'Ma situation'},{n:4,label:'Prêt à démarrer'}]
const CLIENT_TITLES = ['Vos informations','Votre projet','Votre situation','Prêt à démarrer']
const CLIENT_SUBS = [
  'Ces informations vous permettront de recevoir des devis et de communiquer plus facilement avec les professionnels adaptés à votre projet.',
  'Décrivez votre projet pour que les professionnels puissent vous faire des offres adaptées.',
  'Cela nous permettra de vous guider vers les prochaines étapes les plus adaptées.',
  'Votre profil est prêt. Lancez votre premier projet sur Meereo.',
]
const PT_TYPES = [
  {em:<Home size={20}/>,label:'Villa / Maison'},
  {em:<HardHat size={20}/>,label:'Immeuble R+'},
  {em:<Store size={20}/>,label:'Local commercial'},
  {em:<Hammer size={20}/>,label:'Rénovation'},
  {em:<Pencil size={20}/>,label:'Autre'},
]
const SITUATIONS = [
  {icon:<Search size={18}/>,bg:'rgba(234,88,12,.07)',title:"Je n'ai pas encore d'architecte",desc:"La plateforme va m'aider à trouver un architecte via un appel d'offres."},
  {icon:<CheckCircle2 size={18}/>,bg:'rgba(22,163,74,.07)',title:"J'ai déjà un architecte",desc:"Mon architecte est sur Meereo ou je peux l'inviter. Nous allons directement créer l'équipe de mission."},
  {icon:<Trophy size={18}/>,bg:'rgba(37,99,235,.07)',title:"Je veux une solution clé en main",desc:"Meereo coordonne l'ensemble — architecte, ingénieurs, constructeurs — je valide et suis l'avancement."},
  {icon:<Eye size={18}/>,bg:'rgba(99,102,241,.07)',title:"Je souhaite seulement découvrir la plateforme",desc:"Explorez les fonctionnalités de Meereo sans engagement. Vous pourrez créer un projet quand vous le souhaitez."},
]
const CLIENT_PROC = [
  {num:'1',color:'#EA580C',title:"Publiez votre Appel d'Offres",desc:"Votre AO est diffusé sur la Bourse Meereo. Architectes, ingénieurs et constructeurs qualifiés répondent."},
  {num:'2',color:'#7C3AED',title:"Comparez & choisissez votre équipe",desc:"Dans Offres à valider, comparez montant, délai, références. Acceptez ou refusez en un clic."},
  {num:'3',color:'#0891B2',title:"Commandez sur le Marketplace",desc:"Béton, carrelage, menuiseries — achetez sur le Marketplace Meereo, commandes liées à votre chantier."},
  {num:'4',color:'#16A34A',title:"Suivez & payez en sécurité",desc:"Phase par phase, jalons validés, paiement déclenché. Wave, Orange Money, MTN ou virement."},
]

/* ── Pro data ── */
const PRO_STEPS = [{n:1,label:'Ma structure'},{n:2,label:'Mon logo'},{n:3,label:'Services & Bio'},{n:4,label:'Portfolio & Équipe'},{n:5,label:'Mon profil public'}]
const PRO_TITLES = ['Votre structure','Votre identité visuelle','Services & Présentation','Portfolio & Équipe','Votre profil est prêt']
const PRO_SUBS = [
  'Ces informations apparaîtront sur votre profil public et dans la Bourse des Appels d\'Offres.',
  'Personnalisez votre marque ou chargez un logo existant. Cette identité apparaîtra sur votre profil public et dans toutes vos communications.',
  'Ces informations construisent votre page publique. Plus vous êtes précis, plus vous recevrez des missions adaptées à votre expertise.',
  'Les photos de réalisations augmentent de 4× vos chances d\'être sélectionné sur un appel d\'offres.',
  'Votre page publique professionnelle est créée et indexée. Partagez-la pour recevoir des demandes directes.',
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
// Shape → CSS borderRadius + transform
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
const LOGO_TYPOS = ['Gras','Serif','Léger']

/* ── Fournisseur data ── */
const FRN_STEPS = [{n:1,label:'Ma structure'},{n:2,label:'Mon logo'},{n:3,label:'Mon catalogue'},{n:4,label:'Mes produits'},{n:5,label:'Ma livraison'},{n:6,label:'Prêt à démarrer'}]
const FRN_TITLES = ['Votre structure','Votre identité visuelle','Votre catalogue','Vos premiers produits','Zones de livraison','Prêt à démarrer']
const FRN_SUBS = [
  'Ces informations apparaîtront sur votre page fournisseur et dans le Marketplace.',
  'Personnalisez votre marque ou chargez un logo existant.',
  'Sélectionnez les catégories de produits que vous proposez.',
  'Ajoutez vos premiers produits pour commencer à vendre sur le Marketplace.',
  'Où livrez-vous vos produits ? Sélectionnez les zones couvertes.',
  'Votre espace fournisseur est prêt. Vos produits sont sur le Marketplace.',
]
const FRN_CAT_SECTIONS = [
  {title:'Matériaux de construction',cats:[
    {em:<HardHat size={14}/>,label:'Gros Œuvre',sub:'Béton, agglos, gravier, sable, ciment'},
    {em:<Wrench size={14}/>,label:'Structure & Charpente',sub:'Acier, profilés, rond à béton, charpente métal'},
    {em:<Shield size={14}/>,label:'Isolation & Étanchéité',sub:'Laine de roche, membrane EPDM, mousse'},
    {em:<PanelTop size={14}/>,label:'Menuiseries',sub:'Fenêtres, portes, baies vitrées, stores, volets'},
    {em:<Layers size={14}/>,label:'Revêtements',sub:'Carrelage, parquet, peinture, enduit, faïence'},
  ]},
  {title:'Installations techniques',cats:[
    {em:<Droplets size={14}/>,label:'Plomberie & Sanitaires',sub:'Robinetterie, WC, douche, baignoire, chauffe-eau'},
    {em:<Snowflake size={14}/>,label:'CVC & Climatisation',sub:'Splits, VRV, ventilation, pompe à chaleur'},
    {em:<Zap size={14}/>,label:'Électricité',sub:'Tableaux, câbles, LED, groupes électrogènes'},
  ]},
  {title:'Green & Énergie durable',cats:[
    {em:<Sun size={14}/>,label:'Solaire & Photovoltaïque',sub:'Panneaux solaires, onduleurs, batteries, kits'},
    {em:<Droplet size={14}/>,label:'Traitement de l\'eau',sub:'Filtration, adoucisseurs, recuperation eau de pluie'},
    {em:<Home size={14}/>,label:'Domotique & Smart Home',sub:'Automatisation, capteurs, gestion énergie, sécurité'},
    {em:<Leaf size={14}/>,label:'Éco-matériaux',sub:'Isolants naturels, bois certifié, peinture écologique'},
  ]},
  {title:'Mobilier & Aménagement',cats:[
    {em:<Sofa size={14}/>,label:'Salon & Séjour',sub:'Canapés, tables basses, meubles TV, étagères'},
    {em:<BedDouble size={14}/>,label:'Chambre & Literie',sub:'Lits, matelas, armoires, commodes, chevets'},
    {em:<UtensilsCrossed size={14}/>,label:'Salle à manger',sub:'Tables, chaises, buffets, vaisselle'},
    {em:<ChefHat size={14}/>,label:'Cuisine & Équipements',sub:'Meubles cuisine, électroménager, réfrigérateurs'},
    {em:<Droplets size={14}/>,label:'Salle de bain',sub:'Meubles vasque, miroirs, accessoires, rangements'},
  ]},
  {title:'Mobilier professionnel',cats:[
    {em:<Briefcase size={14}/>,label:'Mobilier Bureau',sub:'Bureaux, chaises ergonomiques, armoires, cloisons'},
    {em:<Armchair size={14}/>,label:'Mobilier Collectif',sub:'Chaises empilables, tables, bancs, rangements'},
    {em:<Building2 size={14}/>,label:'Hôtellerie & Restauration',sub:'Mobilier hôtel, restaurant, terrasse'},
  ]},
  {title:'Extérieur & Aménagement paysager',cats:[
    {em:<Trees size={14}/>,label:'Jardin & Terrasse',sub:'Mobilier extérieur, pergolas, clôtures, éclairage'},
    {em:<Wrench size={14}/>,label:'Outillage & Quincaillerie',sub:'Outils, visserie, fixations, EPI'},
    {em:<Car size={14}/>,label:'Portails & Accès',sub:'Portails, interphones, contrôle d\'accès, motorisation'},
  ]},
]
const FRN_ZONE_SECTIONS = [
  {title:'Abidjan & communes',zones:['Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé','Koumassi','Port-Bouët','Bingerville','Anyama','Songon']},
  {title:'Grandes villes',zones:['Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo','Abengourou','Grand-Bassam']},
  {title:'Sud & Lagunes',zones:['Dabou','Jacqueville','Tiassalé','Agboville','Adzopé','Aboisso','Bonoua']},
  {title:'Centre & Nord',zones:['Toumodi','Dimbokro','Bondoukou','Katiola','Ferkessédougou','Odienné','Séguéla','Mankono','Tengréla']},
  {title:'Ouest & Sud-Ouest',zones:['Soubré','Sassandra','Tabou','Guiglo','Duékoué','Danané','Biankouma','Issia']},
  {title:'Couverture',zones:['Tout le territoire national','Zones rurales & villages']},
]

const PAYS = ["Côte d'Ivoire","Sénégal","Mali","Burkina Faso","Guinée","Cameroun","Bénin","Togo","Niger","France","Autre"]

const VILLES_CI = [
  'Abidjan','Plateau','Cocody','Marcory','Yopougon','Treichville','Abobo','Adjamé',
  'Koumassi','Port-Bouët','Bingerville','Anyama','Songon',
  'Bouaké','Yamoussoukro','Daloa','San-Pédro','Korhogo','Man','Gagnoa','Divo',
  'Abengourou','Grand-Bassam','Dabou','Jacqueville','Tiassalé','Agboville',
  'Adzopé','Aboisso','Bonoua','Toumodi','Dimbokro','Bondoukou','Katiola',
  'Ferkessédougou','Odienné','Séguéla','Mankono','Soubré','Sassandra','Tabou',
  'Guiglo','Duékoué','Danané','Issia',
]

const PHONE_PREFIXES = [
  { code: '+225', flag: '🇨🇮', country: "Côte d'Ivoire" },
  { code: '+221', flag: '🇸🇳', country: 'Sénégal' },
  { code: '+223', flag: '🇲🇱', country: 'Mali' },
  { code: '+226', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: '+224', flag: '🇬🇳', country: 'Guinée' },
  { code: '+237', flag: '🇨🇲', country: 'Cameroun' },
  { code: '+229', flag: '🇧🇯', country: 'Bénin' },
  { code: '+228', flag: '🇹🇬', country: 'Togo' },
  { code: '+227', flag: '🇳🇪', country: 'Niger' },
  { code: '+234', flag: '🇳🇬', country: 'Nigéria' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+212', flag: '🇲🇦', country: 'Maroc' },
  { code: '+216', flag: '🇹🇳', country: 'Tunisie' },
  { code: '+213', flag: '🇩🇿', country: 'Algérie' },
  { code: '+20',  flag: '🇪🇬', country: 'Égypte' },
  { code: '+243', flag: '🇨🇩', country: 'Congo RDC' },
  { code: '+33',  flag: '🇫🇷', country: 'France' },
  { code: '+32',  flag: '🇧🇪', country: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', country: 'Suisse' },
  { code: '+1',   flag: '🇺🇸', country: 'USA / Canada' },
  { code: '+44',  flag: '🇬🇧', country: 'Royaume-Uni' },
]

/* ══════════════════════════════════════════════════════════
   SVG Components
══════════════════════════════════════════════════════════ */

const ConstructionSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" fill="none" style={{width:'100%',display:'block'}}>
    <line x1="0" y1="232" x2="420" y2="232" stroke="#BBBBBB" strokeWidth="2"/>
    <rect x="6" y="214" width="68" height="14" rx="7" stroke="#BBBBBB" strokeWidth="1.5"/>
    <line x1="16" y1="214" x2="16" y2="228" stroke="#CCCCCC" strokeWidth="1"/><line x1="36" y1="214" x2="36" y2="228" stroke="#CCCCCC" strokeWidth="1"/><line x1="56" y1="214" x2="56" y2="228" stroke="#CCCCCC" strokeWidth="1"/>
    <rect x="14" y="190" width="52" height="26" rx="4" stroke="#BBBBBB" strokeWidth="1.5"/>
    <line x1="58" y1="198" x2="92" y2="152" stroke="#BBBBBB" strokeWidth="3" strokeLinecap="round"/>
    <line x1="92" y1="152" x2="112" y2="188" stroke="#BBBBBB" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M105,184 L118,184 L121,200 L102,200 Z" stroke="#BBBBBB" strokeWidth="1.8"/>
    <rect x="138" y="72" width="84" height="160" stroke="#BFBFBF" strokeWidth="1.8"/>
    <line x1="138" y1="112" x2="222" y2="112" stroke="#CCCCCC" strokeWidth="1.2"/><line x1="138" y1="148" x2="222" y2="148" stroke="#CCCCCC" strokeWidth="1.2"/><line x1="138" y1="184" x2="222" y2="184" stroke="#CCCCCC" strokeWidth="1.2"/>
    <line x1="163" y1="72" x2="163" y2="232" stroke="#CCCCCC" strokeWidth="1"/><line x1="197" y1="72" x2="197" y2="232" stroke="#CCCCCC" strokeWidth="1"/>
    <rect x="143" y="80" width="14" height="18" rx="1" stroke="#D0D0D0" strokeWidth="1"/><rect x="168" y="80" width="14" height="18" rx="1" stroke="#D0D0D0" strokeWidth="1"/><rect x="202" y="80" width="14" height="18" rx="1" stroke="#D0D0D0" strokeWidth="1"/>
    <rect x="166" y="196" width="24" height="36" rx="2" stroke="#CCCCCC" strokeWidth="1.5"/>
    <line x1="224" y1="72" x2="224" y2="232" stroke="#C5C5C5" strokeWidth="1.8"/><line x1="242" y1="72" x2="242" y2="232" stroke="#C5C5C5" strokeWidth="1.8"/>
    <line x1="224" y1="92" x2="242" y2="92" stroke="#C5C5C5" strokeWidth="1.2"/><line x1="224" y1="132" x2="242" y2="132" stroke="#C5C5C5" strokeWidth="1.2"/><line x1="224" y1="172" x2="242" y2="172" stroke="#C5C5C5" strokeWidth="1.2"/>
    <circle cx="233" cy="120" r="5.5" stroke="#C0C0C0" strokeWidth="1.5"/>
    <line x1="276" y1="8" x2="276" y2="232" stroke="#BBBBBB" strokeWidth="2.8" strokeLinecap="round"/>
    <line x1="276" y1="12" x2="390" y2="12" stroke="#BBBBBB" strokeWidth="2.2"/><line x1="236" y1="12" x2="276" y2="12" stroke="#BBBBBB" strokeWidth="2.2"/>
    <rect x="268" y="8" width="22" height="14" rx="3" stroke="#BBBBBB" strokeWidth="1.5"/>
    <ellipse cx="370" cy="196" rx="26" ry="32" stroke="#C0C0C0" strokeWidth="1.8"/>
    <rect x="318" y="190" width="88" height="32" rx="3" stroke="#BBBBBB" strokeWidth="1.5"/>
    <circle cx="333" cy="226" r="9" stroke="#BBBBBB" strokeWidth="1.8"/><circle cx="388" cy="226" r="9" stroke="#BBBBBB" strokeWidth="1.8"/>
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

/* ══════════════════════════════════════════════════════════
   SHARED WIZARD PANEL (LEFT)
══════════════════════════════════════════════════════════ */

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
              const active = currentStep === s.n
              const done = currentStep > s.n
              return (
                <div key={s.n}>
                  <div className={`wiz-step-row ${active ? 'active' : ''}`}>
                    <div className={`wiz-step-num ${done||active ? 'filled' : ''}`}>{done ? <CheckSVG /> : s.n}</div>
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

        <div className="wiz-left-stats">
          {[['4 min','Pour s\'inscrire']].map(([n,l]) => (
            <div key={l}><div className="wiz-stat-n">{n}</div><div className="wiz-stat-l">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
})

/* ── KAI brand: dot of the i is purple ── */
const Kai = () => <span className="kai-brand" style={{color:'#7C3AED'}}>KAI</span>

/* ── Shared field component (OUTSIDE to avoid re-mount) ── */
const Field = ({label,required,children}) => (
  <div className="ob-field"><label className="ob-label-v2">{label}{required&&' *'}</label>{children}</div>
)

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */

export default function Onboarding() {
  // Restore wizard state from sessionStorage (survives refresh, not logout)
  const savedWiz = useRef(null)
  try { savedWiz.current = JSON.parse(sessionStorage.getItem('meereo_onboarding') || 'null') } catch { savedWiz.current = null }
  const [screen, setScreen] = useState(savedWiz.current?.screen || 'auth')
  const [email, setEmail] = useState(savedWiz.current?.email || '')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [userType, setUserType] = useState(savedWiz.current?.userType || null)
  const [wizStep, setWizStep] = useState(savedWiz.current?.wizStep || 1)
  const [teamName, setTeamName] = useState('')
  const [teamRole, setTeamRole] = useState('')
  const [teamEmail, setTeamEmail] = useState('')
  const [teamPhoto, setTeamPhoto] = useState(null)
  const [svcCustom, setSvcCustom] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodUnit, setProdUnit] = useState('/unité')
  const [prodCat, setProdCat] = useState('')
  const [prodPhoto, setProdPhoto] = useState(null)
  const [showAOConfirm, setShowAOConfirm] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const photoRef = useRef()

  const defaultForm = {
    photo:null, photoUrl:null,
    prenom:'', nom:'', email:'', tel:'', telPrefix:'+225', ville:'Abidjan', pays:"Côte d'Ivoire", password:'', passwordConfirm:'',
    // Client
    projectType:null, location:'', surface:'', budget:'', description:'',
    situation:null, architecteEmail:'',
    // Pro — structure
    entreprise:'', secteurs:[], annee:'', rccm:'', ncc:'', emailPro:'', telPro:'',
    // Pro — logo
    logoColor:'#1D1D1F', logoShape:'Hexagone', logoTypo:'Gras', logoTab:'generate', logoFile:null, logoFileUrl:null,
    // Pro — services & bio
    slogan:'', bio:'', services:[], projetsN:'', effectif:'',
    // Pro — portfolio & team
    portfolioFiles:[], coverFile:null, coverUrl:null, team:[],
    // Fournisseur
    categories:[], zones:[], delaiLivraison:'',
    products:[], // [{name,price,unit,category,photoUrl}]
  }
  const [form, setForm] = useState(savedWiz.current?.form ? { ...defaultForm, ...savedWiz.current.form } : defaultForm)

  const { store, loginUser, createUser, createAO, showToast, addProduct } = useMeereo()

  // Persist wizard progress to sessionStorage (survives refresh)
  useEffect(() => {
    try {
      const safe = { screen, email, userType, wizStep, form: { ...form, photo: null, logoFile: null, coverFile: null } }
      sessionStorage.setItem('meereo_onboarding', JSON.stringify(safe))
    } catch { /* quota exceeded — ignore */ }
  }, [screen, email, userType, wizStep, form])
  const navigate = useNavigate()

  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const toggleArr = (k,v) => setForm(f => ({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}))
  const handlePhoto = async (e) => {
    const f=e.target.files[0]; if(!f) return;
    // Compress and show preview immediately
    const compressed = await compressImage(f, 400, 0.8)
    set('photoUrl', compressed)
    // Upload to MinIO in background
    try { const { uploadFile } = await import('../utils/upload'); const url = await uploadFile(f, 'avatars', 'profile'); set('photoUrl', url) } catch(err) { console.warn('Upload fallback:', err) }
  }

  // RCCM & NCC validation
  const validateRCCM = (v) => {
    if (!v) return null // optional
    // Format: CI-XXX-YYYY-X-NNNNN (ex: CI-ABJ-2024-B-12345)
    const clean = v.toUpperCase().replace(/\s/g, '')
    if (/^CI-[A-Z]{2,4}-\d{4}-[A-Z]-\d{3,6}$/.test(clean)) return null
    // Accept format with separators: CI/XXX/YYYY/X/NNNNN
    if (/^CI[-/][A-Z]{2,4}[-/]\d{4}[-/][A-Z][-/]\d{3,6}$/.test(clean)) return null
    return 'Format attendu : CI-ABJ-2024-B-12345'
  }
  const validateNCC = (v) => {
    if (!v) return null // optional
    const clean = v.toUpperCase().replace(/[\s-]/g, '')
    // Format: CI + 7 digits + letter (ex: CI1234567A)
    if (/^CI\d{7,9}[A-Z]$/.test(clean)) return null
    // Looser: starts with CI or just digits
    if (/^\d{7,}[A-Z]?$/.test(clean)) return null
    return 'Format attendu : CI-0000000-A'
  }
  const rccmError = form.rccm ? validateRCCM(form.rccm) : null
  const nccError = form.ncc ? validateNCC(form.ncc) : null

  const handleLogin = async () => {
    if (!email) { showToast('Veuillez saisir votre email','orange'); return }
    if (!password) { showToast('Mot de passe requis','orange'); return }
    try {
      const user = await loginUser(email, password)
      if (!user) { showToast('Aucun compte trouvé avec cet email. Créez un espace ci-dessous.','orange'); return }
      showToast('Connexion réussie !','green')
      // user.type vient directement du backend — source de vérité
      const type = user?.type
      if (type === 'client') navigate('/client')
      else if (type === 'fournisseur') navigate('/fournisseur')
      else if (type === 'pro' || !type) navigate('/cockpit')
      else navigate('/cockpit')
    } catch (e) {
      showToast(e.message || 'Erreur de connexion','red')
    }
  }
  const handleContinue = () => { if(!userType) return; setScreen('wizard'); setWizStep(1) }
  const handleFinish = async (overrideDest) => {
    // Validation des champs requis
    const name = `${form.prenom || ''} ${form.nom || ''}`.trim()
    const email = form.email || form.emailPro || ''
    if (userType === 'pro' && !form.entreprise) {
      showToast('Veuillez renseigner le nom de votre structure', 'red'); return
    }
    if (userType === 'client' && !name && !form.prenom) {
      showToast('Veuillez renseigner votre prénom', 'red'); return
    }
    if (!email || !email.includes('@')) {
      showToast('Veuillez renseigner une adresse email valide', 'red'); return
    }
    // Validation du mot de passe — obligatoire pour tous les types
    if (!form.password || form.password.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'red'); return
    }
    if (form.passwordConfirm && form.password !== form.passwordConfirm) {
      showToast('Les mots de passe ne correspondent pas', 'red'); return
    }

    // 1. Create user + save ALL onboarding data in ONE atomic updateStore
    // IMPORTANT: strip File objects — they can't be JSON.stringify'd and would crash saveToStorage
    const fullData = {
      ...form,
      tel: ((form.telPrefix || '+225').trim() + ' ' + (form.tel || '').trim()).trim(),
      userType,
      cockpitTeam: form.team || [],
      portfolio: (form.portfolioFiles || []).map((url, i) => ({ img: url, cap: form.portfolio?.[i]?.cap || 'Réalisation ' + (i+1), feat: i === 0 })),
    }
    // Remove non-serializable fields
    delete fullData.photo       // File object
    delete fullData.logoFile    // File object
    delete fullData.coverFile   // File object
    delete fullData.password        // ne pas stocker le mot de passe en clair dans onboardingData
    delete fullData.passwordConfirm // idem
    // fullData.photoUrl, fullData.logoFileUrl, fullData.coverUrl are already strings (base64 or MinIO URL)
    try {
      // email/name/type APRÈS fullData pour ne pas être écrasés par form.email='' (pro/fournisseur utilisent emailPro)
      await createUser({...fullData, email:email||'demo@meereo.ci', name:name || form.entreprise || 'Utilisateur', type:userType})
    } catch (createErr) {
      showToast(createErr.message || 'Erreur lors de la création du compte', 'red')
      return
    }

    // Clear wizard progress — account created successfully
    try { sessionStorage.removeItem('meereo_onboarding') } catch {}

    // 2. Register products for fournisseur
    if(userType==='fournisseur' && form.products.length>0) {
      form.products.forEach(p => addProduct({name:p.name, price:p.price, unit:p.unit, category:p.category, photoUrl:p.photoUrl}))
    }

    showToast('Compte créé avec succès\u00a0!','green')

    // 3. Send email verification (async, non-blocking)
    const userEmail = form.email || form.emailPro
    if (userEmail && userEmail.includes('@')) {
      api.auth.sendVerification(userEmail).catch(() => {})
    }

    // 4b. Auto-AO pour les clients selon leur situation
    if (userType === 'client') {
      const noArchi = form.situation === "Je n'ai pas encore d'architecte"
      const cleEnMain = form.situation === "Je veux une solution clé en main"
      if (noArchi || cleEnMain) {
        const projectLabel = form.projectType || 'Construction'
        const locationLabel = form.location ? ` — ${form.location}` : ''
        const surfaceLabel = form.surface ? `, ${form.surface} m²` : ''
        await createAO({
          title: noArchi
            ? `Recherche architecte · ${projectLabel}${locationLabel}`
            : `Mission complète · ${projectLabel}${locationLabel}`,
          description: [
            form.description || '',
            form.surface ? `Surface : ${form.surface} m²` : '',
            form.budget && form.budget !== '— Choisir —' ? `Budget : ${form.budget}` : '',
            form.location ? `Localisation : ${form.location}` : '',
          ].filter(Boolean).join('\n'),
          budget: form.budget && form.budget !== '— Choisir —' ? form.budget : '',
          lot: noArchi ? 'Architecte' : 'Tous corps de métier',
          requestedTrade: noArchi ? 'Architecte' : 'Mission complète',
          visibilityScope: noArchi ? 'trade_only' : 'public',
          autoGenerated: true,
          createdByClient: true,
        })
      }
    }

    // 6. Send invitation emails for pending team members (non-blocking)
    if (userType === 'pro' && form.team.length > 0) {
      form.team.filter(m => m.pending && m.email).forEach(m => {
        api.auth.sendVerification(m.email).catch(() => {})
      })
    }

    // 8. Redirect — navigate() via React Router (évite le rechargement complet de page)
    setTimeout(() => {
      if (overrideDest) { navigate(overrideDest); return }
      if(userType==='client') navigate('/client')
      else if(userType==='fournisseur') navigate('/fournisseur')
      else navigate('/cockpit')
    }, 150)
  }

  const STEPS_MAP = { client:CLIENT_STEPS, pro:PRO_STEPS, fournisseur:FRN_STEPS }
  const TITLES_MAP = { client:CLIENT_TITLES, pro:PRO_TITLES, fournisseur:FRN_TITLES }
  const SUBS_MAP = { client:CLIENT_SUBS, pro:PRO_SUBS, fournisseur:FRN_SUBS }
  const steps = userType ? STEPS_MAP[userType] : []
  const titles = userType ? TITLES_MAP[userType] : []
  const subs = userType ? SUBS_MAP[userType] : []
  const totalSteps = steps.length


  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */

  return (
    <div className="onboarding-shell">

      {/* ════ AUTH SCREEN ════ */}
      {screen === 'auth' && (<>
        <div className="ob-screen">
          <div className="ob-left">
            {/* Z1 — Logo + Badge */}
            <div className="ob-z1">
              <div className="ob-logo-row"><span style={{fontSize:28,lineHeight:1}}>🇨🇮</span><LogoSVG /><div><div className="ob-brand">MEEREO</div><div className="ob-brand-sub">Plateforme BTP et Immobilier — Côte-d'Ivoire</div></div></div>
              <div className="ob-z3"><span className="ob-z3-dot" /> ACTUELLEMENT DISPONIBLE QU'EN CÔTE D'IVOIRE</div>
            </div>
            {/* Z2 — Espace vide maîtrisé */}
            <div className="ob-z2" />
            {/* Z4 — Titre */}
            <h1 className="ob-z4">Structure, pilote et sécurise<br/><em>vos projets</em><br/><em>immobiliers.</em></h1>
            {/* Z5 — Intro */}
            <p className="ob-z5">Centralisez chaque acteur, chaque étape et chaque décision sur une seule plateforme. De la conception à la livraison, MEEREO vous donne un contrôle total.</p>
            {/* Z6 — Features */}
            <div className="ob-z6">
              {FEATURES.map(f => (
                <div key={f.num} className="ob-z6-item"><span className="ob-z6-num">{f.num}</span><div><div className="ob-z6-hdr"><div className="ob-z6-dot" style={{background:f.dot}} /><div className="ob-z6-title">{f.title}</div></div><div className="ob-z6-text">{f.desc}</div></div></div>
              ))}
            </div>
            {/* Z7 — Stats bas */}
            <div className="ob-z7">
              <svg className="ob-z7-bg" viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Tour haute gauche */}
                <rect x="15" y="10" width="48" height="150" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="24" y="24" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="24" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="24" y="52" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="52" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="24" y="80" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="80" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="30" y="110" width="18" height="50" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Immeuble large */}
                <rect x="80" y="30" width="70" height="130" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="90" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="90" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="90" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="103" y="118" width="20" height="42" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Bâtiment moyen avec horloge */}
                <rect x="170" y="50" width="50" height="110" rx="2" stroke="currentColor" strokeWidth="1"/>
                <circle cx="195" cy="70" r="10" stroke="currentColor" strokeWidth=".7"/>
                <line x1="195" y1="70" x2="195" y2="63" stroke="currentColor" strokeWidth=".5"/>
                <line x1="195" y1="70" x2="200" y2="70" stroke="currentColor" strokeWidth=".5"/>
                <rect x="180" y="92" width="12" height="16" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="198" y="92" width="12" height="16" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="186" y="122" width="18" height="38" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Grue */}
                <line x1="248" y1="160" x2="248" y2="8" stroke="currentColor" strokeWidth="1"/>
                <line x1="248" y1="8" x2="300" y2="8" stroke="currentColor" strokeWidth=".8"/>
                <line x1="300" y1="8" x2="300" y2="28" stroke="currentColor" strokeWidth=".5"/>
                <line x1="248" y1="8" x2="238" y2="30" stroke="currentColor" strokeWidth=".5"/>
                <rect x="240" y="145" width="16" height="15" stroke="currentColor" strokeWidth=".6"/>
                {/* Tour droite fine */}
                <rect x="320" y="20" width="36" height="140" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="328" y="32" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="32" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="54" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="54" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="76" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="76" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="98" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="98" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                {/* Dôme */}
                <path d="M380 160 L380 100 Q400 60 420 100 L420 160" stroke="currentColor" strokeWidth="1" fill="none"/>
                <rect x="393" y="110" width="14" height="50" rx="1" stroke="currentColor" strokeWidth=".5"/>
                {/* Pyramide / toit */}
                <path d="M440 160 L465 80 L490 160" stroke="currentColor" strokeWidth="1" fill="none"/>
                <line x1="465" y1="80" x2="465" y2="70" stroke="currentColor" strokeWidth=".6"/>
              </svg>
              <div className="ob-z7-content">
                <div><div className="ob-z7-title">🇨🇮 Côte d'Ivoire</div><div className="ob-z7-sub">Marché de lancement</div></div>
                <div><div className="ob-z7-title">BTP & Immobilier</div><div className="ob-z7-sub">Secteurs clés</div></div>
                <div><div className="ob-z7-title">Afrique de l'Ouest</div><div className="ob-z7-sub">Déploiement progressif</div></div>
              </div>
            </div>
          </div>
          <div className="ob-panel-white ob-panel-white--auth">
            <div className="ob-auth-content">
              <div className="ob-auth-intro">
                <div className="ob-badge" style={{marginBottom:14}}><div className="ob-badge-dot" style={{width:8,height:8}} /><span style={{fontSize:13}}>Choisissez votre rôle sur la plateforme</span></div>
                <div className="ob-auth-headline">Une entrée pensée pour chaque acteur du projet.</div>
                <div className="ob-auth-subline">Client, professionnel ou fournisseur : Meereo adapte l'expérience, les outils et le parcours selon votre rôle.</div>
              </div>
              <div className="ob-auth-card">
                {/* Titre */}
                <div className="ob-auth-card-title" style={{display:'inline-flex',alignItems:'center',gap:10}}>Accédez à votre espace MEEREO <span style={{fontSize:40,lineHeight:1,display:'inline-block',animation:'waveHand 2.5s ease-in-out 1'}}>&#x1F44B;</span></div>
                <style>{`@keyframes waveHand { 0%,100% { transform: rotate(0deg); } 15% { transform: rotate(14deg); } 30% { transform: rotate(-8deg); } 45% { transform: rotate(10deg); } 60% { transform: rotate(-4deg); } 75% { transform: rotate(6deg); } }`}</style>

                {/* Sous-titre statutaire */}
                <div style={{fontSize:11.5,fontWeight:500,color:'var(--t4)',marginTop:10,letterSpacing:'.02em'}}>Votre centre de pilotage immobilier.</div>

                {/* Description */}
                <div className="ob-auth-card-sub" style={{marginTop:14,marginBottom:0}}>Retrouvez vos projets, vos équipes et pilotez chaque opération en temps réel.</div>

                {/* Micro-texte contextuel */}
                <div style={{fontSize:11,color:'var(--t4)',marginTop:20,marginBottom:20,fontStyle:'italic'}}>Reprenez exactement là où vous vous êtes arrêté.</div>

                {/* Formulaire */}
                <div className="ob-field" style={{marginBottom:14}}><label className="ob-label-v2">Adresse e-mail</label><input className="ob-input-v2" type="email" placeholder="ex : contact@entreprise.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleLogin() }} /></div>
                <div className="ob-field" style={{marginBottom:22}}>
                  <div className="ob-label-row"><label className="ob-label-v2">Mot de passe</label><a href="#" className="ob-link-forgot" onClick={e => { e.preventDefault(); setForgotEmail(email); setForgotSent(false); setShowForgot(true) }}>Mot de passe oublié ?</a></div>
                  <div className="ob-pwd-wrap"><input className="ob-input-v2" type={showPwd?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleLogin() }} style={{paddingRight:52}} /><button className="ob-pwd-toggle" onClick={()=>setShowPwd(!showPwd)}>{showPwd?'Masquer':'Afficher'}</button></div>
                </div>

                {/* Actions */}
                <button className="ob-btn-blk" onClick={handleLogin}>Entrer dans mon espace</button>
                <div className="ob-divider-v2" style={{margin:'20px 0'}}><span style={{fontSize:11,color:'var(--t4)',fontWeight:500}}>Ou créer un nouvel espace</span></div>
                <button className="ob-btn-out" onClick={()=>setScreen('type')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  Créer mon espace MEEREO
                </button>

                {/* Légal */}
                <div className="ob-legal" style={{marginTop:16}}>En continuant, vous acceptez nos <a href="/conditions" className="ob-link-soft" onClick={e => { e.preventDefault(); navigate('/conditions') }}>Conditions d'utilisation</a> et notre <a href="/confidentialite" className="ob-link-soft" onClick={e => { e.preventDefault(); navigate('/confidentialite') }}>Politique de confidentialité</a>.</div>

                {/* KAI */}
                <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid rgba(0,0,0,.05)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:'#191c1d',boxShadow:'0 0 6px rgba(124,58,237,.2), 0 0 2px rgba(124,58,237,.35)',flexShrink:0,animation:'kaiPulseLogin 3s ease-in-out infinite'}} />
                    <span style={{fontSize:13,color:'var(--t2)',fontWeight:600,letterSpacing:'.01em'}}>KAI : prêt à reprendre votre projet en cours.</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--t3)',paddingLeft:18,lineHeight:1.55}}>Analyse, recommandations et pilotage intelligent à chaque étape.</div>
                </div>
                <style>{`@keyframes kaiPulseLogin { 0%,100% { box-shadow: 0 0 6px rgba(124,58,237,.2), 0 0 2px rgba(124,58,237,.35); } 50% { box-shadow: 0 0 12px rgba(124,58,237,.35), 0 0 4px rgba(124,58,237,.5); } }`}</style>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Mot de passe oublie */}
        {showForgot && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowForgot(false)}>
            <div style={{ background: '#fff', borderRadius: 16, width: 420, maxWidth: '90vw', boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden', animation: 'modalIn .18s ease' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px 24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.3px' }}>Reinitialiser votre mot de passe</h3>
                  <button onClick={() => setShowForgot(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t4)' }}>x</button>
                </div>
                {!forgotSent ? (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 16 }}>Saisissez l'adresse email associée à votre compte. Si un compte existe, vous recevrez un lien de réinitialisation.</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 5 }}>Adresse email</label>
                      <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="vous@exemple.com" style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-subtle)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} autoFocus />
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>&#9989;</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>Email envoyé</div>
                    <p style={{ fontSize: 12, color: 'var(--t4)', lineHeight: 1.6 }}>Si un compte existe avec <strong>{forgotEmail}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes. Pensez à vérifier vos spams.</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', marginTop: 8 }}>
                {!forgotSent ? (
                  <>
                    <button onClick={() => setShowForgot(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--f)', color: 'var(--t3)', cursor: 'pointer' }}>Annuler</button>
                    <button onClick={() => { if (!forgotEmail.trim() || !forgotEmail.includes('@')) { showToast('Saisissez un email valide', 'orange'); return } setForgotSent(true) }} disabled={!forgotEmail.trim()} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: forgotEmail.trim() ? 'var(--tx)' : 'var(--s3)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--f)', color: forgotEmail.trim() ? '#fff' : 'var(--t4)', cursor: 'pointer' }}>Envoyer le lien</button>
                  </>
                ) : (
                  <button onClick={() => { setShowForgot(false); setForgotSent(false) }} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--tx)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--f)', color: '#fff', cursor: 'pointer' }}>Fermer</button>
                )}
              </div>
            </div>
          </div>
        )}
      </>)}

      {/* ════ TYPE SELECTION ════ */}

      {screen === 'type' && (
        <div className="ob-screen">
          <div className="ob-left">
            {/* Z1 — Logo + Badge */}
            <div className="ob-z1">
              <div className="ob-logo-row"><span style={{fontSize:28,lineHeight:1}}>🇨🇮</span><LogoSVG /><div><div className="ob-brand">MEEREO</div><div className="ob-brand-sub">Plateforme BTP et Immobilier — Côte-d'Ivoire</div></div></div>
              <div className="ob-z3"><span className="ob-z3-dot" /> ACTUELLEMENT DISPONIBLE QU'EN CÔTE D'IVOIRE</div>
            </div>
            {/* Z2 — Espace vide maîtrisé */}
            <div className="ob-z2" />
            {/* Z4 — Titre */}
            <h1 className="ob-z4">Structure, pilote et sécurise<br/><em>vos projets</em><br/><em>immobiliers.</em></h1>
            {/* Z5 — Intro */}
            <p className="ob-z5">Centralisez chaque acteur, chaque étape et chaque décision sur une seule plateforme. De la conception à la livraison, MEEREO vous donne un contrôle total.</p>
            {/* Z6 — Features */}
            <div className="ob-z6">
              {FEATURES.map(f => (
                <div key={f.num} className="ob-z6-item"><span className="ob-z6-num">{f.num}</span><div><div className="ob-z6-hdr"><div className="ob-z6-dot" style={{background:f.dot}} /><div className="ob-z6-title">{f.title}</div></div><div className="ob-z6-text">{f.desc}</div></div></div>
              ))}
            </div>
            {/* Z7 — Stats bas */}
            <div className="ob-z7">
              <svg className="ob-z7-bg" viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Tour haute gauche */}
                <rect x="15" y="10" width="48" height="150" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="24" y="24" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="24" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="24" y="52" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="52" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="24" y="80" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="42" y="80" width="12" height="18" rx="1" stroke="currentColor" strokeWidth=".6"/>
                <rect x="30" y="110" width="18" height="50" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Immeuble large */}
                <rect x="80" y="30" width="70" height="130" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="90" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="42" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="90" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="66" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="90" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="106" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="122" y="90" width="10" height="14" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="103" y="118" width="20" height="42" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Bâtiment moyen avec horloge */}
                <rect x="170" y="50" width="50" height="110" rx="2" stroke="currentColor" strokeWidth="1"/>
                <circle cx="195" cy="70" r="10" stroke="currentColor" strokeWidth=".7"/>
                <line x1="195" y1="70" x2="195" y2="63" stroke="currentColor" strokeWidth=".5"/>
                <line x1="195" y1="70" x2="200" y2="70" stroke="currentColor" strokeWidth=".5"/>
                <rect x="180" y="92" width="12" height="16" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="198" y="92" width="12" height="16" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="186" y="122" width="18" height="38" rx="1" stroke="currentColor" strokeWidth=".6"/>
                {/* Grue */}
                <line x1="248" y1="160" x2="248" y2="8" stroke="currentColor" strokeWidth="1"/>
                <line x1="248" y1="8" x2="300" y2="8" stroke="currentColor" strokeWidth=".8"/>
                <line x1="300" y1="8" x2="300" y2="28" stroke="currentColor" strokeWidth=".5"/>
                <line x1="248" y1="8" x2="238" y2="30" stroke="currentColor" strokeWidth=".5"/>
                <rect x="240" y="145" width="16" height="15" stroke="currentColor" strokeWidth=".6"/>
                {/* Tour droite fine */}
                <rect x="320" y="20" width="36" height="140" rx="2" stroke="currentColor" strokeWidth="1"/>
                <rect x="328" y="32" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="32" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="54" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="54" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="76" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="76" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="328" y="98" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                <rect x="340" y="98" width="8" height="12" rx="1" stroke="currentColor" strokeWidth=".5"/>
                {/* Dôme */}
                <path d="M380 160 L380 100 Q400 60 420 100 L420 160" stroke="currentColor" strokeWidth="1" fill="none"/>
                <rect x="393" y="110" width="14" height="50" rx="1" stroke="currentColor" strokeWidth=".5"/>
                {/* Pyramide / toit */}
                <path d="M440 160 L465 80 L490 160" stroke="currentColor" strokeWidth="1" fill="none"/>
                <line x1="465" y1="80" x2="465" y2="70" stroke="currentColor" strokeWidth=".6"/>
              </svg>
              <div className="ob-z7-content">
                <div><div className="ob-z7-title">🇨🇮 Côte d'Ivoire</div><div className="ob-z7-sub">Marché de lancement</div></div>
                <div><div className="ob-z7-title">BTP & Immobilier</div><div className="ob-z7-sub">Secteurs clés</div></div>
                <div><div className="ob-z7-title">Afrique de l'Ouest</div><div className="ob-z7-sub">Déploiement progressif</div></div>
              </div>
            </div>
          </div>
          <div className="ob-panel-white ob-panel-white--type">
            <div className="ob-type-content">
              <div className="ob-type-header"><div><p className="ob-step-label">Étape 1 sur 3</p><h2 className="ob-type-title">Vous êtes…</h2><p className="ob-type-sub">Choisissez le rôle qui correspond à votre activité. Votre parcours sera adapté sur Meereo.</p></div><button className="ob-btn-back" onClick={()=>setScreen('auth')}>← Retour</button></div>
              <div className="ob-role-grid">
                {CARDS.map(card => {
                  const sel = userType===card.id
                  return (
                    <div key={card.id} className={`ob-role-card ${sel?'selected':''}`} onClick={()=>setUserType(card.id)}>
                      <div className="ob-role-hdr"><div className="ob-role-icon" style={{background:sel?'rgba(248,249,250,.12)':card.iconBg}}>{card.icon}</div><div className="ob-role-radio">{sel&&<div className="ob-role-radio-dot"/>}</div></div>
                      <div><p className="ob-role-step">{card.step}</p><p className="ob-role-title">{card.title}</p></div>
                      <p className="ob-role-desc">{card.description}</p>
                      <div className="ob-role-tags">{card.tags.map(t=><span key={t} className="ob-role-tag">{t}</span>)}</div>
                      <div className="ob-role-stats">{card.stats.map(s=>(<div key={s.label} className="ob-role-stat"><p className="ob-role-stat-label">{s.label}</p><p className="ob-role-stat-value">{s.value}</p></div>))}</div>
                    </div>
                  )
                })}
              </div>
              <div className="ob-type-footer"><p className="ob-type-login">Déjà un compte ? <span className="ob-type-login-link" onClick={()=>setScreen('auth')}>Se connecter</span></p><button className="ob-btn-continue" disabled={!userType} onClick={handleContinue}>Continuer →</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ════ WIZARD ════ */}
      {screen === 'wizard' && (
        <div className="ob-screen">
          <WizardLeftPanel steps={steps} currentStep={wizStep} />

          <div className="wiz-panel-right">
            <div className="wiz-right-inner">

              {/* Header */}
              <div className="wiz-header">
                <div>
                  <p className="ob-step-label" style={{margin:0}}>Créez votre profil</p>
                  <h2 className="wiz-title">{titles[wizStep-1]}</h2>
                  <p className="wiz-sub">{subs[wizStep-1]}</p>
                </div>
                <div className="wiz-secure-badge" style={{display:'flex',alignItems:'center',gap:4}}><Lock size={12}/> Données sécurisées</div>
              </div>

              <div className="wiz-pills">
                {steps.map(s => (
                  <div key={s.n} className={`wiz-pill ${wizStep===s.n?'active':''} ${wizStep>s.n?'done':''}`}>
                    {wizStep>s.n && <CheckSVG />} {s.n}. {s.label}
                  </div>
                ))}
              </div>

              {/* Card */}
              <div className="ob-auth-card">

                {/* ──────── STEP 1: PROFIL (all roles) ──────── */}
                {wizStep===1 && (<>
                  {/* Photo de profil — client uniquement */}
                  {userType==='client' && (
                    <div className="wiz-photo-row">
                      <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
                      <div className="wiz-photo-zone" onClick={()=>photoRef.current.click()}>
                        {form.photoUrl
                          ? <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        }
                        <div className="wiz-photo-overlay">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Photo de profil</div>
                        <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.6}}>JPG, PNG ou GIF · max 5 Mo<br/>Recommandé : 400×400 px</div>
                        <button className="wiz-photo-btn" onClick={()=>photoRef.current.click()}>{form.photoUrl?'Changer':'Choisir une photo'}</button>
                      </div>
                    </div>
                  )}
                  {/* Civilité + Prénom/Nom — client uniquement (champs principaux) */}
                  {userType==='client' && (<>
                    <Field label="Civilité"><select className="ob-input-v2 ob-select" style={{maxWidth:180}} value={form.civilite||''} onChange={e=>set('civilite',e.target.value)}><option value="">— Choisir —</option><option value="Monsieur">Monsieur</option><option value="Madame">Madame</option></select></Field>
                    <div className="ob-inp-row">
                      <Field label="Prénom" required><input className="ob-input-v2" placeholder="Sékou" value={form.prenom} onChange={e=>set('prenom',e.target.value)} /></Field>
                      <Field label="Nom" required><input className="ob-input-v2" placeholder="Traoré" value={form.nom} onChange={e=>set('nom',e.target.value)} /></Field>
                    </div>
                  </>)}
                  {/* Pro: structure fields with section dividers for hierarchy */}
                  {userType==='pro' && (<>
                    {/* Section: Identité */}
                    <div className="wiz-section-divider"><span className="wiz-section-label">Votre structure</span></div>
                    <Field label="Nom de la structure" required><input className="ob-input-v2" placeholder="Ex: Traoré Architecture & Design" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} /></Field>
                    <div className="ob-inp-row">
                      <Field label="Pays"><select className="ob-input-v2 ob-select" value={form.pays} onChange={e=>{set('pays',e.target.value);set('ville','')}}>{PAYS.map(p=><option key={p}>{p}</option>)}</select></Field>
                      <Field label="Fondée en"><input className="ob-input-v2" type="number" placeholder="2018" min="1950" max="2026" value={form.annee} onChange={e=>set('annee',e.target.value)} /></Field>
                    </div>
                    <Field label="Ville" required>
                      {form.pays === "Côte d'Ivoire"
                        ? <select className="ob-input-v2 ob-select" value={form.ville} onChange={e=>set('ville',e.target.value)}><option value="">— Choisir une ville —</option>{VILLES_CI.map(v=><option key={v}>{v}</option>)}</select>
                        : <input className="ob-input-v2" placeholder="Votre ville" value={form.ville} onChange={e=>set('ville',e.target.value)} />
                      }
                    </Field>

                    {/* Section: Activité */}
                    <div className="wiz-section-divider"><span className="wiz-section-label">Activité</span></div>
                    <Field label="Secteurs d'activité" required>
                      <div className="wiz-svc-grid">
                        {PRO_SECTEURS.map(s=>(
                          <div key={s} className={`wiz-svc-item ${form.secteurs.includes(s)?'sel':''}`} onClick={()=>toggleArr('secteurs',s)}>
                            <div className={`wiz-svc-check ${form.secteurs.includes(s)?'checked':''}`}>{form.secteurs.includes(s)&&<CheckSVG />}</div>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </Field>

                    {/* Section: Juridique */}
                    <div className="wiz-section-divider"><span className="wiz-section-label">Informations légales</span></div>
                    <div className="ob-inp-row">
                      <Field label="N° RCCM">
                        <input className="ob-input-v2" placeholder="CI-ABJ-2024-B-12345" value={form.rccm} onChange={e=>set('rccm',e.target.value.toUpperCase())} style={rccmError ? {borderColor:'#ba1a1a'} : undefined} />
                        {rccmError && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>{rccmError}</div>}
                      </Field>
                      <Field label="N° Contribuable">
                        <input className="ob-input-v2" placeholder="CI-0000000-A" value={form.ncc} onChange={e=>set('ncc',e.target.value.toUpperCase())} style={nccError ? {borderColor:'#ba1a1a'} : undefined} />
                        {nccError && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>{nccError}</div>}
                      </Field>
                    </div>
                    <div className="wiz-info-card">
                      <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.65}}>Le RCCM et le N° Contribuable sont uniques par entreprise et liés à un seul compte Meereo. Données chiffrées et conformes RGPD.</div>
                    </div>

                    {/* Section: Contact */}
                    <div className="wiz-section-divider"><span className="wiz-section-label">Coordonnées</span></div>
                    <Field label="Email professionnel" required><input className="ob-input-v2" type="email" placeholder="contact@structure.com" value={form.email} onChange={e=>set('email',e.target.value)} /></Field>
                    <Field label="Téléphone" required>
                      <div style={{display:'flex',gap:6}}>
                        <select className="ob-input-v2 ob-select" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:116,flexShrink:0,padding:'0 6px',fontSize:12}}>
                          {PHONE_PREFIXES.map(p=><option key={p.code} value={p.code}>{p.flag} {p.code} — {p.country}</option>)}
                        </select>
                        <input className="ob-input-v2" type="tel" placeholder="07 00 00 00 00" value={form.tel} onChange={e=>set('tel',e.target.value)} />
                      </div>
                    </Field>

                    {/* Section: Sécurité */}
                    <div className="wiz-section-divider"><span className="wiz-section-label">Sécurité</span></div>
                    <Field label="Mot de passe" required><input className="ob-input-v2" type="password" placeholder="8 caractères minimum" value={form.password} onChange={e=>set('password',e.target.value)} /></Field>
                    <Field label="Confirmer le mot de passe" required>
                      <input className="ob-input-v2" type="password" placeholder="Répéter le mot de passe" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} style={form.passwordConfirm && form.password !== form.passwordConfirm ? {borderColor:'#ba1a1a'} : undefined} />
                      {form.passwordConfirm && form.password !== form.passwordConfirm && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>Les mots de passe ne correspondent pas</div>}
                    </Field>
                  </>)}
                  {/* Fournisseur: structure with section dividers */}
                  {userType==='fournisseur' && (<>
                    <div className="wiz-section-divider"><span className="wiz-section-label">Votre entreprise</span></div>
                    <Field label="Nom de l'entreprise" required><input className="ob-input-v2" placeholder="Ex: Matériaux Pro CI" value={form.entreprise} onChange={e=>set('entreprise',e.target.value)} /></Field>
                    <Field label="Pays"><select className="ob-input-v2 ob-select" value={form.pays} onChange={e=>{set('pays',e.target.value);set('ville','')}}>{PAYS.map(p=><option key={p}>{p}</option>)}</select></Field>
                    <Field label="Ville" required>
                      {form.pays === "Côte d'Ivoire"
                        ? <select className="ob-input-v2 ob-select" value={form.ville} onChange={e=>set('ville',e.target.value)}><option value="">— Choisir une ville —</option>{VILLES_CI.map(v=><option key={v}>{v}</option>)}</select>
                        : <input className="ob-input-v2" placeholder="Votre ville" value={form.ville} onChange={e=>set('ville',e.target.value)} />
                      }
                    </Field>

                    <div className="wiz-section-divider"><span className="wiz-section-label">Informations légales</span></div>
                    <div className="ob-inp-row">
                      <Field label="N° RCCM">
                        <input className="ob-input-v2" placeholder="CI-ABJ-2024-B-12345" value={form.rccm} onChange={e=>set('rccm',e.target.value.toUpperCase())} style={rccmError ? {borderColor:'#ba1a1a'} : undefined} />
                        {rccmError && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>{rccmError}</div>}
                      </Field>
                      <Field label="N° Contribuable">
                        <input className="ob-input-v2" placeholder="CI-0000000-A" value={form.ncc} onChange={e=>set('ncc',e.target.value.toUpperCase())} style={nccError ? {borderColor:'#ba1a1a'} : undefined} />
                        {nccError && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>{nccError}</div>}
                      </Field>
                    </div>
                    <div className="wiz-info-card">
                      <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.65}}>Le RCCM et le N° Contribuable sont uniques par entreprise et liés à un seul compte Meereo. Données chiffrées et conformes RGPD.</div>
                    </div>

                    <div className="wiz-section-divider"><span className="wiz-section-label">Coordonnées</span></div>
                    <Field label="Email professionnel" required><input className="ob-input-v2" type="email" placeholder="contact@entreprise.com" value={form.email} onChange={e=>set('email',e.target.value)} /></Field>
                    <Field label="Téléphone" required>
                      <div style={{display:'flex',gap:6}}>
                        <select className="ob-input-v2 ob-select" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:116,flexShrink:0,padding:'0 6px',fontSize:12}}>
                          {PHONE_PREFIXES.map(p=><option key={p.code} value={p.code}>{p.flag} {p.code} — {p.country}</option>)}
                        </select>
                        <input className="ob-input-v2" type="tel" placeholder="07 00 00 00 00" value={form.tel} onChange={e=>set('tel',e.target.value)} />
                      </div>
                    </Field>

                    <div className="wiz-section-divider"><span className="wiz-section-label">Sécurité</span></div>
                    <Field label="Mot de passe" required><input className="ob-input-v2" type="password" placeholder="8 caractères minimum" value={form.password} onChange={e=>set('password',e.target.value)} /></Field>
                    <Field label="Confirmer le mot de passe" required>
                      <input className="ob-input-v2" type="password" placeholder="Répéter le mot de passe" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} style={form.passwordConfirm && form.password !== form.passwordConfirm ? {borderColor:'#ba1a1a'} : undefined} />
                      {form.passwordConfirm && form.password !== form.passwordConfirm && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>Les mots de passe ne correspondent pas</div>}
                    </Field>
                  </>)}
                  {/* Client: basic fields with section dividers */}
                  {userType==='client' && (<>
                    <div className="wiz-section-divider"><span className="wiz-section-label">Coordonnées</span></div>
                    <Field label="Email" required><input className="ob-input-v2" type="email" placeholder="jean@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></Field>
                    <Field label="Téléphone" required>
                      <div style={{display:'flex',gap:6}}>
                        <select className="ob-input-v2 ob-select" value={form.telPrefix} onChange={e=>set('telPrefix',e.target.value)} style={{width:116,flexShrink:0,padding:'0 6px',fontSize:12}}>
                          {PHONE_PREFIXES.map(p=><option key={p.code} value={p.code}>{p.flag} {p.code} — {p.country}</option>)}
                        </select>
                        <input className="ob-input-v2" type="tel" placeholder="07 00 00 00 00" value={form.tel} onChange={e=>set('tel',e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Pays"><select className="ob-input-v2 ob-select" value={form.pays} onChange={e=>{set('pays',e.target.value);set('ville','')}}>{PAYS.map(p=><option key={p}>{p}</option>)}</select></Field>
                    <Field label="Ville">
                      {form.pays === "Côte d'Ivoire"
                        ? <select className="ob-input-v2 ob-select" value={form.ville} onChange={e=>set('ville',e.target.value)}><option value="">— Choisir une ville —</option>{VILLES_CI.map(v=><option key={v}>{v}</option>)}</select>
                        : <input className="ob-input-v2" placeholder="Votre ville" value={form.ville} onChange={e=>set('ville',e.target.value)} />
                      }
                    </Field>
                    <div className="wiz-section-divider"><span className="wiz-section-label">Sécurité</span></div>
                    <Field label="Mot de passe" required><input className="ob-input-v2" type="password" placeholder="8 caractères minimum" value={form.password} onChange={e=>set('password',e.target.value)} /></Field>
                    <Field label="Confirmer le mot de passe" required>
                      <input className="ob-input-v2" type="password" placeholder="Répéter le mot de passe" value={form.passwordConfirm} onChange={e=>set('passwordConfirm',e.target.value)} style={form.passwordConfirm && form.password !== form.passwordConfirm ? {borderColor:'#ba1a1a'} : undefined} />
                      {form.passwordConfirm && form.password !== form.passwordConfirm && <div style={{fontSize:10,color:'#ba1a1a',marginTop:4}}>Les mots de passe ne correspondent pas</div>}
                    </Field>
                  </>)}
                </>)}

                {/* ──────── CLIENT STEP 2: PROJET ──────── */}
                {wizStep===2 && userType==='client' && (<>
                  <Field label="Type de projet" required>
                    <div className="wiz-pt-grid">{PT_TYPES.map(p=>(<div key={p.label} className={`wiz-pt-btn ${form.projectType===p.label?'sel':''}`} onClick={()=>set('projectType',p.label)}><div className="wiz-pt-em">{p.em}</div><div className="wiz-pt-lbl">{p.label}</div></div>))}</div>
                  </Field>
                  <Field label="Localisation du projet"><input className="ob-input-v2" placeholder="Ex: Cocody, Abidjan" value={form.location} onChange={e=>set('location',e.target.value)} /></Field>
                  <div className="ob-inp-row">
                    <Field label="Surface estimée (m²)"><input className="ob-input-v2" type="number" placeholder="200" value={form.surface} onChange={e=>set('surface',e.target.value)} /></Field>
                    <Field label="Budget estimé"><select className="ob-input-v2 ob-select" value={form.budget} onChange={e=>set('budget',e.target.value)}>{['— Choisir —','Moins de 20 M FCFA','20–50 M FCFA','50–150 M FCFA','150–500 M FCFA','Plus de 500 M FCFA','À définir'].map(b=><option key={b}>{b}</option>)}</select></Field>
                  </div>
                  <Field label="Description courte"><textarea className="ob-input-v2 ob-textarea" rows="3" placeholder="Décrivez brièvement votre projet…" value={form.description} onChange={e=>set('description',e.target.value)} /></Field>
                </>)}

                {/* ──────── CLIENT STEP 3: SITUATION ──────── */}
                {wizStep===3 && userType==='client' && (<>
                  {SITUATIONS.map(s=>(<div key={s.title} className={`wiz-sit-card ${form.situation===s.title?'sel':''}`} onClick={()=>set('situation',s.title)}><div className="wiz-sit-icon" style={{background:s.bg}}>{s.icon}</div><div><div className="wiz-sit-title">{s.title}</div><div className="wiz-sit-desc">{s.desc}</div></div></div>))}

                  {/* Champ email architecte si "J'ai déjà un architecte" */}
                  {form.situation==="J'ai déjà un architecte" && (
                    <div className="wiz-archi-invite">
                      <div className="wiz-archi-invite-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        <div>
                          <div style={{fontSize:13,fontWeight:700}}>Invitez votre architecte</div>
                          <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.6}}>S'il est déjà sur Meereo, il sera automatiquement lié à votre projet. Sinon, il recevra une invitation par email.</div>
                        </div>
                      </div>
                      <Field label="Email de votre architecte">
                        <input className="ob-input-v2" type="email" placeholder="architecte@cabinet.com" value={form.architecteEmail} onChange={e=>set('architecteEmail',e.target.value)} />
                      </Field>
                    </div>
                  )}
                </>)}

                {/* ──────── PRO STEP 2: LOGO (Premium) ──────── */}
                {wizStep===2 && userType==='pro' && (<>
                  {/* Tab switcher */}
                  <div className="wiz-tab-bar" style={{marginBottom:24}}>
                    {[['generate',<><Sparkles size={13}/> Générer avec KAI</>],['upload',<><FolderOpen size={13}/> Mon logo existant</>]].map(([k,l])=>(<button key={k} className={`wiz-tab-btn ${form.logoTab===k?'active':''}`} onClick={()=>set('logoTab',k)}>{l}</button>))}
                  </div>

                  {form.logoTab==='generate' && (<>
                    {/* Premium logo stage — centered hero preview */}
                    <div className="wiz-logo-hero">
                      <div className="wiz-logo-hero-bg" style={{background:`linear-gradient(135deg, ${form.logoColor} 0%, ${form.logoColor}88 50%, ${form.logoColor}44 100%)`}}>
                        <div className="wiz-logo-hero-grid" />
                        <div className="wiz-logo-hero-mark">
                          <div className="wiz-logo-hero-symbol" style={{
                            ...logoShapeStyle(form.logoShape),
                            border:'2.5px solid rgba(255,255,255,.25)',
                            width:72,height:72,display:'flex',alignItems:'center',justifyContent:'center',
                          }}>
                            <span style={{
                              color:'#fff', fontSize:28,
                              fontWeight:form.logoTypo==='Gras'?800:form.logoTypo==='Léger'?300:400,
                              fontStyle:form.logoTypo==='Serif'?'italic':'normal',
                              fontFamily:form.logoTypo==='Serif'?"'Instrument Serif',Georgia,serif":"inherit",
                              ...logoContentStyle(form.logoShape),
                              letterSpacing:form.logoTypo==='Léger'?'0.1em':'-0.02em',
                            }}>
                              {(form.entreprise||'M').slice(0,2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="wiz-logo-hero-name">{form.entreprise||'Votre Structure'}</div>
                        <div className="wiz-logo-hero-sector">{form.secteurs.join(' · ')||'Secteur d\'activité'}</div>
                      </div>
                    </div>

                    {/* Controls below */}
                    <div className="wiz-logo-controls">
                      <div className="wiz-logo-ctrl-section">
                        <div className="wiz-logo-ctrl-label">Couleur de marque</div>
                        <div className="wiz-color-swatches">{LOGO_COLORS.map(c=>(<div key={c.hex} className={`wiz-swatch ${form.logoColor===c.hex?'sel':''}`} style={{background:c.hex}} title={c.label} onClick={()=>set('logoColor',c.hex)} />))}</div>
                      </div>
                      <div className="wiz-logo-ctrl-row">
                        <div className="wiz-logo-ctrl-section" style={{flex:1}}>
                          <div className="wiz-logo-ctrl-label">Forme</div>
                          <div className="wiz-shape-row">{LOGO_SHAPES.map(s=>(<button key={s} className={`wiz-shape-btn ${form.logoShape===s?'sel':''}`} onClick={()=>set('logoShape',s)}>{s}</button>))}</div>
                        </div>
                        <div className="wiz-logo-ctrl-section" style={{flex:1}}>
                          <div className="wiz-logo-ctrl-label">Typographie</div>
                          <div className="wiz-shape-row">{LOGO_TYPOS.map(t=>(<button key={t} className={`wiz-shape-btn ${form.logoTypo===t?'sel':''}`} onClick={()=>set('logoTypo',t)}>{t}</button>))}</div>
                        </div>
                      </div>
                    </div>

                    {/* Business card mockup */}
                    <div className="wiz-bcard-premium">
                      <div className="wiz-bcard-p-left">
                        <div className="wiz-bcard-p-logo" style={{background:form.logoColor, ...logoShapeStyle(form.logoShape)}}>
                          <span style={{color:'#fff',fontSize:11,fontWeight:700,fontFamily:form.logoTypo==='Serif'?"'Instrument Serif',serif":"inherit", ...logoContentStyle(form.logoShape)}}>{(form.entreprise||'M').slice(0,2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,letterSpacing:'-0.3px'}}>{form.entreprise||'Structure'}</div>
                          <div style={{fontSize:9.5,color:'var(--t3)'}}>{form.secteurs.join(' · ')||'Secteur'}</div>
                        </div>
                      </div>
                      <div className="wiz-bcard-p-right">
                        <div style={{fontSize:9,color:'var(--t4)'}}>{form.email||'contact@structure.com'}</div>
                        <div style={{fontSize:9,color:'var(--t4)'}}>{form.tel||'+225 07 00 00 00 00'}</div>
                        <div style={{fontSize:9,color:'var(--t4)'}}>{form.ville||'Abidjan'}, {form.pays||"Côte d'Ivoire"}</div>
                      </div>
                    </div>

                    <button className="ob-btn-out" style={{width:'100%',marginTop:16}} onClick={()=>{set('logoColor',LOGO_COLORS[Math.floor(Math.random()*LOGO_COLORS.length)].hex);set('logoShape',LOGO_SHAPES[Math.floor(Math.random()*LOGO_SHAPES.length)]);set('logoTypo',LOGO_TYPOS[Math.floor(Math.random()*LOGO_TYPOS.length)]);showToast('Nouvelle proposition générée par KAI','green')}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                      Nouvelle proposition
                    </button>
                  </>)}

                  {form.logoTab==='upload' && (<>
                    <div className="wiz-upload-zone wiz-upload-zone--logo" onClick={()=>document.getElementById('logo-upload').click()}>
                      <input id="logo-upload" type="file" accept="image/png,image/svg+xml,image/jpeg" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){if(f.type==='image/svg+xml'){const reader=new FileReader();reader.onload=()=>{set('logoFileUrl',reader.result);showToast('Logo SVG chargé','green')};reader.readAsDataURL(f)}else{const c=await compressImage(f,400,0.85);set('logoFileUrl',c);showToast('Logo chargé avec succès','green')}}}} />
                      {form.logoFileUrl ? (
                        <div className="wiz-upload-preview">
                          <img src={form.logoFileUrl} alt="Logo" style={{maxWidth:140,maxHeight:140,objectFit:'contain'}} />
                          <div style={{fontSize:12,fontWeight:600,marginTop:12,color:'var(--tx)'}}>Logo chargé</div>
                          <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>Cliquez pour remplacer</div>
                        </div>
                      ) : (
                        <>
                          <div className="wiz-upload-icon-ring">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          </div>
                          <div style={{fontSize:14,fontWeight:700,marginTop:16}}>Déposez votre logo ici</div>
                          <div style={{fontSize:12,color:'var(--t3)',marginTop:6,lineHeight:1.6}}>PNG, SVG ou JPG · 5 Mo max<br/>Fond transparent recommandé</div>
                          <div className="wiz-upload-formats">
                            {['PNG','SVG','JPG'].map(f=>(<span key={f} className="wiz-upload-format">{f}</span>))}
                          </div>
                        </>
                      )}
                    </div>
                  </>)}
                </>)}

                {/* ──────── PRO STEP 3: SERVICES & BIO ──────── */}
                {wizStep===3 && userType==='pro' && (()=>{
                  /* Aggregate services from all selected sectors */
                  const allSvc = [...new Set(form.secteurs.flatMap(s => PRO_SVC_MAP[s]||[]))]
                  const fallback = allSvc.length > 0 ? allSvc : PRO_SVC_MAP['Architecture & Design']
                  return <>
                  {form.secteurs.length > 0 && (
                    <div className="wiz-profile-banner">
                      <Ruler size={18}/>
                      <div><div style={{fontSize:12,fontWeight:700}}>Profils : {form.secteurs.join(' · ')}</div><div style={{fontSize:11,color:'var(--t3)'}}>Services combinés de vos {form.secteurs.length} secteur{form.secteurs.length>1?'s':''}</div></div>
                    </div>
                  )}
                  <Field label="Accroche / Slogan"><input className="ob-input-v2" placeholder="Ex: L'excellence technique au service de vos projets" value={form.slogan} onChange={e=>set('slogan',e.target.value)} /></Field>
                  <Field label="Présentation"><textarea className="ob-input-v2 ob-textarea" rows="4" placeholder="Décrivez votre structure, votre approche, vos points forts et ce qui vous différencie…" value={form.bio} onChange={e=>set('bio',e.target.value)} /></Field>
                  <Field label="Vos services & prestations">
                    <div className="wiz-svc-grid">
                      {fallback.map(s=>(
                        <div key={s} className={`wiz-svc-item ${form.services.includes(s)?'sel':''}`} onClick={()=>toggleArr('services',s)}>
                          <div className={`wiz-svc-check ${form.services.includes(s)?'checked':''}`}>{form.services.includes(s)&&<CheckSVG />}</div>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </Field>
                  {/* Services custom ajoutés */}
                  {form.services.filter(s=>!fallback.includes(s)).length>0 && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                      {form.services.filter(s=>!fallback.includes(s)).map(s=>(
                        <span key={s} style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--tx)',color:'#fff',padding:'5px 12px',borderRadius:100,fontSize:11,fontWeight:600}}>
                          {s}
                          <button type="button" onClick={()=>toggleArr('services',s)} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:13,padding:0,lineHeight:1}}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="wiz-custom-svc">
                    <input className="ob-input-v2" placeholder="Ajouter un service spécifique…" value={svcCustom} onChange={e=>setSvcCustom(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(svcCustom.trim()){toggleArr('services',svcCustom.trim());setSvcCustom('');showToast('Service ajouté','green')}}}} style={{flex:1}} />
                    <button type="button" className="ob-btn-out" style={{padding:'10px 16px',flexShrink:0}} onClick={()=>{if(svcCustom.trim()){toggleArr('services',svcCustom.trim());setSvcCustom('');showToast('Service ajouté','green')}else{showToast('Saisissez un service','orange')}}}>+ Ajouter</button>
                  </div>
                  <div className="ob-inp-row" style={{marginTop:16}}>
                    <Field label="Projets réalisés"><input className="ob-input-v2" type="number" placeholder="Ex: 42" value={form.projetsN} onChange={e=>set('projetsN',e.target.value)} /></Field>
                    <Field label="Effectif"><input className="ob-input-v2" type="number" placeholder="Ex: 12" value={form.effectif} onChange={e=>set('effectif',e.target.value)} /></Field>
                  </div>
                </>})()}

                {/* ──────── PRO STEP 4: PORTFOLIO & ÉQUIPE ──────── */}
                {wizStep===4 && userType==='pro' && (<>
                  <Field label={`Réalisations (${form.portfolioFiles.filter(Boolean).length} photo${form.portfolioFiles.filter(Boolean).length>1?'s':''})`}>
                    {/* Upload multiple */}
                    <div className="wiz-upload-zone" style={{padding:'16px 20px',marginBottom:12}} onClick={()=>document.getElementById('port-multi').click()}>
                      <input id="port-multi" type="file" accept="image/*" multiple style={{display:'none'}} onChange={async e=>{const files=[...e.target.files];if(files.length){const arr=[...form.portfolioFiles];for(const f of files){const c=await compressImage(f,1200,0.75);arr.push(c)}set('portfolioFiles',[...arr]);showToast(`${files.length} photo${files.length>1?'s':''} ajoutée${files.length>1?'s':''}`,'green')}}} />
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <div><div style={{fontSize:12,fontWeight:700}}>Ajouter des photos</div><div style={{fontSize:11,color:'var(--t3)'}}>Sélectionnez plusieurs fichiers à la fois</div></div>
                      </div>
                    </div>
                    {/* Grid des photos */}
                    {form.portfolioFiles.length>0 && (
                      <div className="wiz-portfolio-grid">
                        {form.portfolioFiles.map((url,i)=>(
                          <div key={i} className="wiz-port-cell has" style={{position:'relative'}}>
                            <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} />
                            <button type="button" onClick={e=>{e.stopPropagation();set('portfolioFiles',form.portfolioFiles.filter((_,j)=>j!==i))}} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'rgba(0,0,0,.6)',color:'#fff',border:'none',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Field>
                  <Field label="Photo de couverture">
                    <div className="wiz-upload-zone" style={{padding:'24px 20px'}} onClick={()=>document.getElementById('cover-upload').click()}>
                      <input id="cover-upload" type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){const c=await compressImage(f,1400,0.75);set('coverUrl',c)}}} />
                      {form.coverUrl
                        ? <img src={form.coverUrl} alt="" style={{maxWidth:'100%',maxHeight:120,objectFit:'cover',borderRadius:12}} />
                        : <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <div style={{fontSize:12,fontWeight:600,marginTop:8}}>Choisir une photo de couverture</div>
                          </>
                      }
                    </div>
                  </Field>
                  <Field label="Membres de l'équipe">
                    {form.team.length>0 && (
                      <div className="wiz-team-list">
                        {form.team.map((m,i)=>(
                          <div key={i} className="wiz-team-row">
                            <div className="wiz-team-av-wrap" onClick={()=>document.getElementById(`team-photo-${i}`).click()}>
                              <input id={`team-photo-${i}`} type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){const c=await compressImage(f,300,0.75);const arr=[...form.team];arr[i]={...arr[i],photoUrl:c};set('team',arr)}}} />
                              {m.photoUrl
                                ? <img src={m.photoUrl} alt="" className="wiz-team-av-img" />
                                : <div className="wiz-team-av" style={{background:`hsl(${i*60},40%,45%)`}}>{(m.name || "").split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                              }
                              <div className="wiz-team-av-edit">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                              </div>
                            </div>
                            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{m.name}</div><div style={{fontSize:11,color:'var(--t3)'}}>{m.role}{m.email && <span style={{marginLeft:6,color:'var(--t4)'}}>{m.email}</span>}</div></div>
                            {m.registered && <span style={{fontSize:9,fontWeight:700,background:'rgba(52,199,89,.12)',color:'#16a34a',padding:'2px 7px',borderRadius:100,flexShrink:0}}>Inscrit</span>}
                            {m.pending && <span style={{fontSize:9,fontWeight:700,background:'rgba(251,191,36,.12)',color:'#b45309',padding:'2px 7px',borderRadius:100,flexShrink:0}}>Invité</span>}
                            <button type="button" onClick={()=>set('team',form.team.filter((_,j)=>j!==i))} style={{flexShrink:0,width:26,height:26,borderRadius:8,border:'1px solid rgba(186,26,26,.2)',background:'rgba(186,26,26,.06)',color:'#ba1a1a',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,lineHeight:1,fontFamily:'var(--f)'}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="wiz-team-add-card">
                      <div className="ob-inp-row">
                        <div className="ob-field"><label className="ob-label-v2">Nom complet</label><input className="ob-input-v2" placeholder="Nom du membre" value={teamName} onChange={e=>setTeamName(e.target.value)} /></div>
                        <div className="ob-field"><label className="ob-label-v2">Rôle / Poste</label><input className="ob-input-v2" placeholder="Architecte DPLG" value={teamRole} onChange={e=>setTeamRole(e.target.value)} /></div>
                      </div>
                      <div className="ob-field" style={{marginBottom:10}}><label className="ob-label-v2">Email (pour invitation)</label><input className="ob-input-v2" type="email" placeholder="membre@exemple.com" value={teamEmail} onChange={e=>setTeamEmail(e.target.value)} /></div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className="wiz-team-add-photo" onClick={()=>document.getElementById('team-new-photo').click()}>
                          <input id="team-new-photo" type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){const c=await compressImage(f,300,0.75);setTeamPhoto(c)}}} />
                          {teamPhoto
                            ? <img src={teamPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          }
                        </div>
                        <span style={{fontSize:11,color:'var(--t3)',flex:1}}>Photo (optionnel)</span>
                        <button type="button" className="ob-btn-out" style={{padding:'10px 16px',flexShrink:0}} onClick={()=>{
                          if(!teamName.trim()||!teamRole.trim()){showToast('Remplissez le nom et le rôle','orange');return}
                          const initials=teamName.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
                          const emailNorm=(teamEmail||'').trim().toLowerCase()
                          const existingUser=emailNorm?(store.users||[]).find(u=>u&&(u.email||'').toLowerCase()===emailNorm):null
                          const member={name:teamName.trim(),role:teamRole.trim(),email:emailNorm||null,photoUrl:teamPhoto||null,initials,registered:!!existingUser,userId:existingUser?.id||null,pending:!existingUser&&!!emailNorm}
                          set('team',[...form.team,member])
                          setTeamName('');setTeamRole('');setTeamEmail('');setTeamPhoto(null)
                          if(existingUser){showToast(`${existingUser.name||teamName.trim()} est déjà sur Meereo — il sera notifié`,'blue')}
                          else if(emailNorm){showToast('Membre ajouté — une invitation lui sera envoyée','green')}
                          else{showToast('Membre ajouté','green')}
                        }}>+ Ajouter</button>
                      </div>
                    </div>
                  </Field>
                </>)}

                {/* ──────── FOURNISSEUR STEP 2: LOGO (upload uniquement) ──────── */}
                {wizStep===2 && userType==='fournisseur' && (<>
                  <div className="wiz-upload-zone wiz-upload-zone--logo" onClick={()=>document.getElementById('frn-logo-upload').click()}>
                    <input id="frn-logo-upload" type="file" accept="image/png,image/svg+xml,image/jpeg" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){if(f.type==='image/svg+xml'){const reader=new FileReader();reader.onload=()=>{set('logoFileUrl',reader.result);showToast('Logo SVG chargé','green')};reader.readAsDataURL(f)}else{const c=await compressImage(f,400,0.85);set('logoFileUrl',c);showToast('Logo chargé avec succès','green')}}}} />
                    {form.logoFileUrl
                      ? <div className="wiz-upload-preview"><img src={form.logoFileUrl} alt="Logo" style={{maxWidth:160,maxHeight:160,objectFit:'contain'}} /><div style={{fontSize:13,fontWeight:700,marginTop:14}}>Logo chargé</div><div style={{fontSize:11.5,color:'var(--t3)',marginTop:4}}>Cliquez pour remplacer</div></div>
                      : <>
                          <div className="wiz-upload-icon-ring"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                          <div style={{fontSize:14,fontWeight:700,marginTop:16}}>Chargez le logo de votre entreprise</div>
                          <div style={{fontSize:12,color:'var(--t3)',marginTop:6,lineHeight:1.6}}>PNG, SVG ou JPG · 5 Mo max · Fond transparent recommandé</div>
                          <div className="wiz-upload-formats" style={{marginTop:14}}>
                            {['PNG','SVG','JPG'].map(f=>(<span key={f} className="wiz-upload-format">{f}</span>))}
                          </div>
                        </>
                    }
                  </div>
                </>)}

                {/* ──────── FOURNISSEUR STEP 3: CATALOGUE (compact) ──────── */}
                {wizStep===3 && userType==='fournisseur' && (<>
                  {/* Sélection résumé */}
                  {form.categories.length>0&&(
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(52,199,89,.06)',border:'1px solid rgba(52,199,89,.15)',borderRadius:12,marginBottom:14}}>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--tx)'}}>{form.categories.length} catégorie{form.categories.length>1?'s':''} sélectionnée{form.categories.length>1?'s':''}</span>
                      <button type="button" style={{fontSize:10,color:'var(--t3)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>set('categories',[])}>Tout désélectionner</button>
                    </div>
                  )}
                  {/* Sections compactes */}
                  {FRN_CAT_SECTIONS.map(section=>{
                    const selCount=section.cats.filter(c=>form.categories.includes(c.label)).length
                    return (
                      <div key={section.title} style={{marginBottom:10,background:'#fff',borderRadius:14,boxShadow:'0 20px 40px rgba(0,0,0,.04)',overflow:'hidden'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderBottom:'1px solid rgba(198,198,198,.08)'}}>
                          <span style={{fontSize:11,fontWeight:700,color:'var(--tx)'}}>{section.title}</span>
                          {selCount>0&&<span style={{fontSize:9,fontWeight:700,background:'var(--tx)',color:'#fff',padding:'2px 7px',borderRadius:100}}>{selCount}</span>}
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:5,padding:'10px 12px'}}>
                          {section.cats.map(c=>{
                            const sel=form.categories.includes(c.label)
                            return (
                              <div key={c.label} onClick={()=>toggleArr('categories',c.label)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:100,cursor:'pointer',fontSize:11.5,fontWeight:sel?700:500,background:sel?'var(--tx)':'var(--surface-2)',color:sel?'#fff':'var(--t3)',transition:'all .15s',border:sel?'none':'1px solid rgba(198,198,198,.1)'}}>
                                <span style={{fontSize:13}}>{c.em}</span>
                                {c.label}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </>)}

                {/* ──────── FOURNISSEUR STEP 4: PREMIERS PRODUITS ──────── */}
                {wizStep===4 && userType==='fournisseur' && (<>
                  {/* Liste produits ajoutés */}
                  {form.products.length>0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--t3)',marginBottom:8}}>{form.products.length} produit{form.products.length>1?'s':''} ajouté{form.products.length>1?'s':''}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {form.products.map((p,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#fff',borderRadius:12,boxShadow:'0 20px 40px rgba(0,0,0,.04)'}}>
                            {p.photoUrl
                              ? <img src={p.photoUrl} alt="" style={{width:44,height:44,borderRadius:8,objectFit:'cover',flexShrink:0}} />
                              : <div style={{width:44,height:44,borderRadius:8,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{(form.categories.find(c=>c===p.category)?FRN_CAT_SECTIONS.flatMap(s=>s.cats).find(c=>c.label===p.category):null)?.em||<Package size={18}/>}</div>
                            }
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                              <div style={{fontSize:10.5,color:'var(--t3)'}}>{p.category||'—'} · {p.price?p.price+' FCFA':'Prix sur devis'} {p.unit}</div>
                            </div>
                            <button type="button" className="ob-btn-out" style={{padding:'4px 10px',fontSize:11,width:'auto'}} onClick={()=>set('products',form.products.filter((_,j)=>j!==i))}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulaire ajout produit */}
                  <div style={{background:'var(--surface-2)',borderRadius:16,padding:16}}>
                    <div style={{fontSize:11,fontWeight:700,marginBottom:12}}>Ajouter un produit</div>
                    <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                      {/* Photo produit */}
                      <div style={{width:64,height:64,borderRadius:10,background:'#fff',border:'1.5px dashed rgba(198,198,198,.4)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,overflow:'hidden'}} onClick={()=>document.getElementById('prod-photo-input').click()}>
                        <input id="prod-photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(f){const c=await compressImage(f,600,0.75);setProdPhoto(c)}}} />
                        {prodPhoto
                          ? <img src={prodPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9c9ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        }
                      </div>
                      <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                        <input className="ob-input-v2" placeholder="Nom du produit (ex: Ciment CPA 45)" value={prodName} onChange={e=>setProdName(e.target.value)} />
                        <div className="rg-2" style={{gap:6}}>
                          <MoneyInput className="ob-input-v2" placeholder="Prix (FCFA)" value={prodPrice} onChange={v=>setProdPrice(v)} />
                          <select className="ob-input-v2 ob-select" value={prodUnit} onChange={e=>setProdUnit(e.target.value)}>
                            <option value="/unité">/unité</option><option value="/m²">/m²</option><option value="/m³">/m³</option>
                            <option value="/kg">/kg</option><option value="/tonne">/tonne</option><option value="/sac">/sac</option>
                            <option value="/palette">/palette</option><option value="/rouleau">/rouleau</option><option value="/lot">/lot</option>
                            <option value="/forfait">/forfait</option>
                          </select>
                        </div>
                        <select className="ob-input-v2 ob-select" value={prodCat} onChange={e=>setProdCat(e.target.value)}>
                          <option value="">Catégorie</option>
                          {form.categories.map(c=><option key={c} value={c}>{c}</option>)}
                          {form.categories.length===0&&FRN_CAT_SECTIONS.flatMap(s=>s.cats).map(c=><option key={c.label} value={c.label}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="button" className="ob-btn-out" style={{width:'100%',marginTop:10,padding:'10px',fontWeight:700}} onClick={()=>{
                      if(!prodName.trim()){showToast('Nom du produit requis','orange');return}
                      set('products',[...form.products,{name:prodName.trim(),price:prodPrice,unit:prodUnit,category:prodCat,photoUrl:prodPhoto}])
                      setProdName('');setProdPrice('');setProdUnit('/unité');setProdCat('');setProdPhoto(null)
                      showToast('Produit ajouté','green')
                    }}>+ Ajouter ce produit</button>
                  </div>

                  <div className="wiz-info-card" style={{marginTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:4,display:'flex',alignItems:'center',gap:4}}><Store size={13}/> Commencez à vendre</div>
                    <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.65}}>Ajoutez au moins 1 produit pour démarrer. Vous pourrez en ajouter davantage depuis votre espace fournisseur après l'inscription. Chaque produit sera visible sur le Marketplace Meereo.</div>
                  </div>
                </>)}

                {/* ──────── FOURNISSEUR STEP 5: LIVRAISON ──────── */}
                {wizStep===5 && userType==='fournisseur' && (<>
                  {/* Résumé sélection */}
                  {form.zones.length>0&&(
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(52,199,89,.06)',border:'1px solid rgba(52,199,89,.15)',borderRadius:12,marginBottom:14}}>
                      <span style={{fontSize:12,fontWeight:700}}>{form.zones.length} zone{form.zones.length>1?'s':''} sélectionnée{form.zones.length>1?'s':''}</span>
                      <button type="button" style={{fontSize:10,color:'var(--t3)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>set('zones',[])}>Tout désélectionner</button>
                    </div>
                  )}

                  {/* Toutes les zones dans une seule carte */}
                  <div style={{background:'#fff',borderRadius:16,boxShadow:'0 20px 40px rgba(0,0,0,.04)',overflow:'hidden'}}>
                    {FRN_ZONE_SECTIONS.map((section,si)=>{
                      const selCount=section.zones.filter(z=>form.zones.includes(z)).length
                      const allSelected=selCount===section.zones.length
                      return (
                        <div key={section.title} style={{borderBottom:si<FRN_ZONE_SECTIONS.length-1?'1px solid rgba(198,198,198,.08)':'none'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <span style={{fontSize:11,fontWeight:700,color:'var(--tx)'}}>{section.title}</span>
                              {selCount>0&&<span style={{fontSize:9,fontWeight:700,background:'var(--tx)',color:'#fff',padding:'1px 6px',borderRadius:100}}>{selCount}</span>}
                            </div>
                            <button type="button" onClick={()=>{if(allSelected){set('zones',form.zones.filter(z=>!section.zones.includes(z)))}else{set('zones',[...new Set([...form.zones,...section.zones])])}}} style={{fontSize:10,fontWeight:600,color:allSelected?'var(--t3)':'var(--tx)',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--f)'}}>
                              {allSelected?'Désélectionner':'Tout sélectionner'}
                            </button>
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:5,padding:'0 12px 10px'}}>
                            {section.zones.map(z=>{
                              const sel=form.zones.includes(z)
                              return <div key={z} onClick={()=>toggleArr('zones',z)} style={{display:'inline-flex',alignItems:'center',padding:'5px 10px',borderRadius:100,cursor:'pointer',fontSize:11,fontWeight:sel?700:500,background:sel?'var(--tx)':'var(--surface-2)',color:sel?'#fff':'var(--t3)',transition:'all .15s',border:sel?'none':'1px solid rgba(198,198,198,.1)'}}>{z}</div>
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{marginTop:14}}>
                    <Field label="Délai de livraison moyen">
                      <select className="ob-input-v2 ob-select" value={form.delaiLivraison} onChange={e=>set('delaiLivraison',e.target.value)}>
                        <option value="">Sélectionner</option>
                        <option value="Sous 24h">Sous 24h</option>
                        <option value="24 à 48h">24 à 48h</option>
                        <option value="48 à 72h">48 à 72h</option>
                        <option value="3 à 7 jours">3 à 7 jours</option>
                        <option value="1 à 2 semaines">1 à 2 semaines</option>
                        <option value="Sur devis">Sur devis</option>
                      </select>
                    </Field>
                  </div>
                </>)}

                {/* ──────── CLIENT STEP 4: RÉCAPITULATIF & LANCEMENT ──────── */}
                {wizStep===4 && userType==='client' && (()=>{
                  const hasArchi = form.situation==="J'ai déjà un architecte"
                  const noArchi = form.situation==="Je n'ai pas encore d'architecte"
                  const cleEnMain = form.situation==="Je veux une solution clé en main"
                  return <>
                  <div className="wiz-welcome-top">
                    <div className="wiz-welcome-check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div className="wiz-welcome-title">Bienvenue{form.prenom?`, ${form.prenom}`:''}</div>
                    <div className="wiz-welcome-sub">Votre profil est prêt. Voici le récapitulatif de votre projet.</div>
                    <span className="wiz-welcome-id">ID · MCL-2026-{Math.floor(1000+Math.random()*9000)}</span>
                  </div>

                  {/* ── Récapitulatif projet ── */}
                  <div className="wiz-recap" style={{marginTop:0}}>
                    <div className="wiz-recap-row"><span className="wiz-recap-label wiz-recap-label-green">Client</span><span className="wiz-recap-value wiz-recap-green">{form.prenom} {form.nom}</span></div>
                    {form.projectType&&<div className="wiz-recap-row"><span className="wiz-recap-label">Type de projet</span><span className="wiz-recap-value">{form.projectType}</span></div>}
                    {form.location&&<div className="wiz-recap-row"><span className="wiz-recap-label">Localisation</span><span className="wiz-recap-value">{form.location}</span></div>}
                    {form.surface&&<div className="wiz-recap-row"><span className="wiz-recap-label">Surface</span><span className="wiz-recap-value">{form.surface} m²</span></div>}
                    {form.budget&&form.budget!=='— Choisir —'&&<div className="wiz-recap-row"><span className="wiz-recap-label">Budget</span><span className="wiz-recap-value">{form.budget}</span></div>}
                    {form.situation&&<div className="wiz-recap-row"><span className="wiz-recap-label wiz-recap-label-green">Situation</span><span className="wiz-recap-value wiz-recap-green">{form.situation}</span></div>}
                    {hasArchi&&form.architecteEmail&&<div className="wiz-recap-row"><span className="wiz-recap-label">Architecte invité</span><span className="wiz-recap-value">{form.architecteEmail}</span></div>}
                  </div>

                  {/* ── Action conditionnelle selon situation ── */}

                  {/* CAS 1: Pas d'architecte → AO réservé architectes */}
                  {noArchi && (
                    <div className="wiz-action-hero">
                      <div className="wiz-action-hero-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      </div>
                      <div className="wiz-action-hero-badge">AO exclusif</div>
                      <h3 className="wiz-action-hero-title">Appel d'offres · Architectes uniquement</h3>
                      <p className="wiz-action-hero-desc">Un AO sera publié exclusivement pour les architectes inscrits sur Meereo. Ils vous répondront dès que possible.</p>
                      <div className="wiz-action-hero-tags">
                        {['Réservé architectes','Offres qualifiées','Comparaison facilitée'].map(t=>(
                          <span key={t} className="wiz-action-hero-tag"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAS 2: A un architecte → invitation envoyée */}
                  {hasArchi && (
                    <div className="wiz-action-hero">
                      <div className="wiz-action-hero-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                      </div>
                      <div className="wiz-action-hero-badge">Invitation</div>
                      <h3 className="wiz-action-hero-title">
                        {form.architecteEmail ? `Invitation envoyée à ${form.architecteEmail}` : 'Invitez votre architecte'}
                      </h3>
                      <p className="wiz-action-hero-desc">
                        {form.architecteEmail
                          ? "S'il est déjà sur Meereo, votre projet sera automatiquement lié à son espace. Sinon, il recevra une invitation pour rejoindre la plateforme et créer le projet avec vous."
                          : "N'oubliez pas de renseigner l'email de votre architecte à l'étape précédente."}
                      </p>
                      <div className="wiz-action-hero-tags">
                        {['Liaison automatique','Création projet partagé','Suivi unifié'].map(t=>(
                          <span key={t} className="wiz-action-hero-tag"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAS 3: Clé en main → MEEREO + KAI + Banque partenaire */}
                  {cleEnMain && (
                    <div className="wiz-action-hero">
                      <div className="wiz-action-hero-icon" style={{background:'rgba(124,58,237,.2)'}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <div className="wiz-action-hero-badge" style={{background:'rgba(124,58,237,.25)'}}>Prise en charge MEEREO</div>
                      </div>
                      <h3 className="wiz-action-hero-title">MEEREO pilote, <Kai /> vous accompagne</h3>
                      <p className="wiz-action-hero-desc">MEEREO organise la mise en place de votre projet, identifie les professionnels adaptés et coordonne chaque étape. <strong><Kai /></strong>, votre assistant personnel, vous guide au quotidien.</p>
                      <div className="wiz-action-hero-tags">
                        {['Projet piloté par MEEREO','KAI vous accompagne','Paiements sécurisés','Banque partenaire'].map(t=>(
                          <span key={t} className="wiz-action-hero-tag"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bloc sécurité paiements — visible uniquement pour clé en main */}
                  {cleEnMain && (
                    <div style={{marginTop:14,padding:'18px 20px',background:'var(--surface-1)',borderRadius:14,border:'1px solid var(--border-card)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <div style={{width:32,height:32,borderRadius:9,background:'rgba(22,163,74,.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:'var(--tx)',marginBottom:1}}>Paiements sécurisés</div>
                          <div style={{fontSize:11,color:'var(--t3)'}}>Vos fonds ne sont jamais déposés sur MEEREO</div>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.65,marginBottom:12}}>
                        Les paiements sont gérés via une <strong>banque partenaire</strong>. Les fonds restent dans un cadre bancaire sécurisé et les décaissements sont déclenchés uniquement lorsque les étapes de votre projet sont validées.
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {[
                          {icon:<Check size={10}/>,text:'Les fonds restent sur un compte bancaire sécurisé'},
                          {icon:<Check size={10}/>,text:'Chaque paiement est lié à une étape validée du projet'},
                          {icon:<Check size={10}/>,text:'Vous gardez la visibilité et la validation à chaque étape'},
                        ].map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{color:'var(--ok)',flexShrink:0}}>{item.icon}</span>
                            <span style={{fontSize:11.5,color:'var(--t2)'}}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parcours */}
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--t3)',marginBottom:10}}>Prochaines étapes</div>
                    {(noArchi ? [
                      {num:'1',color:'#EA580C',title:"AO publié · Architectes uniquement",desc:"Votre appel d'offres est diffusé aux architectes certifiés Meereo. Aucun autre corps de métier ne le verra."},
                      {num:'2',color:'#7C3AED',title:"Recevez & comparez les offres",desc:"Comparez les propositions reçues : honoraires, délai, références, approche architecturale."},
                      {num:'3',color:'#0891B2',title:"Choisissez votre architecte",desc:"Acceptez l'offre qui vous convient. L'architecte crée le projet et constitue l'équipe."},
                      {num:'4',color:'#16A34A',title:"Suivez & payez en sécurité",desc:"Phase par phase, jalons validés, paiement déclenché via Wave, Orange Money ou MTN."},
                    ] : hasArchi ? [
                      {num:'1',color:'#16A34A',title:"Invitation envoyée à votre architecte",desc:"Il rejoint Meereo et crée le projet avec vos informations. Vous serez automatiquement lié."},
                      {num:'2',color:'#7C3AED',title:"L'architecte constitue l'équipe",desc:"Il lance les AO pour les entreprises, BET et prestataires nécessaires."},
                      {num:'3',color:'#0891B2',title:"Commandez sur le Marketplace",desc:"Matériaux liés à votre chantier, livrés directement sur site."},
                      {num:'4',color:'#16A34A',title:"Suivez & payez en sécurité",desc:"Validation par jalons, paiements sécurisés, tableau de bord temps réel."},
                    ] : cleEnMain ? [
                      {num:'1',color:'#7C3AED',title:"MEEREO organise votre projet",desc:"Nous structurons les étapes, identifions les professionnels adaptés et préparons la mise en place."},
                      {num:'2',color:'#191c1d',title:"KAI vous accompagne au quotidien",desc:"Votre assistant personnel vous informe, vous guide et vous notifie à chaque avancée."},
                      {num:'3',color:'#2563EB',title:"Les professionnels sont intégrés au bon moment",desc:"Architectes, ingénieurs et constructeurs rejoignent le projet quand c'est pertinent."},
                      {num:'4',color:'#0891B2',title:"Commandez sur le Marketplace",desc:"Matériaux et équipements liés à votre chantier, livrés directement sur site."},
                      {num:'5',color:'#16A34A',title:"Paiements sécurisés via banque partenaire",desc:"Chaque paiement est lié à une étape validée. Les fonds restent sécurisés hors plateforme."},
                      {num:'6',color:'#F59E0B',title:"Vous validez les étapes importantes",desc:"Vous gardez toujours la visibilité et le contrôle sur les décisions clés de votre projet."},
                    ] : CLIENT_PROC).map(p=>(
                      <div key={p.num} className="wiz-proc-card">
                        <div className="wiz-proc-num" style={{background:`${p.color}15`,color:p.color}}>{p.num}</div>
                        <div><div className="wiz-proc-title">{p.title}</div><div className="wiz-proc-desc">{p.desc}</div></div>
                      </div>
                    ))}
                  </div>
                </>})()}

                {wizStep===6 && userType==='fournisseur' && (<>
                  <div className="wiz-welcome-top">
                    <div className="wiz-welcome-check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div className="wiz-welcome-title">Bienvenue{form.prenom?`, ${form.prenom}`:''}</div>
                    <div className="wiz-welcome-sub">Votre espace fournisseur est prêt. Vos produits sont sur le Marketplace.</div>
                    <span className="wiz-welcome-id">ID · MFR-2026-{Math.floor(1000+Math.random()*9000)}</span>
                  </div>
                  <div className="wiz-recap">
                    {form.entreprise&&<div className="wiz-recap-row"><span className="wiz-recap-label">Entreprise</span><span className="wiz-recap-value">{form.entreprise}</span></div>}
                    {form.rccm&&<div className="wiz-recap-row"><span className="wiz-recap-label">RCCM</span><span className="wiz-recap-value">{form.rccm}</span></div>}
                    {form.categories.length>0&&<div className="wiz-recap-row"><span className="wiz-recap-label">Catégories</span><span className="wiz-recap-value">{form.categories.length} sélectionnée{form.categories.length>1?'s':''}</span></div>}
                    {form.products.length>0&&<div className="wiz-recap-row"><span className="wiz-recap-label">Produits</span><span className="wiz-recap-value wiz-recap-green">{form.products.length} produit{form.products.length>1?'s':''} sur le Marketplace</span></div>}
                    {form.zones.length>0&&<div className="wiz-recap-row"><span className="wiz-recap-label">Zones</span><span className="wiz-recap-value">{form.zones.join(', ')}</span></div>}
                    {form.delaiLivraison&&<div className="wiz-recap-row"><span className="wiz-recap-label">Délai</span><span className="wiz-recap-value">{form.delaiLivraison}</span></div>}
                  </div>
                  {/* Aperçu produits */}
                  {form.products.length>0 && (
                    <div style={{marginTop:14}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--t3)',marginBottom:8}}>Vos produits sur le Marketplace</div>
                      <div className="rg-2" style={{gap:8}}>
                        {form.products.slice(0,4).map((p,i)=>(
                          <div key={i} style={{background:'#fff',borderRadius:12,padding:'10px 12px',boxShadow:'0 20px 40px rgba(0,0,0,.04)',display:'flex',alignItems:'center',gap:10}}>
                            {p.photoUrl
                              ? <img src={p.photoUrl} alt="" style={{width:36,height:36,borderRadius:8,objectFit:'cover',flexShrink:0}} />
                              : <div style={{width:36,height:36,borderRadius:8,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Package size={16} color="var(--t3)"/></div>
                            }
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                              <div style={{fontSize:10,color:'var(--t3)'}}>{p.price?p.price+' FCFA':'Sur devis'} {p.unit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {form.products.length>4&&<div style={{fontSize:10,color:'var(--t4)',marginTop:6,textAlign:'center'}}>+{form.products.length-4} autre{form.products.length-4>1?'s':''} produit{form.products.length-4>1?'s':''}</div>}
                    </div>
                  )}
                  <div className="wiz-info-card" style={{marginTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:4,display:'flex',alignItems:'center',gap:4}}><Store size={13}/> Vous êtes en ligne</div>
                    <div style={{fontSize:11.5,color:'var(--t3)',lineHeight:1.65}}>{form.products.length>0?'Vos '+form.products.length+' produit'+(form.products.length>1?'s sont':'est')+' déjà visible'+(form.products.length>1?'s':'')+' sur le Marketplace. ':''}Depuis votre espace fournisseur, vous pourrez ajouter d'autres produits, gérer vos stocks et suivre vos commandes.</div>
                  </div>
                </>)}

                {/* ──────── PRO STEP 5: PROFIL PUBLIC ÉDITABLE ──────── */}
                {wizStep===5 && userType==='pro' && (()=>{
                  const EditBtn = ({onClick}) => <button className="wiz-edit-btn" onClick={onClick}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Modifier</button>
                  return <>
                  {/* Badge + URL */}
                  <div className="wiz-welcome-top">
                    <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(52,199,89,.10)',color:'#34C759',padding:'5px 14px',borderRadius:100,fontSize:10.5,fontWeight:700,marginBottom:16}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Profil généré par <Kai />
                    </div>
                    <div className="wiz-welcome-title">Personnalisez votre profil</div>
                    <div className="wiz-welcome-sub">Cliquez sur "Modifier" pour ajuster chaque section avant de publier.</div>
                  </div>

                  <div className="wiz-url-bar">
                    <div className="wiz-url-text">meereo.com/pro/{(form.entreprise||'structure').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}</div>
                    <button className="ob-btn-out" style={{padding:'6px 14px',fontSize:11}} onClick={()=>{navigator.clipboard.writeText('meereo.com/pro/'+((form.entreprise||'structure').toLowerCase().replace(/\s+/g,'-')));showToast('Lien copié !','green')}}>Copier le lien</button>
                  </div>

                  {/* ── Section: Identité ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Identité & Logo</span><EditBtn onClick={()=>setWizStep(1)} /></div>
                    <div className="wiz-profile-card" style={{marginBottom:0}}>
                      <div className="wiz-profile-cover" style={{background:form.coverUrl?`url(${form.coverUrl}) center/cover`:`linear-gradient(135deg, ${form.logoColor} 0%, ${form.logoColor}cc 100%)`}}>
                        <div className="wiz-profile-av" style={{background:form.logoColor}}>
                          <span style={{color:'#fff',fontSize:18,fontWeight:700}}>{(form.entreprise||'M').slice(0,2).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="wiz-profile-body">
                        <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{form.entreprise||'Votre structure'}</div>
                        <div style={{fontSize:11.5,color:'var(--t3)',marginBottom:8}}>{form.secteurs.join(' · ')||'Secteur'} · {form.ville||'Ville'}</div>
                        <div style={{display:'flex',gap:6}}>
                          <span style={{background:'rgba(52,199,89,.10)',color:'#34C759',padding:'2px 10px',borderRadius:100,fontSize:10,fontWeight:700,display:'inline-flex',alignItems:'center',gap:3}}><Check size={10}/> Vérifié</span>
                          <span style={{background:'rgba(0,122,255,.08)',color:'#007AFF',padding:'2px 10px',borderRadius:100,fontSize:10,fontWeight:700}}>Disponible</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Présentation ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Présentation</span><EditBtn onClick={()=>setWizStep(3)} /></div>
                    <div className="wiz-edit-card">
                      {form.slogan && <div style={{fontSize:14,fontWeight:700,fontStyle:'italic',marginBottom:8}}>{form.slogan}</div>}
                      {form.bio ? <div style={{fontSize:12,color:'var(--t3)',lineHeight:1.7}}>{form.bio}</div> : <div style={{fontSize:12,color:'var(--t4)',fontStyle:'italic'}}>Aucune présentation — cliquez Modifier pour en ajouter une</div>}
                    </div>
                  </div>

                  {/* ── Section: Métriques ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Chiffres clés</span><EditBtn onClick={()=>setWizStep(3)} /></div>
                    <div className="rg-3" style={{gap:8}}>
                      <div className="wiz-bourse-stat"><div className="wiz-bourse-stat-n">{form.projetsN||'—'}</div><div className="wiz-bourse-stat-l">Projets</div></div>
                      <div className="wiz-bourse-stat"><div className="wiz-bourse-stat-n">{form.effectif||'—'}</div><div className="wiz-bourse-stat-l">Effectif</div></div>
                      <div className="wiz-bourse-stat"><div className="wiz-bourse-stat-n">{form.annee?(2026-parseInt(form.annee)):'—'}</div><div className="wiz-bourse-stat-l">Ans d'exp.</div></div>
                    </div>
                  </div>

                  {/* ── Section: Services ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Services ({form.services.length})</span><EditBtn onClick={()=>setWizStep(3)} /></div>
                    {form.services.length>0 ? (
                      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                        {form.services.map(s=>(<span key={s} style={{background:'var(--surface-2)',padding:'5px 12px',borderRadius:100,fontSize:11,fontWeight:500,color:'var(--t3)'}}>{s}</span>))}
                      </div>
                    ) : <div style={{fontSize:12,color:'var(--t4)',fontStyle:'italic'}}>Aucun service — cliquez Modifier</div>}
                  </div>

                  {/* ── Section: Portfolio ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Portfolio ({form.portfolioFiles.filter(Boolean).length} photos)</span><EditBtn onClick={()=>setWizStep(4)} /></div>
                    {form.portfolioFiles.filter(Boolean).length>0 ? (
                      <div className="rg-3" style={{gap:6}}>
                        {form.portfolioFiles.filter(Boolean).map((url,i)=>(<div key={i} style={{aspectRatio:'4/3',borderRadius:8,overflow:'hidden'}}><img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>))}
                      </div>
                    ) : <div style={{fontSize:12,color:'var(--t4)',fontStyle:'italic'}}>Aucune photo — cliquez Modifier pour en ajouter</div>}
                  </div>

                  {/* ── Section: Équipe ── */}
                  <div className="wiz-edit-section">
                    <div className="wiz-edit-header"><span className="wiz-edit-label">Équipe ({form.team.length} membre{form.team.length>1?'s':''})</span><EditBtn onClick={()=>setWizStep(4)} /></div>
                    {form.team.length>0 ? (
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {form.team.map((m,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                            {m.photoUrl
                              ? <img src={m.photoUrl} alt="" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}} />
                              : <div className="wiz-team-av" style={{width:36,height:36,fontSize:11,background:`hsl(${i*60},40%,45%)`}}>{(m.name || "").split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                            }
                            <div><div style={{fontSize:12,fontWeight:700}}>{m.name}</div><div style={{fontSize:11,color:'var(--t3)'}}>{m.role}</div></div>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{fontSize:12,color:'var(--t4)',fontStyle:'italic'}}>Aucun membre — cliquez Modifier</div>}
                  </div>

                  {/* Reassurance */}
                  <div className="wiz-reassurance">
                    {[[<Eye size={18}/>, 'Visibilite accrue','Soyez visible par les clients MEEREO'],[<Megaphone size={18}/>, 'Appels d\'offres','Recevez des missions qualifiees'],[<CheckCircle2 size={18}/>, 'Profil professionnel','Votre vitrine sur la plateforme']].map(([ico,t,d])=>(
                      <div key={t} className="wiz-reassurance-item">{ico}<div><div style={{fontSize:11,fontWeight:700}}>{t}</div><div style={{fontSize:10,color:'var(--t3)'}}>{d}</div></div></div>
                    ))}
                  </div>

                  {/* Share */}
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="ob-btn-out" style={{flex:1,fontSize:11,padding:'8px 0'}} onClick={()=>{navigator.clipboard.writeText('meereo.com/pro/'+((form.entreprise||'structure').toLowerCase().replace(/\s+/g,'-')));showToast('Lien copié !','green')}}>Copier le lien</button>
                  </div>
                </>})()}

                {/* ──────── NAVIGATION ──────── */}
                <div className="wiz-nav">
                  {wizStep < totalSteps && (
                    <button className="ob-btn-out" onClick={()=>wizStep===1?setScreen('type'):setWizStep(s=>s-1)}>← {wizStep===1?'Rôle':'Retour'}</button>
                  )}
                  {/* Pro step 5: two action buttons */}
                  {wizStep===totalSteps && userType==='pro' ? (
                    <div style={{display:'flex',gap:8}}>
                      <button className="ob-btn-out" onClick={() => {
                        const publicId = store?.user?.publicId
                        handleFinish(publicId ? `/pro?uuid=${publicId}` : '/pro')
                      }}>Voir mon profil public</button>
                      <button className="ob-btn-blk" onClick={() => handleFinish()}>Accéder au Cockpit →</button>
                    </div>
                  ) : (
                    <button className="ob-btn-blk" onClick={()=>{
                      // Block if RCCM or NCC are filled but invalid (step 1 for pro/fournisseur)
                      if (wizStep === 1 && (userType === 'pro' || userType === 'fournisseur') && (rccmError || nccError)) {
                        showToast(rccmError || nccError, 'orange'); return
                      }
                      if(wizStep===totalSteps) handleFinish()
                      else {
                        if(userType==='pro' && wizStep===4) showToast('Génération du profil en cours…','blue')
                        setWizStep(s=>s+1)
                      }
                    }}>
                      {wizStep===totalSteps
                        ? (userType==='client'?'Mon cockpit →':'Mon espace fournisseur →')
                        : userType==='pro' && wizStep===4
                          ? 'Générer mon profil public'
                          : wizStep===totalSteps-1
                            ? 'Finaliser mon profil'
                            : 'Étape suivante'
                      } {wizStep<totalSteps&&<ArrowSVG />}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation AO auto-créé */}
      {showAOConfirm && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:420, boxShadow:'0 24px 80px rgba(0,0,0,.18)', overflow:'hidden' }}>
            <div style={{ padding:'32px 28px 20px', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(0,122,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'#111' }}>Appel d'offres publié</div>
              <p style={{ fontSize:13, color:'#888', lineHeight:1.6, margin:0 }}>
                Votre appel d'offres a été publié et est désormais visible <strong style={{ color:'#111' }}>uniquement par les architectes</strong> inscrits sur MEEREO.
              </p>
            </div>
            <div style={{ padding:'12px 28px 24px', display:'flex', gap:10 }}>
              <button onClick={() => { setShowAOConfirm(false); navigate('/client') }} style={{ flex:1, padding:'12px 16px', borderRadius:12, background:'#f3f4f5', color:'#555', border:'1px solid rgba(0,0,0,.06)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--f)' }}>
                Aller à mon espace
              </button>
              <button onClick={() => { setShowAOConfirm(false); navigate('/client') }} style={{ flex:1, padding:'12px 16px', borderRadius:12, background:'#111', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--f)' }}>
                Voir mon AO →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

