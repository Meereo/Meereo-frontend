// sections/CoordinatesSection.jsx — PP-10 Coordonnees (3 variantes)

export function CoordMap({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="grid grid-cols-1 max-[760px]:grid-cols-1 min-[761px]:grid-cols-[1fr_1.2fr] gap-[30px]">
          <div>
            <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 mb-[18px] block">
              Coordonnees
            </span>
            <dl className="text-[14.5px]">
              {data.address && (
                <>
                  <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-3.5">
                    Adresse
                  </dt>
                  <dd className="mt-[3px] font-medium">{data.address}</dd>
                </>
              )}
              {data.phone && (
                <>
                  <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-3.5">
                    Telephone
                  </dt>
                  <dd className="mt-[3px] font-medium pp-num">{data.phone}</dd>
                </>
              )}
              {data.email && (
                <>
                  <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-3.5">
                    E-mail
                  </dt>
                  <dd className="mt-[3px] font-medium">{data.email}</dd>
                </>
              )}
              {data.url && (
                <>
                  <dt className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-3 mt-3.5">
                    Sur MEEREO
                  </dt>
                  <dd className="mt-[3px] font-medium">{data.url}</dd>
                </>
              )}
            </dl>
          </div>
          <div
            className="pp-ph aspect-[16/10] relative"
            role="img"
            aria-label="Plan de situation"
          >
            <span className="pp-coord-a-pin" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CoordSheet({ data }) {
  return (
    <section className="py-14">
      <div className="max-w-[1080px] mx-auto px-7">
        <span className="font-pp-mono text-[11px] tracking-[0.14em] uppercase text-pp-ink-3 mb-[18px] block">
          Coordonnees
        </span>
        {data.address && (
          <div className="grid grid-cols-1 max-[560px]:grid-cols-1 max-[560px]:gap-0.5 min-[561px]:grid-cols-[180px_1fr] gap-[18px] py-[13px] border-b border-pp-line first:border-t first:border-pp-ink text-[14.5px] [&:first-of-type]:border-t [&:first-of-type]:border-pp-ink">
            <span className="font-pp-mono text-[11px] tracking-[0.12em] uppercase text-pp-ink-3 pt-[3px]">
              Adresse
            </span>
            <span>{data.address}</span>
          </div>
        )}
        {data.phone && (
          <div className="grid grid-cols-1 max-[560px]:grid-cols-1 max-[560px]:gap-0.5 min-[561px]:grid-cols-[180px_1fr] gap-[18px] py-[13px] border-b border-pp-line text-[14.5px]">
            <span className="font-pp-mono text-[11px] tracking-[0.12em] uppercase text-pp-ink-3 pt-[3px]">
              Telephone
            </span>
            <span className="pp-num">{data.phone}</span>
          </div>
        )}
        {data.email && (
          <div className="grid grid-cols-1 max-[560px]:grid-cols-1 max-[560px]:gap-0.5 min-[561px]:grid-cols-[180px_1fr] gap-[18px] py-[13px] border-b border-pp-line text-[14.5px]">
            <span className="font-pp-mono text-[11px] tracking-[0.12em] uppercase text-pp-ink-3 pt-[3px]">
              E-mail
            </span>
            <a
              href={`mailto:${data.email}`}
              className="underline underline-offset-[3px] font-medium"
            >
              {data.email}
            </a>
          </div>
        )}
        {data.website && (
          <div className="grid grid-cols-1 max-[560px]:grid-cols-1 max-[560px]:gap-0.5 min-[561px]:grid-cols-[180px_1fr] gap-[18px] py-[13px] border-b border-pp-line text-[14.5px]">
            <span className="font-pp-mono text-[11px] tracking-[0.12em] uppercase text-pp-ink-3 pt-[3px]">
              Site Internet
            </span>
            <a
              href="#"
              className="underline underline-offset-[3px] font-medium"
            >
              {data.website}
            </a>
          </div>
        )}
        {data.socials && (
          <div className="grid grid-cols-1 max-[560px]:grid-cols-1 max-[560px]:gap-0.5 min-[561px]:grid-cols-[180px_1fr] gap-[18px] py-[13px] border-b border-pp-line text-[14.5px]">
            <span className="font-pp-mono text-[11px] tracking-[0.12em] uppercase text-pp-ink-3 pt-[3px]">
              Reseaux
            </span>
            <span>{data.socials}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function CoordFooter({ data }) {
  return (
    <section className="bg-pp-ink text-white py-13">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="grid grid-cols-1 max-[760px]:grid-cols-1 max-[760px]:gap-5 min-[761px]:grid-cols-[1.3fr_1fr_1fr_1fr] gap-[26px]">
          <div>
            <div className="text-[19px] font-semibold tracking-[-0.01em]">
              {data.companyName}
            </div>
            <div className="text-[13px] text-pp-ink-4 mt-1">
              {data.category}
            </div>
          </div>
          <div>
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-4 font-medium mb-2.5">
              Adresse
            </h3>
            <p className="text-[13.5px] text-white no-underline leading-[1.7]">
              {data.address}
            </p>
          </div>
          <div>
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-4 font-medium mb-2.5">
              Contact
            </h3>
            <p className="text-[13.5px] text-white no-underline leading-[1.7]">
              {data.phone && (
                <>
                  <a
                    href={`tel:${data.phone.replace(/\s/g, "")}`}
                    className="pp-num text-white no-underline hover:underline hover:underline-offset-[3px]"
                  >
                    {data.phone}
                  </a>
                  <br />
                </>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="text-white no-underline hover:underline hover:underline-offset-[3px]"
                >
                  {data.email}
                </a>
              )}
            </p>
          </div>
          <div>
            <h3 className="font-pp-mono text-[10.5px] tracking-[0.12em] uppercase text-pp-ink-4 font-medium mb-2.5">
              En ligne
            </h3>
            <p className="text-[13.5px] text-white no-underline leading-[1.7]">
              {data.website && (
                <>
                  <a
                    href="#"
                    className="text-white no-underline hover:underline hover:underline-offset-[3px]"
                  >
                    {data.website}
                  </a>
                  <br />
                </>
              )}
              {data.url && (
                <a
                  href="#"
                  className="text-white no-underline hover:underline hover:underline-offset-[3px]"
                >
                  {data.url}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
