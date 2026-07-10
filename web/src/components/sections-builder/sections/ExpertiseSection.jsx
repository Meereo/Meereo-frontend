// sections/ExpertiseSection.jsx — PP-04 Domaines d'expertise (3 variantes)

export function ExpertiseTable({ data }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-5 block font-pp-mono text-[11px] uppercase tracking-[0.14em] text-pp-ink-3">
          Domaines d&apos;expertise
        </span>
        <table className="w-full border-collapse border-t border-pp-ink">
          <tbody>
            {(data.domains || []).map((d, i) => (
              <tr key={d.id || i}>
                <th
                  scope="row"
                  className="w-[260px] border-b border-pp-line p-[15px] pl-0 text-left text-[14.5px] font-[650] text-pp-ink max-[640px]:w-[40%]"
                >
                  {d.name}
                </th>
                <td className="border-b border-pp-line p-[15px] pl-[18px] text-left text-[14.5px] text-pp-ink-2 max-[640px]:pl-0">
                  {d.scope}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ExpertiseMosaic({ data }) {
  return (
    <section className="bg-pp-surface py-14">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-5 block font-pp-mono text-[11px] uppercase tracking-[0.14em] text-pp-ink-3">
          Domaines d&apos;expertise
        </span>
        <div className="flex flex-wrap gap-[10px]">
          {(data.domains || []).map((d, i) => (
            <span
              className="border border-pp-ink bg-pp-paper px-[18px] py-[11px] text-[14px] font-medium text-pp-ink transition-colors hover:bg-pp-ink hover:text-white"
              key={d.id || i}
            >
              {d.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExpertiseBars({ data }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-[6px] block font-pp-mono text-[11px] uppercase tracking-[0.14em] text-pp-ink-3">
          Domaines d&apos;expertise
        </span>
        {data.note && (
          <p className="mb-[22px] text-[13px] text-pp-ink-3">{data.note}</p>
        )}
        {(data.domains || []).map((d, i) => (
          <div
            className="grid grid-cols-[230px_1fr_44px] items-center gap-4 border-b border-pp-line py-[11px] max-[640px]:grid-cols-[1fr_44px]"
            key={d.id || i}
          >
            <b className="text-[14px] font-semibold text-pp-ink">{d.name}</b>
            <span className="h-2 bg-pp-surface-2 max-[640px]:col-span-2">
              <i
                className="pp-dom-bar-fill not-italic"
                style={{ width: `${d.percent || 0}%` }}
              />
            </span>
            <span className="text-right font-pp-mono text-[13px] text-pp-ink-3">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
