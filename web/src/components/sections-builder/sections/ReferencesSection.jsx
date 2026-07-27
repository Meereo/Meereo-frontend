// sections/ReferencesSection.jsx — PP-08 Références (3 variantes)

export function RefCaseStudy({ data }) {
  const featured = (data.references || [])[0];
  const others = (data.references || []).slice(1);
  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="text-[22px] font-semibold tracking-[-0.01em] text-mo-text block mb-5">
          References
        </span>
        {featured && (
          <div className="grid grid-cols-[1.4fr_1fr] max-[760px]:grid-cols-1 gap-[30px] border-t border-mo-line pt-[26px] mb-[26px]">
            <div
              className="pp-ph aspect-[16/10] rounded-mo"
              role="img"
              aria-label={featured.project}
              style={featured.src ? { background: `url(${featured.src}) center/cover`, border: "none" } : undefined}
            />
            <div>
              <b className="block text-xl font-semibold tracking-[-0.01em]">{featured.project}</b>
              <span className="block my-[6px_0_12px] text-xs text-mo-hint tracking-[0.03em]">
                {[featured.location, featured.year, featured.mission, featured.origin].filter(Boolean).join(" \u00B7 ").toUpperCase()}
              </span>
              {featured.description && <p className="text-[14.5px] text-mo-muted">{featured.description}</p>}
            </div>
          </div>
        )}
        {others.length > 0 ? (
          <ul className="list-none">
            {others.map((r, i) => (
              <li className="flex justify-between gap-3.5 py-3 border-b border-mo-line text-sm" key={r.id || i}>
                <b className="font-semibold">{r.project}</b>
                <span className="text-xs text-mo-hint tracking-[0.03em]">
                  {[r.location, r.year, r.mission].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        ) : !featured && (
          <div className="p-10 text-center rounded-mo bg-mo-card shadow-mo-sm text-mo-hint text-sm">Aucune donnée</div>
        )}
      </div>
    </section>
  );
}

export function RefTable({ data }) {
  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="text-[22px] font-semibold tracking-[-0.01em] text-mo-text block mb-5">
          References
        </span>
        {(data.references || []).length > 0 ? (
          <table className="w-full border-collapse border-t border-mo-line">
            <thead>
              <tr>
                <th className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint text-left font-medium py-3 pr-[18px] border-b border-mo-line">Projet</th>
                <th className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint text-left font-medium py-3 pr-[18px] border-b border-mo-line">Lieu</th>
                <th className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint text-left font-medium py-3 pr-[18px] border-b border-mo-line">Année</th>
                <th className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint text-left font-medium py-3 pr-[18px] border-b border-mo-line">Mission réalisée</th>
              </tr>
            </thead>
            <tbody>
              {(data.references || []).map((r, i) => (
                <tr key={r.id || i}>
                  <td className="py-3.5 pr-[18px] border-b border-mo-line text-[14.5px] font-semibold">{r.project}</td>
                  <td className="py-3.5 pr-[18px] border-b border-mo-line text-[14.5px] text-mo-muted">{r.location}</td>
                  <td className="py-3.5 pr-[18px] border-b border-mo-line text-[14.5px]">{r.year}</td>
                  <td className="py-3.5 pr-[18px] border-b border-mo-line text-[14.5px] text-mo-muted">{r.mission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center rounded-mo bg-mo-card shadow-mo-sm text-mo-hint text-sm">Aucune donnée</div>
        )}
      </div>
    </section>
  );
}

export function RefCards({ data }) {
  return (
    <section className="py-20 max-[760px]:py-12 bg-mo-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="text-[22px] font-semibold tracking-[-0.01em] text-mo-text block mb-5">
          References
        </span>
        {(data.references || []).length > 0 ? (
          <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-3.5">
            {(data.references || []).map((r, i) => (
              <div className="bg-mo-card rounded-mo shadow-mo p-5 flex flex-col gap-2.5 min-h-[170px]" key={r.id || i}>
                <b className="text-[15.5px] font-semibold">{r.project}</b>
                {r.description && <p className="text-[13.5px] text-mo-muted">{r.description}</p>}
                <div className="mt-auto flex justify-between items-center gap-2.5">
                  <span className="text-xs text-mo-hint tracking-[0.03em]">
                    {[r.location, r.year].filter(Boolean).join(" \u00B7 ").toUpperCase()}
                  </span>
                  {r.origin && (
                    <span className="text-[10.5px] tracking-[0.08em] uppercase rounded-mo shadow-mo py-[3px] px-2">
                      {r.origin}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-mo bg-mo-card shadow-mo-sm text-mo-hint text-sm">Aucune donnée</div>
        )}
      </div>
    </section>
  );
}
