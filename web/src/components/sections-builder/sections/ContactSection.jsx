// sections/ContactSection.jsx — PP-11 Contact (3 variantes)

const fireProfileAction = (action, e) => {
  e?.preventDefault()
  window.dispatchEvent(new CustomEvent('meereo-profile-action', { detail: action }))
}

export function ContactActions({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 mb-5 block">
          {data.eyebrow || "Travailler avec nous"}
        </span>
        <div className="grid grid-cols-1 max-[760px]:grid-cols-1 min-[761px]:grid-cols-3 gap-3.5">
          {(data.actions || []).map((a, i) => (
            <a
              className="border border-pp-ink p-[22px] flex flex-col gap-2 no-underline min-h-[150px] transition-colors duration-150 hover:bg-pp-ink hover:text-white group"
              href={a.href || "#"}
              key={a.id || i}
            >
              <b className="text-base font-semibold">{a.title}</b>
              <p className="text-[13px] opacity-[0.72]">{a.description}</p>
              {a.meta && (
                <span className="mt-auto font-pp-mono text-xs text-pp-ink-3 tracking-[0.03em] group-hover:text-pp-ink-3">
                  {a.meta}
                </span>
              )}
            </a>
          ))}
        </div>
        {data.links?.length > 0 && (
          <div className="mt-4 flex gap-[22px] flex-wrap">
            {data.links.map((l, i) => (
              <a
                href={l.href || "#"}
                key={l.id || i}
                className="text-[13.5px] underline underline-offset-[3px]"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ContactForm({ data }) {
  return (
    <section className="py-14 bg-pp-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="grid grid-cols-1 max-[760px]:grid-cols-1 min-[761px]:grid-cols-[1fr_1.4fr] gap-9">
          <div>
            <h2 className="text-[clamp(20px,2.6vw,26px)] font-semibold tracking-[-0.02em]">
              {data.title || "Nous ecrire"}
            </h2>
            {data.note && (
              <p className="text-[13.5px] text-pp-ink-3 mt-3 max-w-[34ch]">
                {data.note}
              </p>
            )}
          </div>
          <form
            action="#"
            method="post"
            className="grid gap-3.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="grid gap-1.5 font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3">
              Votre nom
              <input
                type="text"
                name="nom"
                autoComplete="name"
                className="border border-pp-line-2 bg-pp-paper py-[13px] px-3.5 text-[14.5px] leading-[1.4] font-pp-ui text-pp-ink w-full focus:outline-2 focus:outline-pp-ink focus:outline-offset-0 focus:border-pp-ink"
              />
            </label>
            <label className="grid gap-1.5 font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3">
              Votre e-mail
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="border border-pp-line-2 bg-pp-paper py-[13px] px-3.5 text-[14.5px] leading-[1.4] font-pp-ui text-pp-ink w-full focus:outline-2 focus:outline-pp-ink focus:outline-offset-0 focus:border-pp-ink"
              />
            </label>
            <label className="grid gap-1.5 font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3">
              Votre message
              <textarea
                name="message"
                className="border border-pp-line-2 bg-pp-paper py-[13px] px-3.5 text-[14.5px] leading-[1.4] font-pp-ui text-pp-ink w-full min-h-[120px] resize-y focus:outline-2 focus:outline-pp-ink focus:outline-offset-0 focus:border-pp-ink"
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 border border-pp-ink bg-pp-ink text-white font-semibold text-[13.5px] py-[13px] px-[22px] cursor-pointer tracking-[0.02em] hover:bg-pp-black justify-self-start"
              type="submit"
            >
              {data.submitText || "Envoyer le message"}
            </button>
            {data.altLinks?.length > 0 && (
              <div className="flex gap-[22px] flex-wrap mt-1">
                {data.altLinks.map((l, i) => (
                  <a
                    href={l.href || "#"}
                    key={l.id || i}
                    className="text-[13px] underline underline-offset-[3px]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export function ContactBand({ data }) {
  return (
    <section className="bg-pp-ink text-white py-15">
      <div className="max-w-[1080px] mx-auto px-7 flex items-center justify-between gap-[26px] flex-wrap">
        <p
          className="text-[clamp(19px,2.8vw,27px)] font-normal tracking-[-0.015em] max-w-[26ch]"
          dangerouslySetInnerHTML={{
            __html: data.headline || "Un projet ? <b>Parlons-en.</b>",
          }}
        />
        <div className="flex gap-2.5 flex-wrap">
          <a
            className="inline-flex items-center justify-center gap-2 border border-white bg-white text-pp-ink font-semibold text-[13.5px] py-[13px] px-[22px] cursor-pointer tracking-[0.02em] hover:bg-pp-ink-4 hover:text-pp-ink"
            href="#message"
            onClick={e => fireProfileAction('contact', e)}
          >
            {data.ctaText || "Envoyer un message"}
          </a>
          <a
            className="inline-flex items-center justify-center gap-2 border border-white bg-transparent text-white font-semibold text-[13.5px] py-[13px] px-[22px] cursor-pointer tracking-[0.02em] hover:bg-white hover:text-pp-ink"
            href="#inviter"
            onClick={e => fireProfileAction('invite', e)}
          >
            {data.secondaryText || "Inviter dans un projet"}
          </a>
        </div>
      </div>
    </section>
  );
}
