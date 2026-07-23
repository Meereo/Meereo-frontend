// sections/ReviewsSection.jsx — PP-09 Avis et satisfaction (3 variantes)

export function ReviewTestimony({ data }) {
  return (
    <section className="pp-avis-a py-16">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-[22px]">
          Retour d&apos;experience
        </span>
        <blockquote className="text-[clamp(19px,2.8vw,26px)] font-normal tracking-[-0.012em] leading-[1.45] max-w-[42ch] text-pp-ink">
          {data.quote}
        </blockquote>
        <footer className="mt-[22px] flex items-center gap-4 flex-wrap">
          <b className="text-sm font-semibold">{data.author}</b>
          {data.project && <span className="font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em] text-[11.5px]">{data.project}</span>}
          {data.verified && (
            <span className="pp-badge inline-flex items-center gap-[7px] border border-pp-ink py-1 px-2.5 text-[11.5px] font-semibold tracking-[0.04em] whitespace-nowrap">
              Retour verifie &mdash; projet MEEREO
            </span>
          )}
        </footer>
      </div>
    </section>
  );
}

export function ReviewJournal({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-[18px]">
          Retours d&apos;experience
        </span>
        {(data.reviews || []).map((r, i) => (
          <div
            className={`grid grid-cols-[120px_1fr] max-[640px]:grid-cols-1 gap-[22px] max-[640px]:gap-1.5 py-[18px] border-b border-pp-line${i === 0 ? " border-t border-t-pp-ink" : ""}`}
            key={r.id || i}
          >
            <span className="font-pp-mono text-xs text-pp-ink-3">{r.date}</span>
            <div>
              <p className="text-[14.5px] text-pp-ink-2">{r.quote}</p>
              <div className="mt-2 text-[12.5px]">
                <b className="font-semibold">{r.author}</b> &middot; {r.project}
                {r.verified && " \u00B7 retour vérifié MEEREO"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReviewStructured({ data }) {
  return (
    <section className="py-14 bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          Retour d&apos;experience structure
        </span>
        <div className="bg-pp-paper border border-pp-line-2 grid grid-cols-3 max-[760px]:grid-cols-1">
          <div className="p-[22px] border-r border-pp-line max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:border-b-pp-line">
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 font-medium mb-2.5">Contexte</h3>
            <p className="text-[13.5px] text-pp-ink-2">{data.context}</p>
          </div>
          <div className="p-[22px] border-r border-pp-line max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:border-b-pp-line">
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 font-medium mb-2.5">Ce qui a ete livre</h3>
            <p className="text-[13.5px] text-pp-ink-2">{data.delivered}</p>
          </div>
          <div className="p-[22px]">
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 font-medium mb-2.5">Le retour du client</h3>
            <p className="text-[13.5px] text-pp-ink-2">{data.feedback}</p>
          </div>
          <div className="flex justify-between items-center gap-3 border-t border-pp-line py-3.5 px-[22px] col-span-full flex-wrap">
            <b className="text-[13.5px] font-semibold">{data.author}</b>
            {data.verified && (
              <span className="pp-badge inline-flex items-center gap-[7px] border border-pp-ink py-1 px-2.5 text-[11.5px] font-semibold tracking-[0.04em] whitespace-nowrap">
                Retour verifie &mdash; projet MEEREO
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
