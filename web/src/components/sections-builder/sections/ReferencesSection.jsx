// sections/ReferencesSection.jsx — PP-08 References (3 variantes)

export function RefCaseStudy({ data }) {
  const featured = (data.references || [])[0];
  const others = (data.references || []).slice(1);
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          References
        </span>
        {featured && (
          <div className="grid grid-cols-[1.4fr_1fr] max-[760px]:grid-cols-1 gap-[30px] border-t border-pp-ink pt-[26px] mb-[26px]">
            <div
              className="pp-ph aspect-[16/10]"
              role="img"
              aria-label={featured.project}
              style={featured.src ? { background: `url(${featured.src}) center/cover`, border: "none" } : undefined}
            />
            <div>
              <b className="block text-xl font-semibold tracking-[-0.01em]">{featured.project}</b>
              <span className="block my-[6px_0_12px] font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em]">
                {[featured.location, featured.year, featured.mission, featured.origin].filter(Boolean).join(" \u00B7 ").toUpperCase()}
              </span>
              {featured.description && <p className="text-[14.5px] text-pp-ink-2">{featured.description}</p>}
            </div>
          </div>
        )}
        {others.length > 0 && (
          <ul className="list-none">
            {others.map((r, i) => (
              <li className="flex justify-between gap-3.5 py-3 border-b border-pp-line text-sm" key={r.id || i}>
                <b className="font-semibold">{r.project}</b>
                <span className="font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em]">
                  {[r.location, r.year, r.mission].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function RefTable({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          References
        </span>
        <table className="w-full border-collapse border-t border-pp-ink">
          <thead>
            <tr>
              <th className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 text-left font-medium py-3 pr-[18px] border-b border-pp-line-2">Projet</th>
              <th className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 text-left font-medium py-3 pr-[18px] border-b border-pp-line-2">Lieu</th>
              <th className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 text-left font-medium py-3 pr-[18px] border-b border-pp-line-2">Annee</th>
              <th className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 text-left font-medium py-3 pr-[18px] border-b border-pp-line-2">Mission realisee</th>
            </tr>
          </thead>
          <tbody>
            {(data.references || []).map((r, i) => (
              <tr key={r.id || i}>
                <td className="py-3.5 pr-[18px] border-b border-pp-line text-[14.5px] font-semibold">{r.project}</td>
                <td className="py-3.5 pr-[18px] border-b border-pp-line text-[14.5px] text-pp-ink-2">{r.location}</td>
                <td className="py-3.5 pr-[18px] border-b border-pp-line text-[14.5px]">{r.year}</td>
                <td className="py-3.5 pr-[18px] border-b border-pp-line text-[14.5px] text-pp-ink-2">{r.mission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function RefCards({ data }) {
  return (
    <section className="py-14 bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          References
        </span>
        <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-3.5">
          {(data.references || []).map((r, i) => (
            <div className="bg-pp-paper border border-pp-line-2 p-5 flex flex-col gap-2.5 min-h-[170px]" key={r.id || i}>
              <b className="text-[15.5px] font-semibold">{r.project}</b>
              {r.description && <p className="text-[13.5px] text-pp-ink-2">{r.description}</p>}
              <div className="mt-auto flex justify-between items-center gap-2.5">
                <span className="font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em]">
                  {[r.location, r.year].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                </span>
                {r.origin && (
                  <span className="font-pp-mono text-[10.5px] tracking-[0.08em] uppercase border border-pp-ink py-[3px] px-2">
                    {r.origin}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
