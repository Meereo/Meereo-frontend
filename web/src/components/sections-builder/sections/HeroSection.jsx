// sections/HeroSection.jsx — PP-01 En-tête (3 variantes)

/* ── profile action dispatcher ──────────────────────────── */
const fireProfileAction = (action, e) => {
  e?.preventDefault()
  window.dispatchEvent(new CustomEvent('meereo-profile-action', { detail: action }))
}

/* ── shared inline helpers ────────────────────────────────── */

// INS-04: badge vérifié — couleurs mo-ok/mo-okbg
const badgeCls =
  "inline-flex items-center gap-[7px] py-1 px-[10px] text-[11.5px] font-semibold tracking-[0.04em] whitespace-nowrap rounded-full bg-mo-okbg text-mo-ok border border-mo-ok/25"

// Bouton principal : dégradé noir, UNE seule action opaque par zone
const btnSolidCls =
  "inline-flex items-center justify-center gap-2 bg-gradient-to-br from-black to-[#3c3b3b] text-[#e5e2e1] font-semibold text-[13px] py-[13px] px-[22px] rounded-mo-sm cursor-pointer no-underline tracking-[0.02em] motion-reduce:transition-none transition-colors hover:from-[#1a1a1a] hover:to-[#2a2a2a]";

// Bouton secondaire : sourd, border-mo-line
const btnCls =
  "inline-flex items-center justify-center gap-2 bg-transparent text-mo-text border border-mo-line font-semibold text-[13px] py-[13px] px-[22px] rounded-mo-sm cursor-pointer no-underline tracking-[0.02em] motion-reduce:transition-none transition-colors hover:bg-mo-surface";

// Logo : rounded-mo-sm (QAL-07 — entreprise, pas personne)
const logoCls =
  "grid place-items-center bg-mo-text text-white font-[650] rounded-mo-sm";

/* ── Logo: image si dispo, sinon initiales ──────────────── */
function Logo({ src, initials, size = "w-24 h-24", textSize = "text-[28px]", className = "" }) {
  if (src) return <img src={src} alt="" className={`${size} object-contain bg-mo-text rounded-mo-sm shrink-0 ${className}`} />;
  return <div className={`${logoCls} ${size} ${textSize} shrink-0 ${className}`} aria-hidden="true">{initials || "?"}</div>;
}

/* ── PP-01/A — Bannière ──────────────────────────────────── */

export function HeroBanner({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section className="bg-mo-bg">
      {/* Cover */}
      <div
        className="min-h-[min(34vw,300px)] bg-mo-surface"
        role="img"
        aria-label="Photo de couverture"
        style={
          data.coverSrc
            ? { background: `url(${data.coverSrc}) center/cover` }
            : { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,.04) 6px, rgba(0,0,0,.04) 7px)" }
        }
      />

      {/* Inner container */}
      <div className="max-w-[1080px] mx-auto px-7 flex gap-[26px] items-end flex-wrap">
        {/* Logo */}
        <Logo src={data.logoSrc} initials={initials} className="-mt-12 border-4 border-mo-card" />

        {/* Identity */}
        <div className="min-w-0">
          <h1 className="font-mo-serif italic text-[clamp(28px,4vw,38px)] leading-[1.1] tracking-[-0.02em] text-mo-text">
            {data.companyName}
          </h1>
          <div className="flex gap-[14px] items-center flex-wrap mt-[10px]">
            <span className="text-[13px] text-mo-muted font-medium">{data.category}</span>
            {data.verified && <span className={badgeCls}>Professionnel vérifié MEEREO</span>}
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">{data.location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] pt-[18px] flex-wrap">
          <a className={btnSolidCls} href="#contact" onClick={e => fireProfileAction('contact', e)}>{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter" onClick={e => fireProfileAction('invite', e)}>{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}

/* ── PP-01/B — Éditorial ─────────────────────────────────── */

export function HeroEditorial({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const parts = (data.companyName || "").split(" ");
  const first = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];
  return (
    <section className="pt-16 pb-[46px] bg-mo-bg border-b border-mo-line">
      <div className="max-w-[1080px] mx-auto px-7">
        {/* Top row */}
        <div className="flex justify-between gap-[18px] items-center mb-[34px] flex-wrap">
          <Logo src={data.logoSrc} initials={initials} />
          {data.verified && <span className={badgeCls}>Professionnel vérifié MEEREO</span>}
        </div>

        {/* Headline */}
        <h1 className="font-mo-serif italic text-[clamp(44px,8.5vw,96px)] tracking-[-0.035em] leading-[0.98] text-mo-text">
          {first} <b className="font-bold not-italic font-mo-sans">{last}</b>
        </h1>

        {/* Slogan */}
        {data.slogan && (
          <p className="mt-5 text-[clamp(16px,2vw,20px)] text-mo-muted max-w-[44ch]">
            {data.slogan}
          </p>
        )}

        {/* Meta row */}
        <div className="flex mt-[34px] border-t border-mo-line flex-wrap">
          <div className="pt-[14px] pr-[26px] mr-[26px] border-r border-mo-line">
            <span className="block mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
              Catégorie
            </span>
            <strong className="text-sm font-semibold text-mo-text">{data.category}</strong>
          </div>
          <div className="pt-[14px] pr-[26px] mr-[26px] border-r border-mo-line">
            <span className="block mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
              Localisation
            </span>
            <strong className="text-sm font-semibold text-mo-text">{data.location}</strong>
          </div>
          {data.url && (
            <div className="pt-[14px]">
              <span className="block mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
                Sur MEEREO
              </span>
              <strong className="text-sm font-semibold text-mo-text">{data.url}</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] mt-[34px] flex-wrap">
          <a className={btnSolidCls} href="#contact" onClick={e => fireProfileAction('contact', e)}>{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter" onClick={e => fireProfileAction('invite', e)}>{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}

/* ── PP-01/C — Compact (barre fixe du haut) ──────────────── */

export function HeroCompact({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const cellBase = "flex items-center gap-[14px] py-4 px-[22px] border-r border-mo-line max-[760px]:border-r-0 max-[760px]:py-3 max-[760px]:px-0";

  return (
    <section className="sticky top-0 z-50 bg-[#f8f9fa]/[0.72] backdrop-blur-mo border-b border-mo-line">
      <div className="max-w-[1080px] mx-auto px-7 flex items-stretch gap-0 flex-wrap">
        {/* Cell 1 — Logo + name */}
        <div className={`${cellBase} !pl-0`}>
          <Logo src={data.logoSrc} initials={initials} size="w-11 h-11" textSize="text-[15px]" />
          <div>
            <h1 className="font-mo-serif italic text-[17px] tracking-[-0.01em] leading-[1.1] text-mo-text">
              {data.companyName}
            </h1>
            <div className="text-[12.5px] text-mo-hint mt-0.5">{data.category}</div>
          </div>
        </div>

        {/* Cell 2 — Badge */}
        <div className={cellBase}>
          {data.verified && <span className={badgeCls}>Professionnel vérifié MEEREO</span>}
        </div>

        {/* Cell 3 — Location */}
        <div className={cellBase}>
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">{data.location}</span>
        </div>

        {/* Cell 4 — Actions (last cell) */}
        <div className={`${cellBase} !border-r-0 ml-auto !pr-0 max-[760px]:!ml-0`}>
          <a className={btnSolidCls} href="#contact" onClick={e => fireProfileAction('contact', e)}>{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter" onClick={e => fireProfileAction('invite', e)}>{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}
