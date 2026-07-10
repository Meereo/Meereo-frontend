# MEEREO — Bibliothèque de composants · Page Professionnelle Publique

**Version :** 1.0
**Référentiel :** Platform Bible Vol. 3 — Tome 14.5, complété des sections Coordonnées et Contact
**Contenu :** 11 sections × 3 variantes = 33 composants HTML/CSS autonomes, sans JavaScript
**Design system :** noir/blanc/gris strict — aucune couleur
**Contenu de démonstration :** Raw Design (exemple du corpus, `meereo.com/pro/raw-design`)

**Usage :** copier le bloc *Fondations* (obligatoire, une seule fois par page), puis le bloc CSS de la section concernée, puis le markup de la variante choisie. Chaque variante est identifiée par sa référence de cartouche `PP-XX/L`.

---

## Fondations (obligatoires)

Tokens, base et classes partagées par tous les composants (`.pp-badge`, `.pp-btn`, `.pp-ph`, `.pp-logo`, `.pp-eyebrow`, `.pp-meta`, `.pp-num`…).

```css
/* ── Tokens ─────────────────────────────────────────────────────── */
:root{
  --black:#000000;
  --ink:#0A0A0A;        /* texte principal */
  --ink-2:#3D3D3D;      /* texte secondaire */
  --ink-3:#7A7A7A;      /* méta, légendes */
  --ink-4:#B4B4B4;      /* désactivé, filigrane */
  --line:#E6E6E6;       /* hairline */
  --line-2:#D2D2D2;     /* hairline appuyée */
  --surface:#F7F7F7;    /* fond de bloc */
  --surface-2:#F0F0F0;  /* fond appuyé */
  --paper:#FFFFFF;
  --font-ui:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;
  --font-mono:ui-monospace,"SF Mono","Cascadia Mono","Segoe UI Mono",Menlo,monospace;
  --hatch:repeating-linear-gradient(135deg,var(--surface-2) 0 1px,var(--surface) 1px 9px);
}

/* ── Base ───────────────────────────────────────────────────────── */
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:var(--font-ui);color:var(--ink);background:var(--paper);
     font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit}
:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

/* ══════════════════════════════════════════════════════════════════
   FONDATIONS COMPOSANTS  (partagées par toutes les variantes)
   ══════════════════════════════════════════════════════════════════ */
.pp{max-width:1080px;margin:0 auto;padding:0 28px}
.pp-eyebrow{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-3)}
.pp-badge{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--ink);
  padding:4px 10px;font-size:11.5px;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.pp-badge::before{content:"";width:7px;height:7px;background:var(--ink);border-radius:50%}
.pp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  border:1px solid var(--ink);background:var(--paper);color:var(--ink);
  font:600 13.5px/1 var(--font-ui);padding:13px 22px;cursor:pointer;
  text-decoration:none;letter-spacing:.02em;transition:background .15s,color .15s}
.pp-btn:hover{background:var(--ink);color:#fff}
.pp-btn--solid{background:var(--ink);color:#fff}
.pp-btn--solid:hover{background:var(--black)}
.pp-btn--ghost{border-color:transparent;text-decoration:underline;text-underline-offset:3px;padding:13px 6px}
.pp-btn--ghost:hover{background:transparent;color:var(--ink-2)}
.pp-ph{background:var(--hatch);border:1px solid var(--line)}       /* placeholder image */
.pp-ph--dark{background:repeating-linear-gradient(135deg,#1A1A1A 0 1px,#0F0F0F 1px 9px);border:0}
.pp-logo{width:64px;height:64px;background:var(--ink);color:#fff;display:grid;
  place-items:center;font:650 20px/1 var(--font-ui);letter-spacing:.02em;flex:none}
.pp-hr{border:0;border-top:1px solid var(--line)}
.pp-meta{font-family:var(--font-mono);font-size:12px;color:var(--ink-3);letter-spacing:.03em}
.pp-num{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
```

---

## Section 01 — En-tête

Champs : logo · bannière · nom · catégorie · localisation · badge Professionnel Vérifié · slogan (optionnel) · actions Contacter / Inviter dans un projet.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══════════════════════════════════════════════════════════════════
   PP-01 — EN-TÊTE (HERO)
   Champs (Tome 14.5) : logo · bannière · nom · catégorie · localisation
   · badge Professionnel Vérifié · slogan (optionnel) · actions (§5)
   ══════════════════════════════════════════════════════════════════ */

/* ── PP-01/A — « Bannière » : cover pleine largeur, logo chevauchant ── */
.pp-hero-a .pp-hero-a-cover{height:min(34vw,300px);background:var(--hatch);
  border-bottom:1px solid var(--line-2)}
.pp-hero-a .pp{display:flex;gap:26px;align-items:flex-end;flex-wrap:wrap;
  padding-bottom:30px}
.pp-hero-a .pp-logo{width:96px;height:96px;font-size:28px;margin-top:-48px;
  border:4px solid var(--paper)}
.pp-hero-a .pp-hero-a-id{flex:1;min-width:260px;padding-top:18px}
.pp-hero-a h1{font-size:clamp(26px,4vw,38px);font-weight:650;letter-spacing:-.02em;line-height:1.05}
.pp-hero-a .pp-hero-a-sub{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:10px}
.pp-hero-a .pp-hero-a-cat{font-size:14px;color:var(--ink-2);font-weight:500}
.pp-hero-a .pp-hero-a-loc{font-family:var(--font-mono);font-size:12px;color:var(--ink-3)}
.pp-hero-a .pp-hero-a-actions{display:flex;gap:10px;padding-top:18px;flex-wrap:wrap}

/* ── PP-01/B — « Éditorial » : typographie monumentale, sans bannière ── */
.pp-hero-b{padding:64px 0 46px;border-bottom:1px solid var(--ink)}
.pp-hero-b .pp-hero-b-top{display:flex;justify-content:space-between;gap:18px;
  align-items:center;margin-bottom:34px;flex-wrap:wrap}
.pp-hero-b h1{font-size:clamp(44px,8.5vw,96px);font-weight:300;letter-spacing:-.035em;
  line-height:.98;text-transform:uppercase}
.pp-hero-b h1 b{font-weight:700}
.pp-hero-b .pp-hero-b-slogan{margin-top:20px;font-size:clamp(16px,2vw,20px);
  color:var(--ink-2);max-width:44ch}
.pp-hero-b .pp-hero-b-meta{display:flex;gap:0;margin-top:34px;border-top:1px solid var(--line);
  flex-wrap:wrap}
.pp-hero-b .pp-hero-b-meta > div{padding:14px 26px 0 0;margin-right:26px;
  border-right:1px solid var(--line)}
.pp-hero-b .pp-hero-b-meta > div:last-child{border-right:0}
.pp-hero-b .pp-hero-b-meta .pp-eyebrow{display:block;margin-bottom:4px}
.pp-hero-b .pp-hero-b-meta strong{font-size:14px;font-weight:600}
.pp-hero-b .pp-hero-b-actions{display:flex;gap:10px;margin-top:34px;flex-wrap:wrap}

/* ── PP-01/C — « Cartouche compact » : barre d'identité dense ── */
.pp-hero-c{border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}
.pp-hero-c .pp{display:flex;align-items:stretch;gap:0;padding:0 28px;flex-wrap:wrap}
.pp-hero-c .pp-hero-c-cell{display:flex;align-items:center;gap:14px;
  padding:16px 22px;border-right:1px solid var(--line)}
.pp-hero-c .pp-hero-c-cell:first-child{padding-left:0}
.pp-hero-c .pp-hero-c-cell:last-child{border-right:0;margin-left:auto;padding-right:0}
.pp-hero-c .pp-logo{width:44px;height:44px;font-size:15px}
.pp-hero-c h1{font-size:17px;font-weight:650;letter-spacing:-.01em;line-height:1.1}
.pp-hero-c .pp-hero-c-cat{font-size:12.5px;color:var(--ink-3);margin-top:2px}
.pp-hero-c .pp-btn{padding:10px 16px;font-size:12.5px}
@media(max-width:760px){.pp-hero-c .pp-hero-c-cell{border-right:0;padding:12px 0}
  .pp-hero-c .pp-hero-c-cell:last-child{margin-left:0}}
```

### PP-01/A — Bannière

*Photo de couverture pleine largeur, logo chevauchant — vitrine classique, met la matière visuelle en avant.*

```html
    <section class="pp-hero-a">
      <div class="pp-hero-a-cover" role="img" aria-label="Photo de couverture"></div>
      <div class="pp">
        <div class="pp-logo" aria-hidden="true">RD</div>
        <div class="pp-hero-a-id">
          <h1>Raw Design</h1>
          <div class="pp-hero-a-sub">
            <span class="pp-hero-a-cat">Bureau d'architecture</span>
            <span class="pp-badge">Professionnel vérifié MEEREO</span>
            <span class="pp-hero-a-loc">ABIDJAN · CÔTE D'IVOIRE</span>
          </div>
        </div>
        <div class="pp-hero-a-actions">
          <a class="pp-btn pp-btn--solid" href="#contact">Contacter</a>
          <a class="pp-btn" href="#inviter">Inviter dans un projet</a>
        </div>
      </div>
    </section>
```

### PP-01/B — Éditorial

*Sans bannière : le nom devient la matière. Typographie monumentale, méta en cartouche — identité architecturale forte.*

```html
    <section class="pp-hero-b">
      <div class="pp">
        <div class="pp-hero-b-top">
          <div class="pp-logo" aria-hidden="true">RD</div>
          <span class="pp-badge">Professionnel vérifié MEEREO</span>
        </div>
        <h1>Raw <b>Design</b></h1>
        <p class="pp-hero-b-slogan">Architecture résidentielle et tertiaire en Afrique de l'Ouest.</p>
        <div class="pp-hero-b-meta">
          <div><span class="pp-eyebrow">Catégorie</span><strong>Bureau d'architecture</strong></div>
          <div><span class="pp-eyebrow">Localisation</span><strong>Abidjan, Côte d'Ivoire</strong></div>
          <div><span class="pp-eyebrow">Sur MEEREO</span><strong>meereo.com/pro/raw-design</strong></div>
        </div>
        <div class="pp-hero-b-actions">
          <a class="pp-btn pp-btn--solid" href="#contact">Contacter</a>
          <a class="pp-btn" href="#inviter">Inviter dans un projet</a>
        </div>
      </div>
    </section>
```

### PP-01/C — Cartouche compact

*Barre d'identité dense inspirée du cartouche de plan — pour en-tête persistant ou intégration en contexte réduit.*

```html
    <section class="pp-hero-c">
      <div class="pp">
        <div class="pp-hero-c-cell">
          <div class="pp-logo" aria-hidden="true">RD</div>
          <div><h1>Raw Design</h1><div class="pp-hero-c-cat">Bureau d'architecture</div></div>
        </div>
        <div class="pp-hero-c-cell"><span class="pp-badge">Professionnel vérifié MEEREO</span></div>
        <div class="pp-hero-c-cell"><span class="pp-meta">ABIDJAN · CÔTE D'IVOIRE</span></div>
        <div class="pp-hero-c-cell">
          <a class="pp-btn pp-btn--solid" href="#contact">Contacter</a>
          <a class="pp-btn" href="#inviter">Inviter dans un projet</a>
        </div>
      </div>
    </section>
```

---

## Section 02 — Présentation

Champs : histoire · vision · valeurs · domaines d'activité · spécialités. Contenu entièrement personnalisable.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-02 — PRÉSENTATION · histoire · vision · valeurs · domaines d'activité · spécialités ══ */

/* ── PP-02/A — « Essai » : lead + corps sur deux colonnes, valeurs en liste ── */
.pp-pres-a{padding:56px 0}
.pp-pres-a .pp-pres-a-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:40px}
.pp-pres-a .pp-eyebrow{display:block;margin-bottom:14px}
.pp-pres-a h2{font-size:clamp(22px,3vw,30px);font-weight:650;letter-spacing:-.02em;line-height:1.15}
.pp-pres-a .pp-pres-a-body p{color:var(--ink-2);margin-bottom:14px}
.pp-pres-a .pp-pres-a-vals{margin-top:34px;border-top:1px solid var(--ink)}
.pp-pres-a .pp-pres-a-vals li{display:grid;grid-template-columns:220px 1fr;gap:18px;
  padding:16px 0;border-bottom:1px solid var(--line);list-style:none}
.pp-pres-a .pp-pres-a-vals b{font-size:14px;font-weight:650}
.pp-pres-a .pp-pres-a-vals span{font-size:14px;color:var(--ink-2)}
@media(max-width:760px){.pp-pres-a .pp-pres-a-grid{grid-template-columns:1fr}
  .pp-pres-a .pp-pres-a-vals li{grid-template-columns:1fr;gap:4px}}

/* ── PP-02/B — « Manifeste » : lead XXL, valeurs en trois colonnes ── */
.pp-pres-b{padding:64px 0;background:var(--surface)}
.pp-pres-b .pp-eyebrow{display:block;margin-bottom:18px}
.pp-pres-b .pp-pres-b-lead{font-size:clamp(20px,3.2vw,30px);font-weight:400;
  letter-spacing:-.015em;line-height:1.3;max-width:30ch}
.pp-pres-b .pp-pres-b-lead b{font-weight:650}
.pp-pres-b .pp-pres-b-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;
  margin-top:44px;border-top:1px solid var(--line-2);padding-top:26px}
.pp-pres-b .pp-pres-b-cols b{display:block;font-size:13px;font-weight:650;
  letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
.pp-pres-b .pp-pres-b-cols p{font-size:14px;color:var(--ink-2)}
@media(max-width:760px){.pp-pres-b .pp-pres-b-cols{grid-template-columns:1fr}}

/* ── PP-02/C — « Dossier » : rail sommaire + rubriques documentaires ── */
.pp-pres-c{padding:56px 0}
.pp-pres-c .pp-pres-c-grid{display:grid;grid-template-columns:190px 1fr;gap:44px}
.pp-pres-c .pp-pres-c-rail{position:sticky;top:20px;align-self:start}
.pp-pres-c .pp-pres-c-rail a{display:block;font-family:var(--font-mono);font-size:12px;
  color:var(--ink-3);text-decoration:none;padding:8px 0;border-bottom:1px solid var(--line);
  letter-spacing:.06em;text-transform:uppercase}
.pp-pres-c .pp-pres-c-rail a:hover{color:var(--ink)}
.pp-pres-c article{margin-bottom:34px}
.pp-pres-c article h3{font-size:15px;font-weight:650;letter-spacing:.04em;
  text-transform:uppercase;margin-bottom:10px}
.pp-pres-c article p{color:var(--ink-2);font-size:15px;max-width:64ch}
@media(max-width:760px){.pp-pres-c .pp-pres-c-grid{grid-template-columns:1fr}
  .pp-pres-c .pp-pres-c-rail{position:static;display:flex;gap:16px;flex-wrap:wrap}}
```

### PP-02/A — Essai

*Titre à gauche, récit à droite, valeurs en liste tabulaire — équilibre lecture/structure, convient aux présentations développées.*

```html
    <section class="pp-pres-a"><div class="pp">
      <div class="pp-pres-a-grid">
        <div>
          <span class="pp-eyebrow">Présentation</span>
          <h2>Une architecture ancrée dans son climat et son usage</h2>
        </div>
        <div class="pp-pres-a-body">
          <p>Fondé à Abidjan en 2014, Raw Design conçoit des bâtiments résidentiels et
             tertiaires pensés pour le climat ouest-africain : ventilation naturelle,
             protection solaire, matériaux locaux.</p>
          <p>L'agence accompagne ses clients de l'esquisse à la réception, avec une
             méthode documentée à chaque étape : chaque décision est tracée, chaque
             livrable est validé avant de passer à la phase suivante.</p>
        </div>
      </div>
      <ul class="pp-pres-a-vals">
        <li><b>Vision</b><span>Faire de chaque contrainte de site un parti architectural.</span></li>
        <li><b>Valeurs</b><span>Rigueur documentaire, sobriété des moyens, durabilité des ouvrages.</span></li>
        <li><b>Spécialités</b><span>Logement collectif, villas, sièges d'entreprise, rénovation lourde.</span></li>
      </ul>
    </div></section>
```

### PP-02/B — Manifeste

*Une conviction en grand corps, trois rubriques en appui — présentation courte et affirmée, sur fond gris.*

```html
    <section class="pp-pres-b"><div class="pp">
      <span class="pp-eyebrow">Présentation</span>
      <p class="pp-pres-b-lead">Nous concevons des bâtiments <b>simples à vivre et
         durables à entretenir</b>, du premier trait à la réception.</p>
      <div class="pp-pres-b-cols">
        <div><b>Histoire</b><p>Agence fondée à Abidjan en 2014, active en Côte d'Ivoire,
          au Ghana et au Sénégal.</p></div>
        <div><b>Vision</b><p>Une architecture climatique, économe et documentée,
          au service de l'usage.</p></div>
        <div><b>Valeurs</b><p>Rigueur, sobriété, traçabilité des décisions
          sur toute la durée du projet.</p></div>
      </div>
    </div></section>
```

### PP-02/C — Dossier

*Rail de sommaire ancré + rubriques : format documentaire pour les agences qui détaillent histoire, vision et valeurs.*

```html
    <section class="pp-pres-c"><div class="pp">
      <div class="pp-pres-c-grid">
        <nav class="pp-pres-c-rail" aria-label="Sommaire de la présentation">
          <a href="#pres-histoire">Histoire</a>
          <a href="#pres-vision">Vision</a>
          <a href="#pres-valeurs">Valeurs</a>
        </nav>
        <div>
          <article id="pres-histoire"><h3>Histoire</h3>
            <p>Créée en 2014 par deux architectes formés entre Abidjan et Lyon, l'agence
               a livré 47 projets, du logement individuel au siège d'entreprise, en
               Côte d'Ivoire et dans la sous-région.</p></article>
          <article id="pres-vision"><h3>Vision</h3>
            <p>Concevoir avec le climat plutôt que contre lui : orientation, inertie,
               ombrage et ventilation naturelle structurent chaque parti architectural.</p></article>
          <article id="pres-valeurs"><h3>Valeurs</h3>
            <p>Chaque projet est documenté de bout en bout ; chaque engagement pris
               devant le client est tracé et vérifiable.</p></article>
        </div>
      </div>
    </div></section>
```

---

## Section 03 — Chiffres clés

Champs : année de création · nombre de collaborateurs · projets réalisés · pays d'intervention · domaines d'expertise. Mis à jour par l'entreprise.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-03 — CHIFFRES CLÉS · année de création · collaborateurs · projets · pays · domaines ══ */

/* ── PP-03/A — « Bandeau » : cinq indicateurs en ligne ── */
.pp-kpi-a{border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);padding:26px 0}
.pp-kpi-a .pp{display:grid;grid-template-columns:repeat(5,1fr)}
.pp-kpi-a .pp-kpi-a-cell{padding:4px 22px;border-right:1px solid var(--line)}
.pp-kpi-a .pp-kpi-a-cell:first-child{padding-left:0}
.pp-kpi-a .pp-kpi-a-cell:last-child{border-right:0}
.pp-kpi-a .pp-num{font-size:clamp(24px,3vw,34px);font-weight:600;letter-spacing:-.02em}
.pp-kpi-a .pp-eyebrow{display:block;margin-top:4px}
@media(max-width:760px){.pp-kpi-a .pp{grid-template-columns:repeat(2,1fr);row-gap:18px}
  .pp-kpi-a .pp-kpi-a-cell{border-right:0;padding:0}}

/* ── PP-03/B — « Cartouches » : cartes libellé + chiffre + note ── */
.pp-kpi-b{padding:48px 0;background:var(--surface)}
.pp-kpi-b .pp{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.pp-kpi-b .pp-kpi-b-card{background:var(--paper);border:1px solid var(--line-2);padding:18px 16px}
.pp-kpi-b .pp-eyebrow{display:block;margin-bottom:14px}
.pp-kpi-b .pp-num{font-size:30px;font-weight:600;letter-spacing:-.02em;display:block}
.pp-kpi-b small{font-size:12px;color:var(--ink-3);display:block;margin-top:6px}
@media(max-width:900px){.pp-kpi-b .pp{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.pp-kpi-b .pp{grid-template-columns:1fr}}

/* ── PP-03/C — « Phrase augmentée » : récit chiffré ── */
.pp-kpi-c{padding:56px 0}
.pp-kpi-c p{font-size:clamp(19px,2.8vw,27px);font-weight:400;letter-spacing:-.012em;
  line-height:1.5;max-width:38ch;color:var(--ink-2)}
.pp-kpi-c .pp-kpi-c-n{font-family:var(--font-mono);font-weight:600;color:var(--ink);
  border-bottom:2px solid var(--ink);padding:0 2px}
```

### PP-03/A — Bandeau

*Cinq indicateurs en ligne, hairlines verticales — lecture immédiate, s'insère entre deux sections.*

```html
    <section class="pp-kpi-a"><div class="pp">
      <div class="pp-kpi-a-cell"><span class="pp-num">2014</span><span class="pp-eyebrow">Année de création</span></div>
      <div class="pp-kpi-a-cell"><span class="pp-num">18</span><span class="pp-eyebrow">Collaborateurs</span></div>
      <div class="pp-kpi-a-cell"><span class="pp-num">47</span><span class="pp-eyebrow">Projets réalisés</span></div>
      <div class="pp-kpi-a-cell"><span class="pp-num">3</span><span class="pp-eyebrow">Pays d'intervention</span></div>
      <div class="pp-kpi-a-cell"><span class="pp-num">6</span><span class="pp-eyebrow">Domaines d'expertise</span></div>
    </div></section>
```

### PP-03/B — Cartouches

*Cartes individuelles avec note de contexte — plus de place pour qualifier chaque chiffre.*

```html
    <section class="pp-kpi-b"><div class="pp">
      <div class="pp-kpi-b-card"><span class="pp-eyebrow">Création</span>
        <span class="pp-num">2014</span><small>Abidjan, Côte d'Ivoire</small></div>
      <div class="pp-kpi-b-card"><span class="pp-eyebrow">Équipe</span>
        <span class="pp-num">18</span><small>architectes et techniciens</small></div>
      <div class="pp-kpi-b-card"><span class="pp-eyebrow">Projets</span>
        <span class="pp-num">47</span><small>livrés depuis la création</small></div>
      <div class="pp-kpi-b-card"><span class="pp-eyebrow">Pays</span>
        <span class="pp-num">3</span><small>Côte d'Ivoire, Ghana, Sénégal</small></div>
      <div class="pp-kpi-b-card"><span class="pp-eyebrow">Domaines</span>
        <span class="pp-num">6</span><small>du logement au tertiaire</small></div>
    </div></section>
```

### PP-03/C — Phrase augmentée

*Les chiffres portés par une phrase — ton éditorial, pour les pages qui privilégient le récit.*

```html
    <section class="pp-kpi-c"><div class="pp">
      <p>Depuis <span class="pp-kpi-c-n">2014</span>, une équipe de
         <span class="pp-kpi-c-n">18</span> collaborateurs a livré
         <span class="pp-kpi-c-n">47</span> projets dans
         <span class="pp-kpi-c-n">3</span> pays, sur
         <span class="pp-kpi-c-n">6</span> domaines d'expertise.</p>
    </div></section>
```

---

## Section 04 — Domaines d'expertise

Compétences sélectionnées par l'entreprise ; utilisées par KAI pour les recommandations et le rapprochement d'appels d'offres.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-04 — DOMAINES D'EXPERTISE · compétences sélectionnées par l'entreprise ══ */

/* ── PP-04/A — « Nomenclature » : tableau domaine / périmètre ── */
.pp-dom-a{padding:56px 0}
.pp-dom-a .pp-eyebrow{display:block;margin-bottom:20px}
.pp-dom-a table{width:100%;border-collapse:collapse;border-top:1px solid var(--ink)}
.pp-dom-a th,.pp-dom-a td{text-align:left;padding:15px 18px 15px 0;
  border-bottom:1px solid var(--line);vertical-align:top;font-size:14.5px}
.pp-dom-a th{width:260px;font-weight:650}
.pp-dom-a td{color:var(--ink-2)}
@media(max-width:640px){.pp-dom-a th{width:40%}}

/* ── PP-04/B — « Mosaïque » : chips outline ── */
.pp-dom-b{padding:56px 0;background:var(--surface)}
.pp-dom-b .pp-eyebrow{display:block;margin-bottom:20px}
.pp-dom-b .pp-dom-b-wrap{display:flex;flex-wrap:wrap;gap:10px}
.pp-dom-b .pp-dom-b-chip{border:1px solid var(--ink);background:var(--paper);
  padding:11px 18px;font-size:14px;font-weight:500}
.pp-dom-b .pp-dom-b-chip:hover{background:var(--ink);color:#fff}

/* ── PP-04/C — « Répartition » : barres proportionnelles par domaine ── */
.pp-dom-c{padding:56px 0}
.pp-dom-c .pp-eyebrow{display:block;margin-bottom:6px}
.pp-dom-c .pp-dom-c-note{font-size:13px;color:var(--ink-3);margin-bottom:22px}
.pp-dom-c .pp-dom-c-row{display:grid;grid-template-columns:230px 1fr 44px;gap:16px;
  align-items:center;padding:11px 0;border-bottom:1px solid var(--line)}
.pp-dom-c .pp-dom-c-row b{font-size:14px;font-weight:600}
.pp-dom-c .pp-dom-c-bar{height:8px;background:var(--surface-2)}
.pp-dom-c .pp-dom-c-bar i{display:block;height:100%;background:var(--ink)}
.pp-dom-c .pp-num{font-size:13px;color:var(--ink-3);text-align:right}
@media(max-width:640px){.pp-dom-c .pp-dom-c-row{grid-template-columns:1fr 44px}
  .pp-dom-c .pp-dom-c-bar{grid-column:1/-1}}
```

### PP-04/A — Nomenclature

*Tableau domaine / périmètre d'intervention — précis, lisible, proche du bordereau technique.*

```html
    <section class="pp-dom-a"><div class="pp">
      <span class="pp-eyebrow">Domaines d'expertise</span>
      <table>
        <tr><th scope="row">Logements individuels</th><td>Conception, extension, permis de construire, suivi de chantier.</td></tr>
        <tr><th scope="row">Immeubles résidentiels</th><td>Programmation, conception, coordination des études techniques.</td></tr>
        <tr><th scope="row">Bâtiments tertiaires</th><td>Sièges d'entreprise, plateaux de bureaux, aménagements.</td></tr>
        <tr><th scope="row">Rénovation</th><td>Rénovation lourde, mise aux normes, réhabilitation.</td></tr>
        <tr><th scope="row">Extension</th><td>Surélévations et extensions en site occupé.</td></tr>
        <tr><th scope="row">Aménagement intérieur</th><td>Conception des espaces intérieurs en lien avec l'architecte d'intérieur.</td></tr>
      </table>
    </div></section>
```

### PP-04/B — Mosaïque

*Chips outline compactes — balayage rapide, adaptée aux listes longues de compétences.*

```html
    <section class="pp-dom-b"><div class="pp">
      <span class="pp-eyebrow">Domaines d'expertise</span>
      <div class="pp-dom-b-wrap">
        <span class="pp-dom-b-chip">Logements individuels</span>
        <span class="pp-dom-b-chip">Immeubles résidentiels</span>
        <span class="pp-dom-b-chip">Bâtiments tertiaires</span>
        <span class="pp-dom-b-chip">Bâtiments industriels</span>
        <span class="pp-dom-b-chip">Rénovation</span>
        <span class="pp-dom-b-chip">Extension</span>
        <span class="pp-dom-b-chip">Aménagement intérieur</span>
      </div>
    </div></section>
```

### PP-04/C — Répartition

*Barres proportionnelles au nombre de projets par domaine — la donnée réelle devient la hiérarchie visuelle.*

```html
    <section class="pp-dom-c"><div class="pp">
      <span class="pp-eyebrow">Domaines d'expertise</span>
      <p class="pp-dom-c-note">Répartition des 47 projets réalisés.</p>
      <div class="pp-dom-c-row"><b>Logements individuels</b><span class="pp-dom-c-bar"><i style="width:30%"></i></span><span class="pp-num">14</span></div>
      <div class="pp-dom-c-row"><b>Immeubles résidentiels</b><span class="pp-dom-c-bar"><i style="width:23%"></i></span><span class="pp-num">11</span></div>
      <div class="pp-dom-c-row"><b>Bâtiments tertiaires</b><span class="pp-dom-c-bar"><i style="width:19%"></i></span><span class="pp-num">9</span></div>
      <div class="pp-dom-c-row"><b>Rénovation</b><span class="pp-dom-c-bar"><i style="width:13%"></i></span><span class="pp-num">6</span></div>
      <div class="pp-dom-c-row"><b>Extension</b><span class="pp-dom-c-bar"><i style="width:9%"></i></span><span class="pp-num">4</span></div>
      <div class="pp-dom-c-row"><b>Aménagement intérieur</b><span class="pp-dom-c-bar"><i style="width:6%"></i></span><span class="pp-num">3</span></div>
    </div></section>
```

---

## Section 05 — Portfolio

Champs par réalisation : titre · description · localisation · photographies · année · mission réalisée. Filtrable ; alimentation automatique possible depuis les projets MEEREO avec accord de l'entreprise et du client.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-05 — PORTFOLIO · titre · description · localisation · photos · année · mission réalisée ══ */

/* ── PP-05/A — « Grille magazine » : cartes 3 colonnes, ratio 4:3 ── */
.pp-folio-a{padding:56px 0}
.pp-folio-a .pp-folio-a-head{display:flex;justify-content:space-between;
  align-items:baseline;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.pp-folio-a h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em}
.pp-folio-a .pp-folio-a-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pp-folio-a figure{margin:0}
.pp-folio-a .pp-ph{aspect-ratio:4/3;margin-bottom:12px}
.pp-folio-a figcaption b{display:block;font-size:15px;font-weight:650}
.pp-folio-a figcaption .pp-meta{display:block;margin-top:4px}
@media(max-width:860px){.pp-folio-a .pp-folio-a-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.pp-folio-a .pp-folio-a-grid{grid-template-columns:1fr}}

/* ── PP-05/B — « Planches » : rangées panoramiques + cartouche méta ── */
.pp-folio-b{padding:56px 0}
.pp-folio-b h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em;margin-bottom:24px}
.pp-folio-b .pp-folio-b-row{display:grid;grid-template-columns:1fr 280px;gap:26px;
  padding:26px 0;border-top:1px solid var(--ink)}
.pp-folio-b .pp-ph{aspect-ratio:21/9}
.pp-folio-b .pp-folio-b-meta b{display:block;font-size:18px;font-weight:650;
  letter-spacing:-.01em;margin-bottom:8px}
.pp-folio-b .pp-folio-b-meta p{font-size:14px;color:var(--ink-2);margin-bottom:14px}
.pp-folio-b .pp-folio-b-meta dl{font-size:12.5px}
.pp-folio-b .pp-folio-b-meta dt{font-family:var(--font-mono);font-size:10.5px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin-top:8px}
.pp-folio-b .pp-folio-b-meta dd{margin:2px 0 0;font-weight:500}
@media(max-width:760px){.pp-folio-b .pp-folio-b-row{grid-template-columns:1fr}}

/* ── PP-05/C — « Mur asymétrique » : une planche large, deux planches courtes ── */
.pp-folio-c{padding:56px 0;background:var(--surface)}
.pp-folio-c h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em;margin-bottom:24px}
.pp-folio-c .pp-folio-c-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.pp-folio-c figure{margin:0}
.pp-folio-c .pp-folio-c-wide{grid-column:1/-1}
.pp-folio-c .pp-folio-c-wide .pp-ph{aspect-ratio:21/9}
.pp-folio-c .pp-ph{aspect-ratio:4/3;background:var(--hatch);margin-bottom:10px}
.pp-folio-c figcaption{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.pp-folio-c figcaption b{font-size:14.5px;font-weight:650}
@media(max-width:560px){.pp-folio-c .pp-folio-c-grid{grid-template-columns:1fr}}
```

### PP-05/A — Grille magazine

*Trois colonnes, ratio 4:3 — densité maximale, balayage visuel rapide de nombreuses réalisations.*

```html
    <section class="pp-folio-a"><div class="pp">
      <div class="pp-folio-a-head">
        <h2>Réalisations</h2><span class="pp-meta">47 PROJETS · 2014–2025</span>
      </div>
      <div class="pp-folio-a-grid">
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Villa Palmeraie</b>
          <span class="pp-meta">ASSINIE · 2025 · CONCEPTION ARCHITECTURALE</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Résidence Ivoire</b>
          <span class="pp-meta">COCODY · 2024 · CONCEPTION ARCHITECTURALE</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Immeuble Lagune</b>
          <span class="pp-meta">PLATEAU · 2023 · CONCEPTION ARCHITECTURALE</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Siège Horizon</b>
          <span class="pp-meta">MARCORY · 2022 · CONCEPTION + SUIVI</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Résidence Cocotiers</b>
          <span class="pp-meta">RIVIERA · 2021 · CONCEPTION ARCHITECTURALE</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Ateliers Béton</b>
          <span class="pp-meta">YOPOUGON · 2020 · RÉNOVATION</span></figcaption></figure>
      </div>
    </div></section>
```

### PP-05/B — Planches

*Rangées panoramiques 21:9 avec cartouche descriptif — met chaque projet en scène, format planche d'architecture.*

```html
    <section class="pp-folio-b"><div class="pp">
      <h2>Réalisations</h2>
      <div class="pp-folio-b-row">
        <div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
        <div class="pp-folio-b-meta">
          <b>Résidence Ivoire</b>
          <p>Trente-deux logements traversants organisés autour d'un cœur d'îlot planté,
             ventilation naturelle sur toutes les façades.</p>
          <dl>
            <dt>Localisation</dt><dd>Cocody, Abidjan</dd>
            <dt>Année</dt><dd class="pp-num">2024</dd>
            <dt>Mission réalisée</dt><dd>Conception architecturale</dd>
          </dl>
        </div>
      </div>
      <div class="pp-folio-b-row">
        <div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
        <div class="pp-folio-b-meta">
          <b>Siège Horizon</b>
          <p>Siège d'entreprise de 4 200 m² : double peau brise-soleil,
             plateaux libres et patio central.</p>
          <dl>
            <dt>Localisation</dt><dd>Marcory, Abidjan</dd>
            <dt>Année</dt><dd class="pp-num">2022</dd>
            <dt>Mission réalisée</dt><dd>Conception et suivi de chantier</dd>
          </dl>
        </div>
      </div>
    </div></section>
```

### PP-05/C — Mur asymétrique

*Une planche large + deux planches courtes — hiérarchise un projet phare sans multiplier les niveaux.*

```html
    <section class="pp-folio-c"><div class="pp">
      <h2>Réalisations</h2>
      <div class="pp-folio-c-grid">
        <figure class="pp-folio-c-wide">
          <div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Villa Palmeraie</b><span class="pp-meta">ASSINIE · 2025</span></figcaption>
        </figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Résidence Ivoire</b><span class="pp-meta">COCODY · 2024</span></figcaption></figure>
        <figure><div class="pp-ph" role="img" aria-label="Photographie du projet"></div>
          <figcaption><b>Immeuble Lagune</b><span class="pp-meta">PLATEAU · 2023</span></figcaption></figure>
      </div>
    </div></section>
```

---

## Section 06 — Équipe

Champs par membre : photo · nom · fonction · courte biographie · spécialités. Affichage facultatif, au choix de l'entreprise.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-06 — ÉQUIPE · photo · nom · fonction · courte biographie · spécialités — section facultative ══ */

/* ── PP-06/A — « Portraits » : galerie 3:4 ── */
.pp-team-a{padding:56px 0}
.pp-team-a h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em;margin-bottom:24px}
.pp-team-a .pp-team-a-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.pp-team-a figure{margin:0}
.pp-team-a .pp-ph{aspect-ratio:3/4;margin-bottom:12px}
.pp-team-a b{display:block;font-size:15px;font-weight:650}
.pp-team-a .pp-team-a-role{display:block;font-size:13px;color:var(--ink-2);margin-top:2px}
.pp-team-a .pp-meta{display:block;margin-top:6px;font-size:11px}
@media(max-width:860px){.pp-team-a .pp-team-a-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.pp-team-a .pp-team-a-grid{grid-template-columns:1fr}}

/* ── PP-06/B — « Annuaire » : liste en rangées ── */
.pp-team-b{padding:56px 0}
.pp-team-b h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em;margin-bottom:18px}
.pp-team-b .pp-team-b-row{display:grid;grid-template-columns:56px 1.1fr 1.6fr .9fr;gap:18px;
  align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}
.pp-team-b .pp-team-b-row:first-of-type{border-top:1px solid var(--ink)}
.pp-team-b .pp-team-b-ava{width:44px;height:44px;border-radius:50%;background:var(--hatch);
  border:1px solid var(--line)}
.pp-team-b b{font-size:14.5px;font-weight:650;display:block}
.pp-team-b .pp-team-b-role{font-size:12.5px;color:var(--ink-3)}
.pp-team-b .pp-team-b-bio{font-size:13.5px;color:var(--ink-2)}
.pp-team-b .pp-meta{text-align:right}
@media(max-width:760px){.pp-team-b .pp-team-b-row{grid-template-columns:56px 1fr}
  .pp-team-b .pp-team-b-bio,.pp-team-b .pp-meta{grid-column:2;text-align:left}}

/* ── PP-06/C — « Direction + équipe » : deux grands portraits, grille compacte ── */
.pp-team-c{padding:56px 0;background:var(--surface)}
.pp-team-c h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em;margin-bottom:24px}
.pp-team-c .pp-team-c-lead{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-bottom:30px}
.pp-team-c .pp-team-c-lead figure{margin:0;display:grid;grid-template-columns:150px 1fr;
  gap:18px;background:var(--paper);border:1px solid var(--line-2);padding:18px}
.pp-team-c .pp-team-c-lead .pp-ph{aspect-ratio:3/4}
.pp-team-c .pp-team-c-lead b{font-size:16px;font-weight:650;display:block}
.pp-team-c .pp-team-c-lead .pp-team-c-role{font-size:13px;color:var(--ink-3);display:block;margin:2px 0 8px}
.pp-team-c .pp-team-c-lead p{font-size:13.5px;color:var(--ink-2)}
.pp-team-c .pp-team-c-rest{display:flex;flex-wrap:wrap;gap:8px 26px;border-top:1px solid var(--line-2);padding-top:16px}
.pp-team-c .pp-team-c-rest span{font-size:13.5px}
.pp-team-c .pp-team-c-rest span i{font-style:normal;color:var(--ink-3);font-size:12.5px}
@media(max-width:760px){.pp-team-c .pp-team-c-lead{grid-template-columns:1fr}}
```

### PP-06/A — Portraits

*Galerie de portraits 3:4 — humanise la page, adaptée aux équipes que l'on veut montrer.*

```html
    <section class="pp-team-a"><div class="pp">
      <h2>L'équipe</h2>
      <div class="pp-team-a-grid">
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <b>Aïcha Koné</b><span class="pp-team-a-role">Architecte associée</span>
          <span class="pp-meta">LOGEMENT COLLECTIF · CLIMAT</span></figure>
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <b>Yao N'Guessan</b><span class="pp-team-a-role">Directeur de projets</span>
          <span class="pp-meta">COORDINATION · EXÉCUTION</span></figure>
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <b>Mariam Diabaté</b><span class="pp-team-a-role">Architecte d'intérieur</span>
          <span class="pp-meta">AMÉNAGEMENT · MOBILIER</span></figure>
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <b>Serge Kouamé</b><span class="pp-team-a-role">Économiste de la construction</span>
          <span class="pp-meta">CHIFFRAGE · MARCHÉS</span></figure>
      </div>
    </div></section>
```

### PP-06/B — Annuaire

*Liste en rangées avec biographie d'une ligne — compacte, adaptée aux équipes nombreuses.*

```html
    <section class="pp-team-b"><div class="pp">
      <h2>L'équipe</h2>
      <div class="pp-team-b-row"><span class="pp-team-b-ava" aria-hidden="true"></span>
        <div><b>Aïcha Koné</b><span class="pp-team-b-role">Architecte associée</span></div>
        <span class="pp-team-b-bio">Quinze ans de pratique du logement collectif en climat tropical humide.</span>
        <span class="pp-meta">LOGEMENT · CLIMAT</span></div>
      <div class="pp-team-b-row"><span class="pp-team-b-ava" aria-hidden="true"></span>
        <div><b>Yao N'Guessan</b><span class="pp-team-b-role">Directeur de projets</span></div>
        <span class="pp-team-b-bio">Pilote la coordination des études et le suivi d'exécution des opérations.</span>
        <span class="pp-meta">COORDINATION</span></div>
      <div class="pp-team-b-row"><span class="pp-team-b-ava" aria-hidden="true"></span>
        <div><b>Mariam Diabaté</b><span class="pp-team-b-role">Architecte d'intérieur</span></div>
        <span class="pp-team-b-bio">Conçoit les aménagements intérieurs des programmes résidentiels et tertiaires.</span>
        <span class="pp-meta">AMÉNAGEMENT</span></div>
      <div class="pp-team-b-row"><span class="pp-team-b-ava" aria-hidden="true"></span>
        <div><b>Serge Kouamé</b><span class="pp-team-b-role">Économiste de la construction</span></div>
        <span class="pp-team-b-bio">Chiffrage des ouvrages et préparation des dossiers de consultation.</span>
        <span class="pp-meta">CHIFFRAGE</span></div>
    </div></section>
```

### PP-06/C — Direction + équipe

*Deux fondateurs développés, le reste de l'équipe en ligne simple — hiérarchie claire sans page interminable.*

```html
    <section class="pp-team-c"><div class="pp">
      <h2>L'équipe</h2>
      <div class="pp-team-c-lead">
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <div><b>Aïcha Koné</b><span class="pp-team-c-role">Architecte associée · cofondatrice</span>
          <p>Diplômée de l'EAMAU, elle dirige la conception et porte l'approche
             climatique de l'agence.</p></div></figure>
        <figure><div class="pp-ph" role="img" aria-label="Portrait"></div>
          <div><b>Yao N'Guessan</b><span class="pp-team-c-role">Directeur de projets · cofondateur</span>
          <p>Responsable de la coordination technique et du suivi d'exécution
             sur l'ensemble des opérations.</p></div></figure>
      </div>
      <div class="pp-team-c-rest">
        <span>Mariam Diabaté <i>— Architecte d'intérieur</i></span>
        <span>Serge Kouamé <i>— Économiste de la construction</i></span>
        <span>Fatou Bamba <i>— Architecte</i></span>
        <span>Jean-Luc Aka <i>— Dessinateur-projeteur</i></span>
      </div>
    </div></section>
```

---

## Section 07 — Certifications

Champs : certifications · agréments · qualifications. Les documents justificatifs restent privés sauf décision contraire de l'entreprise.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-07 — CERTIFICATIONS · certifications · agréments · qualifications — justificatifs privés ══ */

/* ── PP-07/A — « Registre » : tableau intitulé / organisme / année ── */
.pp-cert-a{padding:56px 0}
.pp-cert-a .pp-eyebrow{display:block;margin-bottom:20px}
.pp-cert-a table{width:100%;border-collapse:collapse;border-top:1px solid var(--ink)}
.pp-cert-a th,.pp-cert-a td{text-align:left;padding:14px 18px 14px 0;
  border-bottom:1px solid var(--line);font-size:14.5px}
.pp-cert-a th{font-weight:650}
.pp-cert-a td{color:var(--ink-2)}
.pp-cert-a td:last-child{text-align:right}

/* ── PP-07/B — « Sceaux » : cartes carrées outline ── */
.pp-cert-b{padding:56px 0;background:var(--surface)}
.pp-cert-b .pp-eyebrow{display:block;margin-bottom:20px}
.pp-cert-b .pp-cert-b-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pp-cert-b .pp-cert-b-card{background:var(--paper);border:1px solid var(--ink);
  padding:22px;display:flex;flex-direction:column;gap:10px;min-height:150px}
.pp-cert-b .pp-cert-b-mark{width:38px;height:38px;border:1px solid var(--ink);
  display:grid;place-items:center;font-family:var(--font-mono);font-size:13px;font-weight:600}
.pp-cert-b b{font-size:14.5px;font-weight:650;line-height:1.3}
.pp-cert-b .pp-meta{margin-top:auto}
@media(max-width:760px){.pp-cert-b .pp-cert-b-grid{grid-template-columns:1fr}}

/* ── PP-07/C — « Ligne » : bandeau discret d'items ── */
.pp-cert-c{border-top:1px solid var(--line-2);border-bottom:1px solid var(--line-2);padding:20px 0}
.pp-cert-c .pp{display:flex;align-items:center;gap:0;flex-wrap:wrap}
.pp-cert-c .pp-eyebrow{padding-right:26px}
.pp-cert-c .pp-cert-c-item{font-size:13px;font-weight:500;padding:4px 26px;
  border-left:1px solid var(--line-2)}
.pp-cert-c .pp-cert-c-item .pp-num{color:var(--ink-3);font-size:12px;margin-left:6px}
```

### PP-07/A — Registre

*Tableau intitulé / organisme / année — le format le plus vérifiable, proche du registre officiel.*

```html
    <section class="pp-cert-a"><div class="pp">
      <span class="pp-eyebrow">Certifications · agréments · qualifications</span>
      <table>
        <tr><th scope="row">Inscription à l'Ordre des Architectes</th>
            <td>Ordre des Architectes de Côte d'Ivoire</td><td class="pp-num">2014</td></tr>
        <tr><th scope="row">Agrément technique</th>
            <td>Ministère de la Construction, du Logement et de l'Urbanisme</td><td class="pp-num">2016</td></tr>
        <tr><th scope="row">Certification ISO 9001:2015</th>
            <td>Organisme certificateur accrédité</td><td class="pp-num">2022</td></tr>
      </table>
    </div></section>
```

### PP-07/B — Sceaux

*Cartes carrées à monogramme — donne un poids visuel aux qualifications, adaptée aux listes courtes.*

```html
    <section class="pp-cert-b"><div class="pp">
      <span class="pp-eyebrow">Certifications · agréments · qualifications</span>
      <div class="pp-cert-b-grid">
        <div class="pp-cert-b-card"><span class="pp-cert-b-mark" aria-hidden="true">OA</span>
          <b>Inscription à l'Ordre des Architectes de Côte d'Ivoire</b>
          <span class="pp-meta">DEPUIS 2014</span></div>
        <div class="pp-cert-b-card"><span class="pp-cert-b-mark" aria-hidden="true">AG</span>
          <b>Agrément technique du Ministère de la Construction</b>
          <span class="pp-meta">DEPUIS 2016</span></div>
        <div class="pp-cert-b-card"><span class="pp-cert-b-mark" aria-hidden="true">ISO</span>
          <b>Certification ISO 9001:2015 — management de la qualité</b>
          <span class="pp-meta">DEPUIS 2022</span></div>
      </div>
    </div></section>
```

### PP-07/C — Ligne

*Bandeau horizontal discret — signale les qualifications sans occuper une section entière ; s'insère sous un hero ou en pied de portfolio.*

```html
    <section class="pp-cert-c"><div class="pp">
      <span class="pp-eyebrow">Qualifications</span>
      <span class="pp-cert-c-item">Ordre des Architectes de Côte d'Ivoire<span class="pp-num">2014</span></span>
      <span class="pp-cert-c-item">Agrément technique MCLU<span class="pp-num">2016</span></span>
      <span class="pp-cert-c-item">ISO 9001:2015<span class="pp-num">2022</span></span>
    </div></section>
```

---

## Section 08 — Références

Références provenant de projets réalisés sur MEEREO ou en dehors de la plateforme ; l'origine peut être signalée.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-08 — RÉFÉRENCES · projets réalisés sur MEEREO ou en dehors de la plateforme ══ */

/* ── PP-08/A — « Étude de cas » : une référence développée + liste des autres ── */
.pp-ref-a{padding:56px 0}
.pp-ref-a .pp-eyebrow{display:block;margin-bottom:20px}
.pp-ref-a .pp-ref-a-case{display:grid;grid-template-columns:1.4fr 1fr;gap:30px;
  border-top:1px solid var(--ink);padding-top:26px;margin-bottom:26px}
.pp-ref-a .pp-ph{aspect-ratio:16/10}
.pp-ref-a .pp-ref-a-case b{display:block;font-size:20px;font-weight:650;letter-spacing:-.01em}
.pp-ref-a .pp-ref-a-case .pp-meta{display:block;margin:6px 0 12px}
.pp-ref-a .pp-ref-a-case p{font-size:14.5px;color:var(--ink-2)}
.pp-ref-a .pp-ref-a-list li{list-style:none;display:flex;justify-content:space-between;
  gap:14px;padding:12px 0;border-bottom:1px solid var(--line);font-size:14px}
.pp-ref-a .pp-ref-a-list b{font-weight:600}
@media(max-width:760px){.pp-ref-a .pp-ref-a-case{grid-template-columns:1fr}}

/* ── PP-08/B — « Table » : projet / lieu / année / mission ── */
.pp-ref-b{padding:56px 0}
.pp-ref-b .pp-eyebrow{display:block;margin-bottom:20px}
.pp-ref-b table{width:100%;border-collapse:collapse;border-top:1px solid var(--ink)}
.pp-ref-b th{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink-3);text-align:left;font-weight:500;
  padding:12px 18px 12px 0;border-bottom:1px solid var(--line-2)}
.pp-ref-b td{padding:14px 18px 14px 0;border-bottom:1px solid var(--line);font-size:14.5px}
.pp-ref-b td:first-child{font-weight:650}
.pp-ref-b td:nth-child(2),.pp-ref-b td:nth-child(4){color:var(--ink-2)}
.pp-ref-b .pp-num{font-size:13px}

/* ── PP-08/C — « Cartes contexte » : projet + phrase + origine ── */
.pp-ref-c{padding:56px 0;background:var(--surface)}
.pp-ref-c .pp-eyebrow{display:block;margin-bottom:20px}
.pp-ref-c .pp-ref-c-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pp-ref-c .pp-ref-c-card{background:var(--paper);border:1px solid var(--line-2);
  padding:20px;display:flex;flex-direction:column;gap:10px;min-height:170px}
.pp-ref-c b{font-size:15.5px;font-weight:650}
.pp-ref-c p{font-size:13.5px;color:var(--ink-2)}
.pp-ref-c .pp-ref-c-src{margin-top:auto;display:flex;justify-content:space-between;
  align-items:center;gap:10px}
.pp-ref-c .pp-ref-c-mee{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;
  text-transform:uppercase;border:1px solid var(--ink);padding:3px 8px}
@media(max-width:860px){.pp-ref-c .pp-ref-c-grid{grid-template-columns:1fr}}
```

### PP-08/A — Étude de cas

*Une référence développée en récit + les autres en liste — met un projet phare en avant sans perdre l'inventaire.*

```html
    <section class="pp-ref-a"><div class="pp">
      <span class="pp-eyebrow">Références</span>
      <div class="pp-ref-a-case">
        <div class="pp-ph" role="img" aria-label="Photographie de la référence"></div>
        <div>
          <b>Résidence Ivoire</b>
          <span class="pp-meta">COCODY · 2024 · CONCEPTION ARCHITECTURALE · PROJET MEEREO</span>
          <p>Trente-deux logements livrés dans les délais, coordination complète des
             études structure et fluides, validation client à chaque jalon documentée
             sur la plateforme.</p>
        </div>
      </div>
      <ul class="pp-ref-a-list">
        <li><b>Siège Horizon</b><span class="pp-meta">MARCORY · 2022 · CONCEPTION + SUIVI</span></li>
        <li><b>Immeuble Lagune</b><span class="pp-meta">PLATEAU · 2023 · CONCEPTION</span></li>
        <li><b>Villa Palmeraie</b><span class="pp-meta">ASSINIE · 2025 · CONCEPTION</span></li>
      </ul>
    </div></section>
```

### PP-08/B — Table

*Tableau projet / lieu / année / mission — inventaire exhaustif et comparable, format bordereau.*

```html
    <section class="pp-ref-b"><div class="pp">
      <span class="pp-eyebrow">Références</span>
      <table>
        <tr><th>Projet</th><th>Lieu</th><th>Année</th><th>Mission réalisée</th></tr>
        <tr><td>Villa Palmeraie</td><td>Assinie</td><td class="pp-num">2025</td><td>Conception architecturale</td></tr>
        <tr><td>Résidence Ivoire</td><td>Cocody, Abidjan</td><td class="pp-num">2024</td><td>Conception architecturale</td></tr>
        <tr><td>Immeuble Lagune</td><td>Plateau, Abidjan</td><td class="pp-num">2023</td><td>Conception architecturale</td></tr>
        <tr><td>Siège Horizon</td><td>Marcory, Abidjan</td><td class="pp-num">2022</td><td>Conception et suivi de chantier</td></tr>
        <tr><td>Résidence Cocotiers</td><td>Riviera, Abidjan</td><td class="pp-num">2021</td><td>Conception architecturale</td></tr>
      </table>
    </div></section>
```

### PP-08/C — Cartes contexte

*Cartes avec phrase de contexte et origine signalée — distingue les projets tracés sur MEEREO des références externes.*

```html
    <section class="pp-ref-c"><div class="pp">
      <span class="pp-eyebrow">Références</span>
      <div class="pp-ref-c-grid">
        <div class="pp-ref-c-card"><b>Résidence Ivoire</b>
          <p>32 logements traversants, livrés en 14 mois, validations tracées à chaque jalon.</p>
          <div class="pp-ref-c-src"><span class="pp-meta">COCODY · 2024</span>
            <span class="pp-ref-c-mee">Projet MEEREO</span></div></div>
        <div class="pp-ref-c-card"><b>Siège Horizon</b>
          <p>4 200 m² de bureaux, double peau brise-soleil, suivi de chantier complet.</p>
          <div class="pp-ref-c-src"><span class="pp-meta">MARCORY · 2022</span>
            <span class="pp-ref-c-mee">Projet MEEREO</span></div></div>
        <div class="pp-ref-c-card"><b>Ateliers Béton</b>
          <p>Rénovation lourde d'un ensemble industriel en ateliers d'artisans.</p>
          <div class="pp-ref-c-src"><span class="pp-meta">YOPOUGON · 2020</span>
            <span class="pp-meta">HORS PLATEFORME</span></div></div>
      </div>
    </div></section>
```

---

## Section 09 — Avis et satisfaction

Retours d'expérience contextualisés et vérifiables, publiés après validation des règles MEEREO — le Tome 14.5 exclut le simple système de notation : aucune étoile, uniquement des retours rattachés à un projet.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-09 — AVIS ET SATISFACTION · retours contextualisés et vérifiables,
   publiés après validation des règles MEEREO — pas de système de notation (Tome 14.5) ══ */

/* ── PP-09/A — « Témoignage » : une citation développée + contexte vérifiable ── */
.pp-avis-a{padding:64px 0}
.pp-avis-a .pp-eyebrow{display:block;margin-bottom:22px}
.pp-avis-a blockquote{margin:0;font-size:clamp(19px,2.8vw,26px);font-weight:400;
  letter-spacing:-.012em;line-height:1.45;max-width:42ch;color:var(--ink)}
.pp-avis-a blockquote::before{content:"« "}
.pp-avis-a blockquote::after{content:" »"}
.pp-avis-a footer{margin-top:22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.pp-avis-a footer b{font-size:14px;font-weight:650}
.pp-avis-a footer .pp-meta{font-size:11.5px}

/* ── PP-09/B — « Journal » : retours chronologiques rattachés aux projets ── */
.pp-avis-b{padding:56px 0}
.pp-avis-b .pp-eyebrow{display:block;margin-bottom:18px}
.pp-avis-b .pp-avis-b-row{display:grid;grid-template-columns:120px 1fr;gap:22px;
  padding:18px 0;border-bottom:1px solid var(--line)}
.pp-avis-b .pp-avis-b-row:first-of-type{border-top:1px solid var(--ink)}
.pp-avis-b .pp-avis-b-date{font-family:var(--font-mono);font-size:12px;color:var(--ink-3)}
.pp-avis-b p{font-size:14.5px;color:var(--ink-2)}
.pp-avis-b .pp-avis-b-src{margin-top:8px;font-size:12.5px}
.pp-avis-b .pp-avis-b-src b{font-weight:650}
@media(max-width:640px){.pp-avis-b .pp-avis-b-row{grid-template-columns:1fr;gap:6px}}

/* ── PP-09/C — « Retour structuré » : contexte / livré / retour ── */
.pp-avis-c{padding:56px 0;background:var(--surface)}
.pp-avis-c .pp-eyebrow{display:block;margin-bottom:20px}
.pp-avis-c .pp-avis-c-card{background:var(--paper);border:1px solid var(--line-2);
  display:grid;grid-template-columns:repeat(3,1fr)}
.pp-avis-c .pp-avis-c-cell{padding:22px;border-right:1px solid var(--line)}
.pp-avis-c .pp-avis-c-cell:last-child{border-right:0}
.pp-avis-c .pp-avis-c-cell h3{font-family:var(--font-mono);font-size:10.5px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);font-weight:500;margin-bottom:10px}
.pp-avis-c .pp-avis-c-cell p{font-size:13.5px;color:var(--ink-2)}
.pp-avis-c .pp-avis-c-foot{display:flex;justify-content:space-between;align-items:center;
  gap:12px;border-top:1px solid var(--line);padding:14px 22px;grid-column:1/-1;flex-wrap:wrap}
.pp-avis-c .pp-avis-c-foot b{font-size:13.5px;font-weight:650}
@media(max-width:760px){.pp-avis-c .pp-avis-c-card{grid-template-columns:1fr}
  .pp-avis-c .pp-avis-c-cell{border-right:0;border-bottom:1px solid var(--line)}}
```

### PP-09/A — Témoignage

*Une citation développée, rattachée à un projet vérifié — un seul retour, mais incontestable.*

```html
    <section class="pp-avis-a"><div class="pp">
      <span class="pp-eyebrow">Retour d'expérience</span>
      <blockquote>Chaque décision a été documentée et validée avant d'avancer :
        nous savions à tout moment où en était le projet et pourquoi.</blockquote>
      <footer>
        <b>K. Touré — maître d'ouvrage</b>
        <span class="pp-meta">RÉSIDENCE IVOIRE · LIVRÉE 2024</span>
        <span class="pp-badge">Retour vérifié — projet MEEREO</span>
      </footer>
    </div></section>
```

### PP-09/B — Journal

*Retours courts en chronologie, chacun rattaché à son projet — montre la régularité de la satisfaction dans le temps.*

```html
    <section class="pp-avis-b"><div class="pp">
      <span class="pp-eyebrow">Retours d'expérience</span>
      <div class="pp-avis-b-row"><span class="pp-avis-b-date">JANV. 2025</span>
        <div><p>« Livraison dans les délais annoncés, réserves levées en trois semaines. »</p>
        <div class="pp-avis-b-src"><b>K. Touré</b> · Résidence Ivoire · retour vérifié MEEREO</div></div></div>
      <div class="pp-avis-b-row"><span class="pp-avis-b-date">SEPT. 2023</span>
        <div><p>« La coordination des bureaux d'études a été prise en main de bout en bout. »</p>
        <div class="pp-avis-b-src"><b>Société Horizon</b> · Siège Horizon · retour vérifié MEEREO</div></div></div>
      <div class="pp-avis-b-row"><span class="pp-avis-b-date">MARS 2023</span>
        <div><p>« Des choix de matériaux adaptés au climat, un budget tenu. »</p>
        <div class="pp-avis-b-src"><b>A. Kouassi</b> · Immeuble Lagune · retour vérifié MEEREO</div></div></div>
    </div></section>
```

### PP-09/C — Retour structuré

*Trois rubriques factuelles — contexte, livrables, retour — le format le plus vérifiable, fidèle à l'esprit du Tome 14.5.*

```html
    <section class="pp-avis-c"><div class="pp">
      <span class="pp-eyebrow">Retour d'expérience structuré</span>
      <div class="pp-avis-c-card">
        <div class="pp-avis-c-cell"><h3>Contexte</h3>
          <p>Résidence de 32 logements à Cocody, mission de conception architecturale
             confiée en 2022 via un appel d'offres MEEREO.</p></div>
        <div class="pp-avis-c-cell"><h3>Ce qui a été livré</h3>
          <p>Esquisses, permis de construire, dossiers de consultation, coordination
             des études, assistance à la réception.</p></div>
        <div class="pp-avis-c-cell"><h3>Le retour du client</h3>
          <p>« Un déroulé sans surprise : chaque jalon validé, chaque document
             au bon endroit, une équipe qui répond. »</p></div>
        <div class="pp-avis-c-foot">
          <b>K. Touré — maître d'ouvrage · Résidence Ivoire, livrée 2024</b>
          <span class="pp-badge">Retour vérifié — projet MEEREO</span>
        </div>
      </div>
    </div></section>
```

---

## Section 10 — Coordonnées

Champs : téléphone · e-mail professionnel · site Internet · réseaux sociaux · adresse. Chaque information peut être rendue privée selon les préférences de l'entreprise.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-10 — COORDONNÉES · téléphone · e-mail · site · réseaux · adresse — champs masquables ══ */

/* ── PP-10/A — « Bloc carte » : coordonnées + plan de situation ── */
.pp-coord-a{padding:56px 0}
.pp-coord-a .pp-coord-a-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:30px}
.pp-coord-a .pp-eyebrow{display:block;margin-bottom:18px}
.pp-coord-a dl{font-size:14.5px}
.pp-coord-a dt{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink-3);margin-top:14px}
.pp-coord-a dd{margin:3px 0 0;font-weight:500}
.pp-coord-a .pp-ph{aspect-ratio:16/10;position:relative}
.pp-coord-a .pp-coord-a-pin{position:absolute;top:50%;left:50%;width:12px;height:12px;
  background:var(--ink);border-radius:50%;transform:translate(-50%,-50%);
  box-shadow:0 0 0 5px rgba(10,10,10,.12)}
@media(max-width:760px){.pp-coord-a .pp-coord-a-grid{grid-template-columns:1fr}}

/* ── PP-10/B — « Fiche » : annuaire technique en rangées ── */
.pp-coord-b{padding:56px 0}
.pp-coord-b .pp-eyebrow{display:block;margin-bottom:18px}
.pp-coord-b .pp-coord-b-row{display:grid;grid-template-columns:180px 1fr;gap:18px;
  padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px}
.pp-coord-b .pp-coord-b-row:first-of-type{border-top:1px solid var(--ink)}
.pp-coord-b .pp-coord-b-lbl{font-family:var(--font-mono);font-size:11px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);padding-top:3px}
.pp-coord-b a{text-decoration:underline;text-underline-offset:3px;font-weight:500}
@media(max-width:560px){.pp-coord-b .pp-coord-b-row{grid-template-columns:1fr;gap:2px}}

/* ── PP-10/C — « Pied de page » : bandeau sombre de clôture ── */
.pp-coord-c{background:var(--ink);color:#fff;padding:52px 0}
.pp-coord-c .pp-coord-c-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:26px}
.pp-coord-c .pp-coord-c-name{font-size:19px;font-weight:650;letter-spacing:-.01em}
.pp-coord-c .pp-coord-c-cat{font-size:13px;color:var(--ink-4);margin-top:4px}
.pp-coord-c h3{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink-4);font-weight:500;margin-bottom:10px}
.pp-coord-c p,.pp-coord-c a{font-size:13.5px;color:#fff;text-decoration:none;line-height:1.7}
.pp-coord-c a:hover{text-decoration:underline;text-underline-offset:3px}
@media(max-width:760px){.pp-coord-c .pp-coord-c-grid{grid-template-columns:1fr;gap:20px}}
```

### PP-10/A — Bloc carte

*Coordonnées + plan de situation — utile quand l'agence reçoit dans ses locaux.*

```html
    <section class="pp-coord-a"><div class="pp">
      <div class="pp-coord-a-grid">
        <div>
          <span class="pp-eyebrow">Coordonnées</span>
          <dl>
            <dt>Adresse</dt><dd>Rue des Jardins, Cocody Danga<br>Abidjan, Côte d'Ivoire</dd>
            <dt>Téléphone</dt><dd class="pp-num">+225 27 22 00 00 00</dd>
            <dt>E-mail</dt><dd>contact@rawdesign.ci</dd>
            <dt>Sur MEEREO</dt><dd>meereo.com/pro/raw-design</dd>
          </dl>
        </div>
        <div class="pp-ph" role="img" aria-label="Plan de situation">
          <span class="pp-coord-a-pin" aria-hidden="true"></span>
        </div>
      </div>
    </div></section>
```

### PP-10/B — Fiche

*Annuaire technique en rangées libellé / valeur — sobre, chaque champ masquable individuellement.*

```html
    <section class="pp-coord-b"><div class="pp">
      <span class="pp-eyebrow">Coordonnées</span>
      <div class="pp-coord-b-row"><span class="pp-coord-b-lbl">Adresse</span>
        <span>Rue des Jardins, Cocody Danga — Abidjan, Côte d'Ivoire</span></div>
      <div class="pp-coord-b-row"><span class="pp-coord-b-lbl">Téléphone</span>
        <span class="pp-num">+225 27 22 00 00 00</span></div>
      <div class="pp-coord-b-row"><span class="pp-coord-b-lbl">E-mail</span>
        <a href="mailto:contact@rawdesign.ci">contact@rawdesign.ci</a></div>
      <div class="pp-coord-b-row"><span class="pp-coord-b-lbl">Site Internet</span>
        <a href="#site">rawdesign.ci</a></div>
      <div class="pp-coord-b-row"><span class="pp-coord-b-lbl">Réseaux</span>
        <span><a href="#in">LinkedIn</a> · <a href="#ig">Instagram</a></span></div>
    </div></section>
```

### PP-10/C — Pied de page

*Bandeau sombre en colonnes — clôture naturelle de la page ; la seule surface noire pleine de la bibliothèque avec PP-11/C.*

```html
    <section class="pp-coord-c"><div class="pp">
      <div class="pp-coord-c-grid">
        <div><div class="pp-coord-c-name">Raw Design</div>
          <div class="pp-coord-c-cat">Bureau d'architecture — Abidjan</div></div>
        <div><h3>Adresse</h3><p>Rue des Jardins, Cocody Danga<br>Abidjan, Côte d'Ivoire</p></div>
        <div><h3>Contact</h3><p><a href="tel:+2252722000000" class="pp-num">+225 27 22 00 00 00</a><br>
          <a href="mailto:contact@rawdesign.ci">contact@rawdesign.ci</a></p></div>
        <div><h3>En ligne</h3><p><a href="#site">rawdesign.ci</a><br>
          <a href="#meereo">meereo.com/pro/raw-design</a></p></div>
      </div>
    </div></section>
```

---

## Section 11 — Contact

Actions (Tome 14.5 §5) : envoyer un message · demander un rendez-vous · inviter dans un projet · enregistrer en favoris · partager. Le message ouvre une conversation « Prise de contact » dans le Communication Hub ; toutes les actions sont historisées.

**CSS de la section** (commun aux trois variantes) :

```css
/* ══ PP-11 — CONTACT · envoyer un message · demander un rendez-vous · inviter dans un projet
   · enregistrer en favoris · partager — chaque action est historisée (Tome 14.5 §5) ══ */

/* ── PP-11/A — « Panneau d'actions » : trois actions principales en cartes ── */
.pp-ctc-a{padding:56px 0}
.pp-ctc-a .pp-eyebrow{display:block;margin-bottom:20px}
.pp-ctc-a .pp-ctc-a-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pp-ctc-a .pp-ctc-a-card{border:1px solid var(--ink);padding:22px;display:flex;
  flex-direction:column;gap:8px;text-decoration:none;min-height:150px;
  transition:background .15s,color .15s}
.pp-ctc-a .pp-ctc-a-card:hover{background:var(--ink);color:#fff}
.pp-ctc-a .pp-ctc-a-card:hover .pp-meta{color:var(--ink-4)}
.pp-ctc-a .pp-ctc-a-card b{font-size:16px;font-weight:650}
.pp-ctc-a .pp-ctc-a-card p{font-size:13px;color:inherit;opacity:.72}
.pp-ctc-a .pp-ctc-a-card .pp-meta{margin-top:auto}
.pp-ctc-a .pp-ctc-a-more{margin-top:16px;display:flex;gap:22px;flex-wrap:wrap}
.pp-ctc-a .pp-ctc-a-more a{font-size:13.5px;text-decoration:underline;text-underline-offset:3px}
@media(max-width:760px){.pp-ctc-a .pp-ctc-a-grid{grid-template-columns:1fr}}

/* ── PP-11/B — « Message » : formulaire épuré ── */
.pp-ctc-b{padding:56px 0;background:var(--surface)}
.pp-ctc-b .pp-ctc-b-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:36px}
.pp-ctc-b h2{font-size:clamp(20px,2.6vw,26px);font-weight:650;letter-spacing:-.02em}
.pp-ctc-b .pp-ctc-b-note{font-size:13.5px;color:var(--ink-3);margin-top:12px;max-width:34ch}
.pp-ctc-b form{display:grid;gap:14px}
.pp-ctc-b label{display:grid;gap:6px;font-family:var(--font-mono);font-size:10.5px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.pp-ctc-b input,.pp-ctc-b textarea{border:1px solid var(--line-2);background:var(--paper);
  padding:13px 14px;font:400 14.5px/1.4 var(--font-ui);color:var(--ink);width:100%}
.pp-ctc-b input:focus,.pp-ctc-b textarea:focus{outline:2px solid var(--ink);outline-offset:0;border-color:var(--ink)}
.pp-ctc-b textarea{min-height:120px;resize:vertical}
.pp-ctc-b .pp-btn{justify-self:start}
.pp-ctc-b .pp-ctc-b-alt{display:flex;gap:22px;flex-wrap:wrap;margin-top:4px}
.pp-ctc-b .pp-ctc-b-alt a{font-size:13px;text-decoration:underline;text-underline-offset:3px}
@media(max-width:760px){.pp-ctc-b .pp-ctc-b-grid{grid-template-columns:1fr}}

/* ── PP-11/C — « Bande » : appel à l'action de clôture ── */
.pp-ctc-c{background:var(--ink);color:#fff;padding:60px 0}
.pp-ctc-c .pp{display:flex;align-items:center;justify-content:space-between;gap:26px;flex-wrap:wrap}
.pp-ctc-c p{font-size:clamp(19px,2.8vw,27px);font-weight:400;letter-spacing:-.015em;max-width:26ch}
.pp-ctc-c p b{font-weight:650}
.pp-ctc-c .pp-ctc-c-actions{display:flex;gap:10px;flex-wrap:wrap}
.pp-ctc-c .pp-btn{border-color:#fff;background:transparent;color:#fff}
.pp-ctc-c .pp-btn:hover{background:#fff;color:var(--ink)}
.pp-ctc-c .pp-btn--solid{background:#fff;color:var(--ink)}
.pp-ctc-c .pp-btn--solid:hover{background:var(--ink-4);color:var(--ink)}
```

### PP-11/A — Panneau d'actions

*Les trois actions principales en cartes, les secondaires en liens — chaque action garde son libellé exact du parcours MEEREO.*

```html
    <section class="pp-ctc-a"><div class="pp">
      <span class="pp-eyebrow">Travailler avec Raw Design</span>
      <div class="pp-ctc-a-grid">
        <a class="pp-ctc-a-card" href="#message"><b>Envoyer un message</b>
          <p>Ouvre une conversation privée avec l'agence dans le Communication Hub.</p>
          <span class="pp-meta">RÉPONSE SOUS 24 H OUVRÉES</span></a>
        <a class="pp-ctc-a-card" href="#rdv"><b>Demander un rendez-vous</b>
          <p>Proposez un créneau ; l'agence confirme depuis son Cockpit.</p>
          <span class="pp-meta">EN AGENCE OU À DISTANCE</span></a>
        <a class="pp-ctc-a-card" href="#inviter"><b>Inviter dans un projet</b>
          <p>Associez Raw Design à l'un de vos projets MEEREO existants.</p>
          <span class="pp-meta">INVITATION HISTORISÉE</span></a>
      </div>
      <div class="pp-ctc-a-more">
        <a href="#favoris">Enregistrer en favoris</a>
        <a href="#partager">Partager la page</a>
        <a href="#copier">Copier le lien</a>
      </div>
    </div></section>
```

### PP-11/B — Message

*Formulaire de premier contact épuré — trois champs, actions secondaires en retrait. Statique : le traitement relève de la plateforme.*

```html
    <section class="pp-ctc-b"><div class="pp">
      <div class="pp-ctc-b-grid">
        <div>
          <h2>Écrire à Raw Design</h2>
          <p class="pp-ctc-b-note">Votre message ouvre une conversation « Prise de contact »
             dans le Communication Hub. L'agence est notifiée immédiatement.</p>
        </div>
        <form action="#" method="post">
          <label>Votre nom<input type="text" name="nom" autocomplete="name"></label>
          <label>Votre e-mail<input type="email" name="email" autocomplete="email"></label>
          <label>Votre message<textarea name="message"></textarea></label>
          <button class="pp-btn pp-btn--solid" type="submit">Envoyer le message</button>
          <div class="pp-ctc-b-alt">
            <a href="#rdv">Demander un rendez-vous</a>
            <a href="#inviter">Inviter dans un projet</a>
          </div>
        </form>
      </div>
    </div></section>
```

### PP-11/C — Bande

*Appel à l'action de clôture sur fond sombre — ferme la page ; à combiner avec un en-tête clair.*

```html
    <section class="pp-ctc-c"><div class="pp">
      <p>Un projet à Abidjan ou dans la sous-région ? <b>Parlons-en.</b></p>
      <div class="pp-ctc-c-actions">
        <a class="pp-btn pp-btn--solid" href="#message">Envoyer un message</a>
        <a class="pp-btn" href="#inviter">Inviter dans un projet</a>
      </div>
    </div></section>
```

---

*Fin de la bibliothèque — MEEREO · Page Professionnelle Publique · 33 composants.*
