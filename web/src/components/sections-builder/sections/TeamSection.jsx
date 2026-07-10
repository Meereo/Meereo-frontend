// sections/TeamSection.jsx — PP-06 Equipe (3 variantes)

export function TeamPortraits({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink mb-[24px]">
          {data.title || "L\u2019equipe"}
        </h2>
        <div className="grid grid-cols-4 gap-[22px] max-[860px]:grid-cols-2 max-[480px]:grid-cols-1">
          {(data.members || []).map((m, i) => (
            <figure key={m.id || i} className="m-0">
              <div
                className="pp-ph aspect-[3/4] mb-[12px]"
                role="img"
                aria-label="Portrait"
                style={m.photoSrc ? { background: `url(${m.photoSrc}) center/cover`, border: "none" } : undefined}
              />
              <b className="block text-[15px] font-[650] text-pp-ink">{m.name}</b>
              <span className="block text-[13px] text-pp-ink-2 mt-[2px]">{m.role}</span>
              {m.specialties && (
                <span className="block mt-[6px] font-pp-mono text-[11px] text-pp-ink-3">
                  {m.specialties.toUpperCase()}
                </span>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamDirectory({ data }) {
  return (
    <section className="py-[56px]">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink mb-[18px]">
          {data.title || "L\u2019equipe"}
        </h2>
        {(data.members || []).map((m, i) => (
          <div
            key={m.id || i}
            className={`grid grid-cols-[56px_1.1fr_1.6fr_0.9fr] gap-[18px] items-center py-[14px] border-b border-pp-line max-[760px]:grid-cols-[56px_1fr]${i === 0 ? " border-t border-t-pp-ink" : ""}`}
          >
            <span
              className="pp-ph w-[44px] h-[44px] rounded-full border border-pp-line"
              aria-hidden="true"
              style={m.photoSrc ? { background: `url(${m.photoSrc}) center/cover`, border: "none" } : undefined}
            />
            <div>
              <b className="block text-[14.5px] font-[650] text-pp-ink">{m.name}</b>
              <span className="text-[12.5px] text-pp-ink-3">{m.role}</span>
            </div>
            <span className="text-[13.5px] text-pp-ink-2 max-[760px]:col-start-2 max-[760px]:text-left">
              {m.bio}
            </span>
            {m.specialties && (
              <span className="font-pp-mono text-[12px] text-pp-ink-3 tracking-[0.03em] text-right max-[760px]:col-start-2 max-[760px]:text-left">
                {m.specialties.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeamLeadership({ data }) {
  const leaders = (data.members || []).slice(0, 2);
  const rest = (data.members || []).slice(2);
  return (
    <section className="py-[56px] bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="font-pp-ui text-[clamp(20px,2.6vw,26px)] font-[650] tracking-[-0.02em] text-pp-ink mb-[24px]">
          {data.title || "L\u2019equipe"}
        </h2>
        <div className="grid grid-cols-2 gap-[22px] mb-[30px] max-[760px]:grid-cols-1">
          {leaders.map((m, i) => (
            <figure
              key={m.id || i}
              className="m-0 grid grid-cols-[150px_1fr] gap-[18px] bg-pp-paper border border-pp-line-2 p-[18px]"
            >
              <div
                className="pp-ph aspect-[3/4]"
                role="img"
                aria-label="Portrait"
                style={m.photoSrc ? { background: `url(${m.photoSrc}) center/cover`, border: "none" } : undefined}
              />
              <div>
                <b className="block text-[16px] font-[650] text-pp-ink">{m.name}</b>
                <span className="block text-[13px] text-pp-ink-3 my-[2px] mb-[8px]">{m.role}</span>
                {m.bio && <p className="text-[13.5px] text-pp-ink-2">{m.bio}</p>}
              </div>
            </figure>
          ))}
        </div>
        {rest.length > 0 && (
          <div className="flex flex-wrap gap-y-[8px] gap-x-[26px] border-t border-pp-line-2 pt-[16px]">
            {rest.map((m, i) => (
              <span key={m.id || i} className="text-[13.5px] text-pp-ink">
                {m.name} <i className="not-italic text-pp-ink-3 text-[12.5px]">{"\u2014 " + m.role}</i>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
