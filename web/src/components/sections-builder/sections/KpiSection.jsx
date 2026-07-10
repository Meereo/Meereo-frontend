// sections/KpiSection.jsx — PP-03 Chiffres cles (3 variantes)

export function KpiBand({ data }) {
  const items = data.items || [];
  return (
    <section className="border-y border-pp-ink py-[26px]">
      <div className="mx-auto max-w-[1080px] px-7">
        <div className="grid grid-cols-5 max-[760px]:grid-cols-2 max-[760px]:gap-y-[18px]">
          {items.map((item, i) => (
            <div
              className={[
                "px-[22px] py-1",
                "border-r border-pp-line",
                "max-[760px]:border-r-0 max-[760px]:px-0",
                i === 0 && "pl-0",
                i === items.length - 1 && "border-r-0",
              ]
                .filter(Boolean)
                .join(" ")}
              key={item.id || i}
            >
              <span className="block font-pp-mono text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em] text-pp-ink">
                {item.value}
              </span>
              <span className="mt-1 block font-pp-mono text-[11px] uppercase tracking-[0.14em] text-pp-ink-3">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KpiCards({ data }) {
  return (
    <section className="bg-pp-surface py-12">
      <div className="mx-auto max-w-[1080px] px-7">
        <div className="grid grid-cols-5 gap-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {(data.items || []).map((item, i) => (
            <div
              className="rounded-none border border-pp-line-2 bg-pp-paper px-4 pb-4 pt-[18px]"
              key={item.id || i}
            >
              <span className="mb-[14px] block font-pp-mono text-[11px] uppercase tracking-[0.14em] text-pp-ink-3">
                {item.label}
              </span>
              <span className="block text-[30px] font-semibold tracking-[-0.02em] text-pp-ink">
                {item.value}
              </span>
              {item.note && (
                <small className="mt-[6px] block text-[12px] text-pp-ink-3">
                  {item.note}
                </small>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KpiProse({ data }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1080px] px-7">
        <p
          className="max-w-[38ch] text-[clamp(19px,2.8vw,27px)] font-normal leading-[1.5] tracking-[-0.012em] text-pp-ink-2"
          dangerouslySetInnerHTML={{ __html: data.prose || "" }}
        />
      </div>
    </section>
  );
}
