// sections/HeroSection.jsx — PP-01 En-tete (3 variantes)

/* ── shared inline helpers ────────────────────────────────── */

const badgeCls =
  "inline-flex items-center gap-[7px] border border-pp-ink py-1 px-[10px] text-[11.5px] font-semibold tracking-[0.04em] whitespace-nowrap";

const btnCls =
  "inline-flex items-center justify-center gap-2 border border-pp-ink bg-pp-paper text-pp-ink font-semibold text-[13.5px] py-[13px] px-[22px] cursor-pointer no-underline tracking-[0.02em] transition-colors hover:bg-pp-ink hover:text-white";

const btnSolidCls =
  "inline-flex items-center justify-center gap-2 border border-pp-ink bg-pp-ink text-white font-semibold text-[13.5px] py-[13px] px-[22px] cursor-pointer no-underline tracking-[0.02em] transition-colors hover:bg-pp-black hover:text-white";

const logoCls =
  "grid place-items-center bg-pp-ink text-white font-[650]";

/* ── PP-01/A — Banniere ──────────────────────────────────── */

export function HeroBanner({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section>
      {/* Cover */}
      <div
        className="min-h-[min(34vw,300px)] border-b border-pp-line-2 bg-pp-surface-2"
        role="img"
        aria-label="Photo de couverture"
        style={
          data.coverSrc
            ? {
                background: `url(${data.coverSrc}) center/cover`,
                borderBottom: "1px solid var(--color-pp-line-2)",
              }
            : {
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,.06) 6px, rgba(0,0,0,.06) 7px)",
              }
        }
      />

      {/* Inner container */}
      <div className="max-w-[1080px] mx-auto px-7 flex gap-[26px] items-end flex-wrap">
        {/* Logo */}
        <div
          className={`${logoCls} w-24 h-24 text-[28px] -mt-12 border-4 border-pp-paper rounded-none shrink-0`}
          aria-hidden="true"
        >
          {initials || "RD"}
        </div>

        {/* Identity */}
        <div className="min-w-0">
          <h1 className="text-[clamp(26px,4vw,38px)] font-[650] tracking-[-0.02em] leading-[1.05]">
            {data.companyName}
          </h1>
          <div className="flex gap-[14px] items-center flex-wrap mt-[10px]">
            <span className="text-sm text-pp-ink-2 font-medium">{data.category}</span>
            {data.verified && <span className={badgeCls}>Professionnel verifie MEEREO</span>}
            <span className="font-pp-mono text-xs text-pp-ink-3">{data.location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] pt-[18px] flex-wrap">
          <a className={btnSolidCls} href="#contact">{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter">{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}

/* ── PP-01/B — Editorial ─────────────────────────────────── */

export function HeroEditorial({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const parts = (data.companyName || "").split(" ");
  const first = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];
  return (
    <section className="pt-16 pb-[46px] border-b border-pp-ink">
      <div className="max-w-[1080px] mx-auto px-7">
        {/* Top row */}
        <div className="flex justify-between gap-[18px] items-center mb-[34px] flex-wrap">
          <div
            className={`${logoCls} w-24 h-24 text-[28px] shrink-0`}
            aria-hidden="true"
          >
            {initials || "RD"}
          </div>
          {data.verified && <span className={badgeCls}>Professionnel verifie MEEREO</span>}
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(44px,8.5vw,96px)] font-light tracking-[-0.035em] leading-[0.98] uppercase">
          {first} <b className="font-bold">{last}</b>
        </h1>

        {/* Slogan */}
        {data.slogan && (
          <p className="mt-5 text-[clamp(16px,2vw,20px)] text-pp-ink-2 max-w-[44ch]">
            {data.slogan}
          </p>
        )}

        {/* Meta row */}
        <div className="flex mt-[34px] border-t border-pp-line flex-wrap">
          <div className="pt-[14px] pr-[26px] mr-[26px] border-r border-pp-line">
            <span className="block mb-1 font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3">
              Categorie
            </span>
            <strong className="text-sm font-semibold">{data.category}</strong>
          </div>
          <div className="pt-[14px] pr-[26px] mr-[26px] border-r border-pp-line">
            <span className="block mb-1 font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3">
              Localisation
            </span>
            <strong className="text-sm font-semibold">{data.location}</strong>
          </div>
          {data.url && (
            <div className="pt-[14px]">
              <span className="block mb-1 font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3">
                Sur MEEREO
              </span>
              <strong className="text-sm font-semibold">{data.url}</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] mt-[34px] flex-wrap">
          <a className={btnSolidCls} href="#contact">{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter">{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}

/* ── PP-01/C — Compact ───────────────────────────────────── */

export function HeroCompact({ data }) {
  const initials = (data.companyName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const cellBase = "flex items-center gap-[14px] py-4 px-[22px] border-r border-pp-line max-[760px]:border-r-0 max-[760px]:py-3 max-[760px]:px-0";

  return (
    <section className="border-t border-pp-ink border-b">
      <div className="max-w-[1080px] mx-auto px-7 flex items-stretch gap-0 flex-wrap">
        {/* Cell 1 — Logo + name */}
        <div className={`${cellBase} !pl-0`}>
          <div
            className={`${logoCls} w-11 h-11 text-[15px] shrink-0`}
            aria-hidden="true"
          >
            {initials || "RD"}
          </div>
          <div>
            <h1 className="text-[17px] font-[650] tracking-[-0.01em] leading-[1.1]">
              {data.companyName}
            </h1>
            <div className="text-[12.5px] text-pp-ink-3 mt-0.5">{data.category}</div>
          </div>
        </div>

        {/* Cell 2 — Badge */}
        <div className={cellBase}>
          {data.verified && <span className={badgeCls}>Professionnel verifie MEEREO</span>}
        </div>

        {/* Cell 3 — Location */}
        <div className={cellBase}>
          <span className="font-pp-mono text-xs text-pp-ink-3">{data.location}</span>
        </div>

        {/* Cell 4 — Actions (last cell) */}
        <div className={`${cellBase} !border-r-0 ml-auto !pr-0 max-[760px]:!ml-0`}>
          <a className={btnSolidCls} href="#contact">{data.ctaText || "Contacter"}</a>
          <a className={btnCls} href="#inviter">{data.secondaryText || "Inviter dans un projet"}</a>
        </div>
      </div>
    </section>
  );
}
