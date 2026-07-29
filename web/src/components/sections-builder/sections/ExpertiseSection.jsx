// sections/ExpertiseSection.jsx — PP-04 Domaines d'expertise (3 variantes)

export function ExpertiseTable({ data }) {
  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-5 block text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
          Domaines d&apos;expertise
        </span>
        <table className="w-full border-collapse border-t border-mo-line">
          <tbody>
            {(data.domains || []).map((d, i) => (
              <tr key={d.id || i}>
                <th
                  scope="row"
                  className="w-[260px] border-b border-mo-line p-[15px] pl-0 text-left text-[14.5px] font-semibold text-mo-text max-[640px]:w-[40%]"
                >
                  {d.name}
                </th>
                <td className="border-b border-mo-line p-[15px] pl-[18px] text-left text-[14.5px] text-mo-muted max-[640px]:pl-0">
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
    <section className="bg-mo-surface py-20 max-[760px]:py-12">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-5 block text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
          Domaines d&apos;expertise
        </span>
        <div className="flex flex-wrap gap-[10px]">
          {(data.domains || []).map((d, i) => (
            <span
              className="shadow-mo rounded-mo bg-mo-card px-[18px] py-[11px] text-[14px] font-medium text-mo-text transition-colors motion-reduce:transition-none hover:bg-mo-text hover:text-white"
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
    <section className="py-20 max-[760px]:py-12">
      <div className="mx-auto max-w-[1080px] px-7">
        <span className="mb-[6px] block text-[10px] font-semibold tracking-[0.12em] uppercase text-mo-hint">
          Domaines d&apos;expertise
        </span>
        {data.note && (
          <p className="mb-[22px] text-[13px] text-mo-hint">{data.note}</p>
        )}
        {(data.domains || []).map((d, i) => (
          <div
            className="grid grid-cols-[230px_1fr_44px] items-center gap-4 border-b border-mo-line py-[11px] max-[640px]:grid-cols-[1fr_44px]"
            key={d.id || i}
          >
            <b className="text-[14px] font-semibold text-mo-text">{d.name}</b>
            <span className="h-3 rounded-full bg-mo-surface max-[640px]:col-span-2" style={{ display: 'block', overflow: 'hidden' }}>
              <i
                className="pp-dom-bar-fill not-italic rounded-full"
                style={{ width: `${d.percent || 0}%`, minWidth: d.percent > 0 ? 8 : 0 }}
              />
            </span>
            <span className="text-right text-[13px] text-mo-hint">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
