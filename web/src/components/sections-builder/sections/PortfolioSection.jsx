// sections/PortfolioSection.jsx — PP-05 Portfolio (3 variantes)

export function PortfolioMagazine({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="flex justify-between items-baseline mb-[24px] gap-[16px] flex-wrap">
          <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink">
            {data.title || "Realisations"}
          </h2>
          {data.subtitle && (
            <span className="font-pp-mono text-[12px] text-pp-ink-3 tracking-[0.03em]">
              {data.subtitle}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-[22px] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
          {(data.projects || []).map((p, i) => (
            <figure key={p.id || i} className="m-0">
              <div
                className="pp-ph aspect-[4/3] mb-[12px]"
                role="img"
                aria-label={p.title}
                style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
              />
              <figcaption>
                <b className="block text-[15px] font-[650] text-pp-ink">{p.title}</b>
                <span className="block mt-[4px] font-pp-mono text-[12px] text-pp-ink-3 tracking-[0.03em]">
                  {[p.location, p.year, p.mission].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PortfolioPlanches({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink">
          {data.title || "Realisations"}
        </h2>
        {(data.projects || []).map((p, i) => (
          <div
            key={p.id || i}
            className="grid grid-cols-[1fr_280px] gap-[26px] py-[26px] border-t border-pp-ink max-[760px]:grid-cols-1"
          >
            <div
              className="pp-ph aspect-[21/9]"
              role="img"
              aria-label={p.title}
              style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
            />
            <div>
              <b className="block text-[18px] font-[650] tracking-[-0.01em] mb-[8px] text-pp-ink">{p.title}</b>
              {p.description && <p className="text-[14px] text-pp-ink-2 mb-[14px]">{p.description}</p>}
              <dl className="text-[12.5px]">
                {p.location && (
                  <>
                    <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-[8px]">
                      Localisation
                    </dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.location}</dd>
                  </>
                )}
                {p.year && (
                  <>
                    <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-[8px]">
                      Annee
                    </dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.year}</dd>
                  </>
                )}
                {p.mission && (
                  <>
                    <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-[8px]">
                      Mission realisee
                    </dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.mission}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PortfolioAsymmetric({ data }) {
  const projects = data.projects || [];
  return (
    <section className="py-[56px] bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink mb-[24px]">
          {data.title || "Realisations"}
        </h2>
        <div className="grid grid-cols-2 gap-[22px] max-[560px]:grid-cols-1">
          {projects.map((p, i) => (
            <figure
              key={p.id || i}
              className={`m-0${i === 0 ? " col-span-2 max-[560px]:col-span-1" : ""}`}
            >
              <div
                className={`pp-ph ${i === 0 ? "aspect-[21/9]" : "aspect-[4/3]"}`}
                role="img"
                aria-label={p.title}
                style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
              />
              <figcaption className="flex justify-between gap-[12px] items-baseline">
                <b className="text-[14.5px] font-[650] text-pp-ink">{p.title}</b>
                <span className="font-pp-mono text-[12px] text-pp-ink-3 tracking-[0.03em]">
                  {[p.location, p.year].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
