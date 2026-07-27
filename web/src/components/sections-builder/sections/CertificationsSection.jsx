// sections/CertificationsSection.jsx — PP-07 Certifications (3 variantes)

export function CertRegister({ data }) {
  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="text-[11px] tracking-[0.14em] uppercase text-mo-hint block mb-5">
          Certifications &middot; agréments &middot; qualifications
        </span>
        <table className="w-full border-collapse border-t border-mo-line">
          <tbody>
            {(data.certs || []).map((c, i) => (
              <tr key={c.id || i}>
                <th scope="row" className="text-left py-3.5 pr-[18px] border-b border-mo-line text-[14.5px] font-semibold" style={{ fontWeight: 650 }}>
                  {c.name}
                </th>
                <td className="text-left py-3.5 pr-[18px] border-b border-mo-line text-[14.5px] text-mo-muted">
                  {c.issuer}
                </td>
                <td className="text-right py-3.5 border-b border-mo-line text-[14.5px] text-mo-muted">
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
    <section className="py-20 max-[760px]:py-12 bg-mo-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="text-[11px] tracking-[0.14em] uppercase text-mo-hint block mb-5">
          Certifications &middot; agréments &middot; qualifications
        </span>
        <div className="grid grid-cols-3 gap-3.5 max-[760px]:grid-cols-1">
          {(data.certs || []).map((c, i) => (
            <div className="bg-mo-card rounded-mo shadow-mo p-[22px] flex flex-col gap-2.5 min-h-[150px] motion-reduce:transition-none" key={c.id || i}>
              <span
                className="w-[38px] h-[38px] rounded-mo grid place-items-center text-[13px] font-semibold bg-mo-surface"
                aria-hidden="true"
              >
                {c.mark || c.name.slice(0, 2).toUpperCase()}
              </span>
              <b className="text-[14.5px] font-semibold leading-snug">{c.name}</b>
              <span className="mt-auto text-xs text-mo-hint tracking-[0.03em]">DEPUIS {c.year}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CertLine({ data }) {
  return (
    <section className="border-t border-b border-mo-line py-5">
      <div className="max-w-[1080px] mx-auto px-7 flex items-center gap-0 flex-wrap">
        <span className="text-[11px] tracking-[0.14em] uppercase text-mo-hint pr-[26px]">
          Qualifications
        </span>
        {(data.certs || []).map((c, i) => (
          <span className="text-[13px] font-medium py-1 px-[26px] border-l border-mo-line" key={c.id || i}>
            {c.name}<span className="text-mo-hint text-xs ml-1.5">{c.year}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
