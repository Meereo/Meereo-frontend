import type { StepperItem } from '../core/machine.ts';

/** INS-15 — le fil est DÉRIVÉ de l'état. Aucun nombre d'étapes en dur. */
export function Stepper({ items, onGo }: { items: StepperItem[]; onGo: (id: StepperItem['id']) => void }) {
  const current = items.find(i => i.current);
  return (
    <nav className="mo-stepper" aria-label="Étapes de l’inscription">
      <p className="mo-stepper__count">
        Étape {current?.index ?? 1} sur {current?.total ?? items.length}
      </p>
      <ol>
        {items.map(i => (
          <li key={i.id} className={i.current ? 'is-current' : i.done ? 'is-done' : undefined}>
            <button type="button" disabled={!i.reachable} aria-current={i.current ? 'step' : undefined}
                    onClick={() => i.reachable && onGo(i.id)}>
              <span className="mo-stepper__num" aria-hidden="true">{i.done ? '✓' : i.index}</span>
              {i.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
