// sections/PresentationSection.jsx — PP-02 Presentation (3 variantes)

export function PresEssay({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="grid grid-cols-[1fr_1.6fr] gap-[40px] max-[760px]:grid-cols-1">
          <div>
            <span className="block mb-[14px] font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3">
              Presentation
            </span>
            <h2 className="text-[clamp(22px,3vw,30px)] font-[650] tracking-[-0.02em] leading-[1.15]">
              {data.title}
            </h2>
          </div>
          <div className="[&>p]:text-pp-ink-2 [&>p]:mb-[14px]">
            {(data.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        {data.values?.length > 0 && (
          <ul className="mt-[34px] border-t border-pp-ink list-none p-0">
            {data.values.map((v, i) => (
              <li
                key={v.id || i}
                className="grid grid-cols-[220px_1fr] gap-[18px] py-[16px] border-b border-pp-line list-none max-[760px]:grid-cols-1 max-[760px]:gap-[4px]"
              >
                <b className="text-[14px] font-[650]">{v.label}</b>
                <span className="text-[14px] text-pp-ink-2">{v.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function PresManifesto({ data }) {
  return (
    <section className="py-[64px] bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="block mb-[18px] font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3">
          Presentation
        </span>
        <p
          className="text-[clamp(20px,3.2vw,30px)] font-normal tracking-[-0.015em] leading-[1.3] max-w-[30ch] [&>b]:font-[650] [&>strong]:font-[650]"
          dangerouslySetInnerHTML={{ __html: data.lead || "" }}
        />
        {data.columns?.length > 0 && (
          <div className="grid grid-cols-3 gap-[26px] mt-[44px] border-t border-pp-line-2 pt-[26px] max-[760px]:grid-cols-1">
            {data.columns.map((c, i) => (
              <div key={c.id || i}>
                <b className="block text-[13px] font-[650] tracking-[0.06em] uppercase mb-[8px]">
                  {c.label}
                </b>
                <p className="text-[14px] text-pp-ink-2">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PresDossier({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="grid grid-cols-[190px_1fr] gap-[44px] max-[760px]:grid-cols-1">
          <nav
            className="sticky top-[20px] self-start max-[760px]:static max-[760px]:flex max-[760px]:gap-[16px] max-[760px]:flex-wrap"
            aria-label="Sommaire de la presentation"
          >
            {(data.sections || []).map((s, i) => (
              <a
                key={s.id || i}
                href={`#pres-${i}`}
                className="block font-pp-mono text-[12px] text-pp-ink-3 no-underline py-[8px] border-b border-pp-line tracking-[0.06em] uppercase hover:text-pp-ink"
              >
                {s.title}
              </a>
            ))}
          </nav>
          <div>
            {(data.sections || []).map((s, i) => (
              <article key={s.id || i} id={`pres-${i}`} className="mb-[34px]">
                <h3 className="text-[15px] font-[650] tracking-[0.04em] uppercase mb-[10px]">
                  {s.title}
                </h3>
                <p className="text-pp-ink-2 text-[15px] max-w-[64ch]">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
