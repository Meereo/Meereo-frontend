// sections/PortfolioSection.jsx — PP-05 Portfolio (3 variantes)
// Aucune limite fixe — le bouton « Voir toutes les réalisations » déplie au-delà de 6.
// INS-21 anonymat : clientName et amount masqués par défaut (opt-in showClient/showAmount).

import { useState } from "react";

const VISIBLE_COUNT = 6;

/* ── Légende partagée ── */
function ProjectMeta({ p }) {
  const parts = [
    p.projectType,
    p.location,
    p.status,
  ].filter(Boolean);
  // INS-21 : nom du client et montant seulement sur opt-in
  if (p.showClient && p.clientName) parts.push(p.clientName);
  if (p.showAmount && p.amount) parts.push(p.amount);
  // Toujours afficher year et mission en dernier
  if (p.year) parts.push(p.year);
  if (p.mission) parts.push(p.mission);
  if (parts.length === 0) return null;
  return (
    <span className="block mt-[4px] text-[12px] text-mo-hint tracking-[0.03em]">
      {parts.join(" \u00B7 ").toUpperCase()}
    </span>
  );
}

/* ── Bouton déplier ── */
function ExpandButton({ total, expanded, onToggle }) {
  if (total <= VISIBLE_COUNT) return null;
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-[13px] font-semibold text-mo-muted border border-mo-line rounded-mo-sm px-5 py-2.5 motion-reduce:transition-none transition-colors hover:bg-mo-surface"
      >
        {expanded ? "Réduire" : `Voir toutes les réalisations (${total})`}
      </button>
    </div>
  );
}

/* ── PP-05/A — Grille magazine ───────────────────────────── */

export function PortfolioMagazine({ data }) {
  const [expanded, setExpanded] = useState(false);
  const allProjects = data.projects || [];
  const visible = expanded ? allProjects : allProjects.slice(0, VISIBLE_COUNT);

  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="flex justify-between items-baseline mb-[24px] gap-[16px] flex-wrap">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-mo-text">
            {data.title || "Réalisations"}
          </h2>
          {data.subtitle && (
            <span className="text-[12px] text-mo-hint tracking-[0.03em]">
              {data.subtitle}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
          {visible.map((p, i) => (
            <figure key={p.id || i} className="m-0">
              <div
                className="pp-ph aspect-[4/3] mb-[12px] rounded-mo overflow-hidden"
                role="img"
                aria-label={p.title}
                style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
              />
              <figcaption>
                <b className="block text-[15px] font-semibold text-mo-text">{p.title}</b>
                <ProjectMeta p={p} />
              </figcaption>
            </figure>
          ))}
        </div>
        <ExpandButton total={allProjects.length} expanded={expanded} onToggle={() => setExpanded(e => !e)} />
      </div>
    </section>
  );
}

/* ── PP-05/B — Planches ──────────────────────────────────── */

export function PortfolioPlanches({ data }) {
  const [expanded, setExpanded] = useState(false);
  const allProjects = data.projects || [];
  const visible = expanded ? allProjects : allProjects.slice(0, VISIBLE_COUNT);

  return (
    <section className="py-20 max-[760px]:py-12">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-mo-text">
          {data.title || "Réalisations"}
        </h2>
        {visible.map((p, i) => (
          <div
            key={p.id || i}
            className="grid grid-cols-[1fr_280px] gap-6 py-[26px] border-t border-mo-line max-[760px]:grid-cols-1"
          >
            <div
              className="pp-ph aspect-[21/9] rounded-mo overflow-hidden"
              role="img"
              aria-label={p.title}
              style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
            />
            <div>
              <b className="block text-[18px] font-semibold tracking-[-0.01em] mb-[8px] text-mo-text">{p.title}</b>
              {p.description && <p className="text-[14px] text-mo-muted mb-[14px]">{p.description}</p>}
              <dl className="text-[12.5px]">
                {p.projectType && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Type</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.projectType}</dd>
                  </>
                )}
                {p.location && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Localisation</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.location}</dd>
                  </>
                )}
                {p.status && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">État</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.status}</dd>
                  </>
                )}
                {p.year && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Année</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.year}</dd>
                  </>
                )}
                {p.mission && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Mission réalisée</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.mission}</dd>
                  </>
                )}
                {/* INS-21 : opt-in seulement */}
                {p.showClient && p.clientName && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Client</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.clientName}</dd>
                  </>
                )}
                {p.showAmount && p.amount && (
                  <>
                    <dt className="text-[10.5px] tracking-[0.12em] uppercase text-mo-hint mt-[8px]">Montant</dt>
                    <dd className="m-0 mt-[2px] font-[500]">{p.amount}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        ))}
        <ExpandButton total={allProjects.length} expanded={expanded} onToggle={() => setExpanded(e => !e)} />
      </div>
    </section>
  );
}

/* ── PP-05/C — Mur asymétrique ───────────────────────────── */

export function PortfolioAsymmetric({ data }) {
  const [expanded, setExpanded] = useState(false);
  const allProjects = data.projects || [];
  const visible = expanded ? allProjects : allProjects.slice(0, VISIBLE_COUNT);

  return (
    <section className="py-20 max-[760px]:py-12 bg-mo-surface">
      <div className="max-w-[1080px] mx-auto px-7">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-mo-text mb-[24px]">
          {data.title || "Réalisations"}
        </h2>
        <div className="grid grid-cols-2 gap-6 max-[560px]:grid-cols-1">
          {visible.map((p, i) => (
            <figure
              key={p.id || i}
              className={`m-0${i === 0 ? " col-span-2 max-[560px]:col-span-1" : ""}`}
            >
              <div
                className={`pp-ph ${i === 0 ? "aspect-[21/9]" : "aspect-[4/3]"} rounded-mo overflow-hidden`}
                role="img"
                aria-label={p.title}
                style={p.src ? { background: `url(${p.src}) center/cover`, border: "none" } : undefined}
              />
              <figcaption className="flex justify-between gap-[12px] items-baseline">
                <b className="text-[14.5px] font-semibold text-mo-text">{p.title}</b>
                <ProjectMeta p={p} />
              </figcaption>
            </figure>
          ))}
        </div>
        <ExpandButton total={allProjects.length} expanded={expanded} onToggle={() => setExpanded(e => !e)} />
      </div>
    </section>
  );
}
