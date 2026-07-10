// sections/CertificationsSection.jsx — PP-07 Certifications (3 variantes)

export function CertRegister({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          Certifications &middot; agrements &middot; qualifications
        </span>
        <table className="w-full border-collapse border-t border-pp-ink">
          <tbody>
            {(data.certs || []).map((c, i) => (
              <tr key={c.id || i}>
                <th scope="row" className="text-left py-3.5 pr-[18px] border-b border-pp-line text-[14.5px] font-semibold" style={{ fontWeight: 650 }}>
                  {c.name}
                </th>
                <td className="text-left py-3.5 pr-[18px] border-b border-pp-line text-[14.5px] text-pp-ink-2">
                  {c.issuer}
                </td>
                <td className="text-right py-3.5 border-b border-pp-line text-[14.5px] text-pp-ink-2">
                  {c.year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CertSeals({ data }) {
  return (
    <section className="py-14 bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 block mb-5">
          Certifications &middot; agrements &middot; qualifications
        </span>
        <div className="grid grid-cols-3 gap-3.5 max-[760px]:grid-cols-1">
          {(data.certs || []).map((c, i) => (
            <div className="bg-pp-paper border border-pp-ink p-[22px] flex flex-col gap-2.5 min-h-[150px]" key={c.id || i}>
              <span
                className="w-[38px] h-[38px] border border-pp-ink grid place-items-center font-pp-mono text-[13px] font-semibold"
                aria-hidden="true"
              >
                {c.mark || c.name.slice(0, 2).toUpperCase()}
              </span>
              <b className="text-[14.5px] font-semibold leading-snug">{c.name}</b>
              <span className="mt-auto font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em]">DEPUIS {c.year}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CertLine({ data }) {
  return (
    <section className="border-t border-b border-pp-line-2 py-5">
      <div className="max-w-[1080px] mx-auto px-7 flex items-center gap-0 flex-wrap">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 pr-[26px]">
          Qualifications
        </span>
        {(data.certs || []).map((c, i) => (
          <span className="text-[13px] font-medium py-1 px-[26px] border-l border-pp-line-2" key={c.id || i}>
            {c.name}<span className="text-pp-ink-3 text-xs ml-1.5">{c.year}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
