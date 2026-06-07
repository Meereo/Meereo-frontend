import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import MeereoLogo from '../../components/shared/MeereoLogo'

/* ══════════════════════════════════════════════════════════════
   MEEREO LANDING — SIGNATURE VERSION
   Multi-acteurs · Cockpit · KAI · Premium · Fidèle au produit
══════════════════════════════════════════════════════════════ */

// ═══ MINI UI ═══

function CockpitFull() {
  return (
    <div style={{ borderRadius:20, background:'#fff', padding:24, color:'#191c1d', fontFamily:'var(--f)', border:'1px solid rgba(0,0,0,.12)', boxShadow:'0 8px 40px rgba(0,0,0,.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <MeereoLogo size={22}/>
          <span style={{ fontSize:13, fontWeight:600 }}>Cockpit</span>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {['Projets','Chantier','Finance','AO','Équipe','Docs'].map((t,i)=>(
            <div key={t} style={{ padding:'4px 10px', borderRadius:100, fontSize:9.5, fontWeight:500, ...(i===0?{background:'#191c1d',color:'#fff'}:{background:'#f3f4f5',color:'#999'}) }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
        {[{l:'Projets actifs',v:'3'},{l:'Marchés signés',v:'7'},{l:'Offres',v:'4'},{l:'Exécution',v:'68 %'}].map(k=>(
          <div key={k.l} style={{ padding:'13px 14px', borderRadius:12, background:'#f0f0f2', border:'1px solid rgba(0,0,0,.1)' }}>
            <div style={{ fontSize:8, fontWeight:600, color:'#bbb', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-.6px', color:'#191c1d' }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'14px 16px', borderRadius:14, background:'#f0f0f2', border:'1px solid rgba(0,0,0,.1)', marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>Résidence Les Acacias</div>
            <div style={{ fontSize:10, color:'#aaa', marginTop:3 }}>Abidjan, Cocody · 250 000 000 FCFA</div>
          </div>
          <div style={{ padding:'3px 9px', borderRadius:100, background:'#191c1d', color:'#fff', fontSize:9, fontWeight:600 }}>Phase APD</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:3, borderRadius:100, background:'rgba(0,0,0,.06)' }}>
            <div style={{ width:'45%', height:3, borderRadius:100, background:'#191c1d' }}/>
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:'#999' }}>45 %</span>
        </div>
      </div>
      <div style={{ padding:'13px 16px', borderRadius:14, background:'#f0f0f2', border:'1px solid rgba(0,0,0,.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%,#2a2a2f,#090909)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.15)', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 28%,rgba(124,58,237,.15),transparent 55%)', pointerEvents:'none' }}/>
            <span style={{ fontSize:9, fontWeight:700, color:'#7C3AED', position:'relative', zIndex:1 }}>K</span>
          </div>
          <span style={{ fontSize:11, fontWeight:700 }}>KAI</span>
          <span style={{ fontSize:8, color:'#16A34A', fontWeight:600, marginLeft:'auto' }}>En ligne</span>
        </div>
        <p style={{ fontSize:11, lineHeight:1.5, color:'#999', margin:0 }}>2 décisions en attente. Budget engagé à 62 %. Prochain jalon : gros-œuvre le 15 mai.</p>
      </div>
    </div>
  )
}

function ChantierMini() {
  return (
    <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', fontFamily:'var(--f)' }}>
      <div style={{ display:'flex', gap:4, padding:'12px 16px', borderBottom:'1px solid rgba(0,0,0,.05)' }}>
        {[{l:'Idée',d:true},{l:'Études',d:true},{l:'Conception',c:true},{l:'Consultation'},{l:'Travaux'},{l:'Livraison'},{l:'Suivi'}].map(p=>(
          <div key={p.l} style={{ padding:'4px 10px', borderRadius:100, fontSize:10, fontWeight:600, ...(p.d?{background:'#191c1d',color:'#fff'}:p.c?{background:'rgba(0,122,255,.07)',color:'#007AFF',border:'1px solid rgba(0,122,255,.15)'}:{background:'#f3f4f5',color:'#ccc'}) }}>{p.l}</div>
        ))}
      </div>
      <div style={{ padding:'4px 12px 8px' }}>
        {[{n:'Plans architecturaux détaillés',s:'done'},{n:'Descente de charges structure',s:'active'},{n:'Note de calcul fondations',s:'todo'},{n:'CCTP lot gros-œuvre',s:'todo'}].map((t,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 4px', borderBottom:i<3?'1px solid rgba(0,0,0,.03)':'none' }}>
            <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', ...(t.s==='done'?{background:'#16A34A'}:t.s==='active'?{background:'#007AFF'}:{border:'1.5px solid #ddd'}) }}>
              {t.s==='done'&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              {t.s==='active'&&<div style={{width:5,height:5,borderRadius:'50%',background:'#fff'}}/>}
            </div>
            <span style={{ fontSize:12, fontWeight:t.s==='active'?600:400, color:t.s==='todo'?'#bbb':'#191c1d', textDecoration:t.s==='done'?'line-through':'none', opacity:t.s==='done'?.4:1 }}>{t.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KaiMini() {
  return (
    <div style={{ background:'#fff', borderRadius:18, overflow:'hidden', fontFamily:'var(--f)' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(0,0,0,.05)', display:'flex', alignItems:'center', gap:11 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%,#2a2a2f,#090909)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.15)', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 28%,rgba(124,58,237,.18),transparent 55%)', pointerEvents:'none' }}/>
          <span style={{ fontSize:18, fontWeight:700, color:'#7C3AED', position:'relative', zIndex:1, lineHeight:1 }}>K</span>
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700 }}>KAI</div>
          <div style={{ fontSize:10, color:'#16A34A', fontWeight:500 }}>Connecté à vos données</div>
        </div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ alignSelf:'flex-end', maxWidth:'76%', padding:'11px 16px', borderRadius:'16px 16px 4px 16px', background:'#191c1d', color:'#fff', fontSize:13, lineHeight:1.5 }}>Compare les offres du lot CVC</div>
        <div style={{ alignSelf:'flex-start', maxWidth:'88%', padding:'14px 16px', borderRadius:'16px 16px 16px 4px', background:'#f5f5f7', fontSize:13, lineHeight:1.65 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#7C3AED', letterSpacing:'.04em', marginBottom:8 }}>ANALYSE KAI</div>
          3 offres reçues pour le lot CVC.<br/><br/>
          <strong>Recommandation :</strong> CLIM Pro CI — 14,6 M FCFA, délai 45j.<br/>
          Meilleur ratio qualité/coût sur ce lot.
        </div>
      </div>
      <div style={{ padding:'10px 20px 14px', borderTop:'1px solid rgba(0,0,0,.03)' }}>
        <div style={{ padding:'10px 14px', borderRadius:10, background:'#f5f5f7', fontSize:12, color:'#bbb' }}>Demandez à KAI. Obtenez une réponse claire et exploitable.</div>
      </div>
      <div style={{ padding:'0 20px 14px', display:'flex', gap:5, flexWrap:'wrap' }}>
        {['Rapport chantier','Vérifier paiements','Urgences du jour'].map(p=>(
          <div key={p} style={{ padding:'4px 11px', borderRadius:100, border:'1px solid rgba(0,0,0,.08)', fontSize:10, fontWeight:500, color:'#999' }}>{p}</div>
        ))}
      </div>
    </div>
  )
}

function KaiBar({ size='md', dark }) {
  const lg = size==='lg'
  const orbS = lg?42:36, kFs = lg?17:14, txtFs = lg?13:12, subFs = lg?10:9
  const pad = lg?'7px 16px 7px 7px':'6px 14px 6px 6px'
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:lg?12:10, padding:pad, borderRadius:100, background:'#fff', border:dark?'1.5px solid rgba(255,255,255,.15)':'1.5px solid rgba(0,0,0,.1)', boxShadow:dark?'0 4px 24px rgba(0,0,0,.3)':'0 4px 20px rgba(0,0,0,.06)' }}>
      <div style={{ width:orbS, height:orbS, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%,#2a2a2f,#090909)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 28%,rgba(124,58,237,.18),transparent 55%)', pointerEvents:'none', animation:'lpOrbGlow 4s ease-in-out infinite' }}/>
        <span style={{ fontSize:kFs, fontWeight:700, color:'#7C3AED', lineHeight:1, position:'relative', zIndex:1 }}>K</span>
        <div style={{ position:'absolute', top:lg?-2:-1, right:lg?-2:-1, minWidth:lg?18:16, height:lg?18:16, borderRadius:100, background:'#FF3B30', color:'#fff', fontSize:lg?9:8, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff', lineHeight:1 }}>3</div>
        <div style={{ position:'absolute', bottom:lg?0:-1, right:lg?0:-1, width:lg?10:9, height:lg?10:9, borderRadius:'50%', background:'#34c759', border:'2px solid #fff' }}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <div style={{ fontSize:txtFs, fontWeight:700, color:'#111', letterSpacing:'.03em' }}>KAI</div>
        <div style={{ fontSize:subFs, color:'#999', fontWeight:500 }}>Assistant personnel IA</div>
      </div>
    </div>
  )
}

// ═══ LABEL COMPONENT ═══
const Label = ({children}) => <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'2.5px', color:'#ccc', margin:'0 0 12px' }}>{children}</p>
const LabelDark = ({children}) => <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'3px', color:'rgba(255,255,255,.2)', margin:'0 0 14px' }}>{children}</p>

// ═══ PAGE ═══

export default function LandingPage() {
  const nav = useNavigate()
  const go = () => nav('/onboarding')
  const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  return (
    <div style={{ minHeight:'100vh', background:'#fff', color:'#191c1d', fontFamily:'var(--f)' }}>

      {/* ══ HEADER ══ */}
      <header style={{ position:'sticky', top:0, zIndex:50, borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(10,10,10,.94)', backdropFilter:'blur(24px) saturate(1.8)', WebkitBackdropFilter:'blur(24px) saturate(1.8)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
              <MeereoLogo size={28}/>
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14, fontWeight:600, letterSpacing:'-.15px', color:'#fff' }}>MEEREO</span>
                  <span style={{ fontSize:18, lineHeight:1 }}>🇨🇮</span>
                </div>
                <span style={{ fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:500, letterSpacing:'.02em', marginTop:1 }}>Côte-d'Ivoire</span>
              </div>
            </div>
            <nav className="lp-n" style={{ display:'flex', gap:20 }}>
              {[['Système','sys'],['Fonctionnalités','feat'],['KAI','kai']].map(([l,id])=>(
                <a key={id} onClick={()=>scroll(id)} style={{ fontSize:12.5, color:'rgba(255,255,255,.45)', cursor:'pointer', fontWeight:500, transition:'color .15s', textDecoration:'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.45)'}>{l}</a>
              ))}
            </nav>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <button onClick={go} style={{ borderRadius:100, border:'1px solid rgba(255,255,255,.12)', background:'transparent', padding:'7px 14px', fontSize:12, fontWeight:500, color:'rgba(255,255,255,.7)', cursor:'pointer', fontFamily:'var(--f)' }} onMouseOver={e=>e.target.style.background='rgba(255,255,255,.05)'} onMouseOut={e=>e.target.style.background='transparent'}>Se connecter</button>
            <button onClick={go} style={{ borderRadius:100, background:'#fff', padding:'7px 16px', fontSize:12, fontWeight:500, color:'#000', border:'none', cursor:'pointer', fontFamily:'var(--f)' }} onMouseOver={e=>e.target.style.background='#e5e5e5'} onMouseOut={e=>e.target.style.background='#fff'}>Créer mon espace</button>
          </div>
        </div>
      </header>

      <main>

        {/* ══ S1 — HERO ══ */}
        <section style={{ background:'#0a0a0a', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'88px 28px 0', textAlign:'center' }}>
            <h1 style={{ fontSize:'clamp(36px,5.5vw,60px)', fontWeight:600, letterSpacing:'-.045em', lineHeight:1.08, color:'#fff', margin:'0 auto', maxWidth:780 }}>
              Une seule plateforme pour piloter vos projets BTP & Immobilier, quel que soit votre rôle.
            </h1>
            {/* Subtitle */}
            <p style={{ marginTop:24, fontSize:16, lineHeight:1.65, color:'rgba(255,255,255,.45)', maxWidth:520, margin:'24px auto 0' }}>
              Chaque acteur du projet accède au même système, avec la bonne visibilité et le bon niveau de contrôle. Décidez en temps réel avec <strong style={{ color:'#7C3AED' }}>KAI</strong>, <strong style={{ color:'rgba(255,255,255,.7)' }}>votre assistant IA personnel</strong>.
            </p>
            {/* CTAs */}
            <div style={{ marginTop:36, display:'flex', justifyContent:'center', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <button onClick={go} style={{ borderRadius:100, background:'#fff', padding:'13px 28px', fontSize:14, fontWeight:500, color:'#000', border:'none', cursor:'pointer', fontFamily:'var(--f)', boxShadow:'0 2px 12px rgba(255,255,255,.08)' }} onMouseOver={e=>e.target.style.background='#e5e5e5'} onMouseOut={e=>e.target.style.background='#fff'}>Créer mon espace</button>
              <button onClick={()=>scroll('sys')} style={{ borderRadius:100, border:'1px solid rgba(255,255,255,.15)', background:'transparent', padding:'13px 28px', fontSize:14, fontWeight:500, color:'rgba(255,255,255,.7)', cursor:'pointer', fontFamily:'var(--f)' }} onMouseOver={e=>e.target.style.background='rgba(255,255,255,.05)'} onMouseOut={e=>e.target.style.background='transparent'}>Voir le système</button>
            </div>
            {/* micro text */}
            <p style={{ marginTop:28, fontSize:11.5, color:'rgba(255,255,255,.3)', margin:'28px auto 0' }}>Lancé en Côte d'Ivoire · Déploiement progressif en Afrique de l'Ouest</p>
          </div>
          {/* Cockpit + KAI bar floating */}
          <div style={{ maxWidth:920, margin:'56px auto 0', padding:'0 28px 64px', position:'relative' }}>
            {/* KAI bar — floating left, above cockpit */}
            <div style={{ position:'absolute', top:-28, left:48, zIndex:3 }} className="lp-kai-float">
              <KaiBar size="md" dark />
            </div>
            <CockpitFull/>
          </div>
        </section>

        {/* ══ S2 — VOTRE RÔLE ══ */}
        <section id="sys" style={{ background:'#f5f5f7', borderBottom:'1px solid rgba(0,0,0,.1)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'68px 28px' }}>
            <div style={{ textAlign:'center', maxWidth:580, margin:'0 auto' }}>
              <Label>Votre rôle, votre accès</Label>
              <h2 style={{ fontSize:'clamp(26px,3.5vw,36px)', fontWeight:600, letterSpacing:'-.025em', color:'#000', margin:0 }}>
                Et vous, quel rôle jouez-vous dans le projet ?
              </h2>
              <p style={{ marginTop:14, fontSize:14, color:'#aaa', lineHeight:1.6 }}>
                MEEREO vous donne un accès adapté à votre rôle. Chacun agit avec les bonnes informations et le bon niveau de validation.
              </p>
            </div>
            <div style={{ marginTop:40, display:'grid', gap:14, gridTemplateColumns:'repeat(3,1fr)', maxWidth:940, margin:'40px auto 0' }} className="lp-act">
              {[
                {t:'Une visibilité claire', d:'Les bonnes informations, au bon moment, pour décider avec clarté.'},
                {t:'Une messagerie intégrée', d:'Échangez, validez et coordonnez depuis un espace dédié au projet.'},
                {t:'Un cadre commun', d:'Tous les acteurs avancent dans le même système, avec plus de cohérence.'},
              ].map(c=>(
                <div key={c.t} style={{ borderRadius:16, border:'1px solid rgba(0,0,0,.08)', background:'#fff', padding:'28px 24px', transition:'all .2s' }} onMouseOver={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.05)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
                  <div style={{ fontSize:15, fontWeight:600, color:'#191c1d', marginBottom:10 }}>{c.t}</div>
                  <p style={{ fontSize:13, lineHeight:1.55, color:'#aaa', margin:0 }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ S3 — COCKPIT (fond noir) ══ */}
        <section style={{ padding:'68px 28px', background:'#0a0b0c', color:'#fff' }}>
          <div style={{ maxWidth:620, margin:'0 auto', textAlign:'center' }}>
            <Label>Votre cockpit</Label>
            <h2 style={{ fontSize:'clamp(24px,3.5vw,32px)', fontWeight:600, letterSpacing:'-.025em', lineHeight:1.2, color:'#fff', margin:0 }}>
              Le centre de contrôle de tous vos projets
            </h2>
            <p style={{ marginTop:14, fontSize:14.5, color:'rgba(255,255,255,.45)', lineHeight:1.6, maxWidth:560, margin:'14px auto 0' }}>
              Centralisez l'avancement des chantiers, les arbitrages, les flux financiers et l'accès à de nouvelles opportunités. Achetez vos matériaux, répondez à des appels d'offres et gardez une lecture claire de chaque décision.
            </p>
          </div>
          <div style={{ maxWidth:940, margin:'44px auto 0', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }} className="lp-zoom-grid">
            {[
              { label:'Projet actif', val:'APD · 45 %', sub:'Suivez l\u2019avancement de vos projets en temps réel, où que vous soyez dans le monde, et gardez une maîtrise claire sur chaque phase.' },
              { label:'Appels d\u2019offres', val:'2 opportunités', sub:'Accédez à de nouveaux appels d\u2019offres, répondez à des besoins qualifiés et développez votre activité auprès de nouveaux clients.' },
              { label:'Trésorerie', val:'62 % engagé', sub:'Visualisez les engagements, suivez les disponibilités, validez les paiements et gardez le contrôle sur les flux du projet.' },
              { label:'Marketplace', val:'4 commandes en cours', sub:'Suivez vos achats de matériaux depuis une marketplace centralisée, avec une vue claire sur les offres disponibles.' },
            ].map(z=>(
              <div key={z.label} style={{ borderRadius:16, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.04)', padding:'26px 24px' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,.5)', letterSpacing:'-.02em', marginBottom:12 }}>{z.label}</div>
                <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-.4px', color:'#fff', marginBottom:8 }}>{z.val}</div>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,.35)', lineHeight:1.5 }}>{z.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ S4 — FONCTIONNALITÉS ══ */}
        <section id="feat" style={{ background:'#f5f5f7', borderTop:'1px solid rgba(0,0,0,.1)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'72px 28px' }}>
            <div style={{ textAlign:'center', maxWidth:600, margin:'0 auto 52px' }}>
              <Label>Fonctionnalités</Label>
              <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:600, letterSpacing:'-.02em', color:'#000', margin:0 }}>
                En un seul clic, toutes les fonctionnalités de votre projet à portée de main
              </h2>
            </div>
            {/* Bloc principal */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:44, alignItems:'center', marginBottom:56 }} className="lp-fr">
              <div style={{ padding:'4px 0' }}>
                <h3 style={{ fontSize:26, fontWeight:700, letterSpacing:'-.035em', color:'#000', margin:0, lineHeight:1.2 }}>Une maîtrise complète de l'avancement du chantier</h3>
                <p style={{ marginTop:16, fontSize:15, lineHeight:1.65, color:'#888' }}>Visualisez chaque phase du chantier, suivez les éléments attendus et validez l'avancement dans un cadre clair, traçable et maîtrisé.</p>
              </div>
              <div className="lp-frame"><ChantierMini/></div>
            </div>
            {/* Cartes secondaires */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, alignItems:'center' }} className="lp-pills">
              {[
                {t:'Appels d\u2019offres & marchés', d:'Accédez à de nouvelles opportunités, répondez à des clients qualifiés et développez votre activité à travers un espace conçu pour ouvrir de nouvelles perspectives.', hero:false},
                {t:'Marketplace', d:'Achetez vos matériaux et équipements depuis un espace centralisé, avec une vue d\u2019ensemble claire sur les offres disponibles sur le marché.', hero:true},
                {t:'Centre financier', d:'Suivez vos dépenses, vos transactions financières, vos engagements et vos disponibilités dans un espace clair, conçu pour vous donner plus de contrôle et de traçabilité.', hero:false},
              ].map(f=>(
                <div key={f.t} style={{ borderRadius:18, border:f.hero?'1px solid rgba(255,255,255,.12)':'1px solid rgba(255,255,255,.06)', background:f.hero?'#1a1d1e':'#141516', padding:f.hero?'40px 30px':'28px 24px', transition:'all .2s', boxShadow:f.hero?'0 8px 32px rgba(0,0,0,.4)':'0 2px 8px rgba(0,0,0,.2)', transform:f.hero?'scale(1.08)':'none' }} onMouseOver={e=>{e.currentTarget.style.boxShadow=f.hero?'0 14px 40px rgba(0,0,0,.45)':'0 8px 28px rgba(0,0,0,.3)';e.currentTarget.style.transform=f.hero?'scale(1.10)':'translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.boxShadow=f.hero?'0 8px 32px rgba(0,0,0,.4)':'0 2px 8px rgba(0,0,0,.2)';e.currentTarget.style.transform=f.hero?'scale(1.08)':'none'}}>
                  <h3 style={{ fontSize:f.hero?22:17, fontWeight:f.hero?700:600, letterSpacing:'-.02em', color:'#fff', margin:0 }}>{f.t}</h3>
                  <p style={{ marginTop:10, fontSize:13.5, lineHeight:1.55, color:'rgba(255,255,255,.4)' }}>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ S5 — FINANCE + MARKETPLACE ══ */}
        <section style={{ background:'#fff', borderTop:'1px solid rgba(0,0,0,.1)', borderBottom:'1px solid rgba(0,0,0,.1)' }}>
          <div style={{ maxWidth:1000, margin:'0 auto', padding:'68px 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className="lp-fin">
            {/* Centre financier */}
            <div style={{ borderRadius:18, border:'1px solid rgba(0,0,0,.08)', background:'#f5f5f7', padding:'28px 26px' }}>
              <Label>Centre financier</Label>
              <div style={{ fontSize:9, fontWeight:700, color:'#ccc', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Budget total</div>
              <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-1.2px', color:'#191c1d', lineHeight:1 }}>250 000 000</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#bbb', marginTop:4, marginBottom:20 }}>FCFA</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
                <div style={{ padding:'14px 16px', borderRadius:10, background:'#fff', border:'1px solid rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize:8.5, fontWeight:700, color:'#ccc', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5 }}>Engagé</div>
                  <div style={{ fontSize:17, fontWeight:800, letterSpacing:'-.4px', color:'#191c1d' }}>155 000 000</div>
                </div>
                <div style={{ padding:'14px 16px', borderRadius:10, background:'#fff', border:'1px solid rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize:8.5, fontWeight:700, color:'#ccc', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5 }}>Disponible</div>
                  <div style={{ fontSize:17, fontWeight:800, letterSpacing:'-.4px', color:'#16A34A' }}>95 000 000</div>
                </div>
              </div>
              <p style={{ fontSize:13, lineHeight:1.55, color:'#aaa', margin:0 }}>Visualisez où va votre budget. Chaque paiement est tracé, validé et sécurisé.</p>
            </div>
            {/* Marketplace */}
            <div style={{ borderRadius:18, border:'1px solid rgba(0,0,0,.08)', background:'#fff', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ background:'linear-gradient(150deg,#0a0b0c,#1a1d1e)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Meereo</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>Shop</span>
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  {[{v:'36',l:'Produits'},{v:'12',l:'Fournisseurs'},{v:'11',l:'Catégories'}].map(s=>(
                    <div key={s.l} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:13, fontWeight:800, color:'#fff', lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:7, fontWeight:600, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.5px', marginTop:2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:4, padding:'10px 16px', borderBottom:'1px solid rgba(0,0,0,.1)' }}>
                {['Tout','Gros Œuvre','Structure','Isolation','Menuiseries'].map((c,i)=>(
                  <div key={c} style={{ padding:'4px 10px', borderRadius:100, fontSize:9, fontWeight:600, whiteSpace:'nowrap', ...(i===0?{background:'#191c1d',color:'#fff'}:{background:'#f3f4f5',color:'#999'}) }}>{c}</div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'12px 16px' }}>
                {[
                  {name:'Béton Haute Performance XR45',brand:'Lafarge',price:'85 000',unit:'/m³',rating:'4.8'},
                  {name:'Agglos creux 20x20x50',brand:'BPCI',price:'48 000',unit:'/palette',rating:'4.5'},
                ].map(p=>(
                  <div key={p.name} style={{ padding:'10px 12px', borderRadius:10, border:'1px solid rgba(0,0,0,.05)', background:'#f5f5f7' }}>
                    <div style={{ fontSize:8, fontWeight:600, color:'#aaa', marginBottom:4 }}>{p.brand}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#191c1d', lineHeight:1.3, marginBottom:6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.name}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div><span style={{ fontSize:12, fontWeight:800, color:'#191c1d' }}>{p.price} FCFA</span><span style={{ fontSize:9, color:'#bbb', marginLeft:3 }}>{p.unit}</span></div>
                      <div style={{ display:'flex', alignItems:'center', gap:1, fontSize:9, color:'#F59E0B' }}>{Array.from({length: Math.floor(parseFloat(p.rating))}, (_, i) => <Star key={i} size={9} fill="#F59E0B" strokeWidth={0}/>)} <span style={{ color:'#bbb' }}>{p.rating}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'10px 16px 16px', marginTop:'auto' }}>
                <p style={{ fontSize:12, lineHeight:1.5, color:'#aaa', margin:0 }}>Achetez vos matériaux depuis un espace centralisé, avec une vue claire sur les offres du marché.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ S6 — KAI ══ */}
        <section id="kai" style={{ background:'#0a0a0a', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:'50%', height:'50%', background:'radial-gradient(ellipse,rgba(255,255,255,.025),transparent 65%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'96px 28px', position:'relative' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
                <KaiBar size="md" dark />
              </div>
              <LabelDark>Intelligence embarquée</LabelDark>
              <h2 style={{ fontSize:'clamp(28px,4vw,40px)', fontWeight:600, letterSpacing:'-.04em', lineHeight:1.1, margin:0 }}>
                KAI orchestre votre projet
              </h2>
              <p style={{ marginTop:16, fontSize:15, lineHeight:1.65, color:'rgba(255,255,255,.4)', maxWidth:460, margin:'16px auto 0' }}>
                Analyse en continu, recommandations actionnables et pilotage autonome de certaines tâches. KAI vous assiste activement dans chaque décision.
              </p>
            </div>
            {/* KAI capabilities cards */}
            <div style={{ maxWidth:600, margin:'0 auto 36px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                {t:'Rapports chantier',d:'En langage naturel, générés depuis vos données.'},
                {t:'Comparatif d\u2019offres',d:'Analyse, scoring et recommandation automatiques.'},
                {t:'Alertes proactives',d:'Points critiques identifiés avant qu\u2019ils ne deviennent des problèmes.'},
              ].map(c=>(
                <div key={c.t} style={{ padding:'18px 16px', borderRadius:14, border:'1px solid rgba(255,255,255,.07)', background:'rgba(255,255,255,.03)' }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,.7)', marginBottom:6 }}>{c.t}</div>
                  <div style={{ fontSize:11, lineHeight:1.5, color:'rgba(255,255,255,.35)' }}>{c.d}</div>
                </div>
              ))}
            </div>
            <div style={{ maxWidth:500, margin:'0 auto' }}>
              <div className="lp-frame-kai"><KaiMini/></div>
            </div>
            <div style={{ textAlign:'center', marginTop:36 }}>
              <button onClick={go} style={{ borderRadius:100, background:'#fff', padding:'13px 28px', fontSize:14, fontWeight:500, color:'#000', border:'none', cursor:'pointer', fontFamily:'var(--f)', boxShadow:'0 2px 16px rgba(255,255,255,.06)' }} onMouseOver={e=>e.target.style.background='#e8e8e8'} onMouseOut={e=>e.target.style.background='#fff'}>Essayer KAI</button>
            </div>
          </div>
        </section>

        {/* ══ S7 — DIFFÉRENCIATION ══ */}
        <section style={{ padding:'76px 28px' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <Label>Pourquoi MEEREO</Label>
              <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:600, letterSpacing:'-.02em', color:'#000', margin:0 }}>
                Passez d'un projet désorganisé à un système structuré et maîtrisé.
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:0, alignItems:'start' }} className="lp-diff">
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#bbb', marginBottom:4 }}>Avant</div>
                {['Fichiers Excel éparpillés','WhatsApp pour coordonner','Aucune visibilité financière','Outils fragmentés par métier'].map(t=>(
                  <div key={t} style={{ padding:'16px 20px', borderRadius:12, background:'#f0f0f2', border:'1px solid rgba(0,0,0,.08)', fontSize:14, color:'#999', textDecoration:'line-through', textDecorationColor:'rgba(0,0,0,.2)' }}>{t}</div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px 0' }} className="lp-arr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#191c1d', marginBottom:4 }}>Avec MEEREO</div>
                {['Cockpit centralisé par projet','Décisions tracées et validées','Trésorerie temps réel intégrée','Plateforme unique multi-acteurs'].map(t=>(
                  <div key={t} style={{ padding:'16px 20px', borderRadius:12, background:'#191c1d', fontSize:14, fontWeight:600, color:'#fff' }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ S8 — CTA FINAL ══ */}
        <section style={{ background:'#f5f5f7', borderTop:'1px solid rgba(0,0,0,.1)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'68px 28px' }}>
            <div style={{ borderRadius:24, background:'#191c1d', padding:'64px 40px', color:'#fff' }}>
              <div style={{ maxWidth:540, margin:'0 auto', textAlign:'center' }}>
                <h2 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:600, letterSpacing:'-.02em', margin:0, lineHeight:1.25 }}>
                  Prenez le contrôle total de vos projets, de vos équipes et de vos décisions
                </h2>
                <p style={{ marginTop:16, fontSize:15, lineHeight:1.6, color:'rgba(255,255,255,.5)' }}>
                  MEEREO vous donne la visibilité, le contrôle et l'intelligence pour piloter vos projets avec précision.
                </p>
                <button onClick={go} style={{ marginTop:32, borderRadius:100, background:'#fff', padding:'14px 32px', fontSize:14.5, fontWeight:500, color:'#000', border:'none', cursor:'pointer', fontFamily:'var(--f)' }} onMouseOver={e=>e.target.style.background='#e8e8e8'} onMouseOut={e=>e.target.style.background='#fff'}>Créer mon espace</button>
                <p style={{ marginTop:18, fontSize:12, color:'rgba(255,255,255,.3)' }}>Déployé sur des projets réels en Côte d'Ivoire 🇨🇮</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══ S9 — FOOTER ══ */}
      <footer style={{ background:'#0a0a0a', color:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gap:32, padding:'44px 28px', gridTemplateColumns:'1.5fr .7fr .7fr .7fr' }} className="lp-ft">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}><MeereoLogo size={26}/><span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>MEEREO</span></div>
            <p style={{ marginTop:12, maxWidth:260, fontSize:12, lineHeight:1.5, color:'rgba(255,255,255,.4)' }}>Plateforme BTP & Immobilier pour l'Afrique francophone.</p>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,.25)', margin:0 }}>Produit</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'rgba(255,255,255,.5)' }}>
              <span style={{cursor:'pointer'}} onClick={()=>scroll('feat')}>Fonctionnalités</span>
              <span style={{cursor:'pointer'}} onClick={()=>scroll('kai')}>KAI</span>
              <span style={{cursor:'pointer'}} onClick={()=>scroll('sys')}>Multi-acteurs</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,.25)', margin:0 }}>Légal</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'rgba(255,255,255,.5)' }}>
              <span style={{cursor:'pointer'}} onClick={()=>nav('/conditions')}>Conditions d'utilisation</span>
              <span style={{cursor:'pointer'}} onClick={()=>nav('/confidentialite')}>Confidentialité</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,.25)', margin:0 }}>Contact</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'rgba(255,255,255,.5)' }}>
              <span>contact@meereo.com</span>
              <span>🇨🇮 Abidjan, Côte d'Ivoire</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.03)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 28px', fontSize:11, color:'rgba(255,255,255,.35)' }}>© 2025 Meereo</div>
        </div>
      </footer>

      {/* ══ CSS ══ */}
      <style>{`
        .lp-frame{border-radius:16px;padding:0;background:transparent;box-shadow:0 8px 32px rgba(0,0,0,.06)}.lp-frame>div{border:1px solid rgba(0,0,0,.12)}
        .lp-frame-kai{border-radius:20px;padding:6px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 64px rgba(0,0,0,.4),0 0 32px rgba(255,255,255,.02)}
        @keyframes lpOrbGlow{0%,100%{opacity:1}50%{opacity:.7}}
        .lp-n{display:flex!important}
        @media(max-width:768px){
          .lp-n{display:none!important}
          .lp-kai-float{position:static!important;display:flex;justify-content:center;margin-bottom:16px}
          .lp-zoom-grid{grid-template-columns:1fr!important}
          .lp-act{grid-template-columns:1fr!important}
          .lp-fr{grid-template-columns:1fr!important;gap:20px!important}
          .lp-pills{grid-template-columns:1fr!important}
          .lp-fin{grid-template-columns:1fr!important;gap:20px!important}
          .lp-diff{grid-template-columns:1fr!important;gap:14px!important}
          .lp-arr{transform:rotate(90deg);padding:4px 0!important}
          .lp-ft{grid-template-columns:1fr!important;gap:20px!important;padding:28px 20px!important}
        }
        @media(min-width:769px) and (max-width:1024px){
          .lp-act{grid-template-columns:1fr 1fr!important}
          .lp-fr{grid-template-columns:1fr!important}
          .lp-fin{grid-template-columns:1fr!important}
          .lp-ft{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </div>
  )
}
