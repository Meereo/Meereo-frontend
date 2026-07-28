import type { ReactNode } from 'react';

export interface FieldProps {
  label: string; name: string; value: string;
  onChange: (v: string) => void; onBlur: () => void;
  error?: string | undefined; hint?: string | undefined;
  type?: string; required?: boolean; autoComplete?: string; placeholder?: string;
}

/** Un champ, une erreur, un lien aria. L'erreur est ANNONCÉE, pas seulement colorée. */
export function Field(p: FieldProps) {
  const errId = `${p.name}-error`; const hintId = `${p.name}-hint`;
  return (
    <div className="mo-field">
      <label htmlFor={p.name}>
        {p.label}{p.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={p.name} name={p.name} type={p.type ?? 'text'} value={p.value}
        autoComplete={p.autoComplete} placeholder={p.placeholder}
        aria-invalid={p.error ? true : undefined}
        aria-describedby={[p.error ? errId : null, p.hint ? hintId : null].filter(Boolean).join(' ') || undefined}
        onChange={e => p.onChange(e.target.value)} onBlur={p.onBlur}
      />
      {p.hint ? <p id={hintId} className="mo-hint">{p.hint}</p> : null}
      {p.error ? <p id={errId} className="mo-error" role="alert">{p.error}</p> : null}
    </div>
  );
}

export function Chips<T extends string>(props: {
  label: string; options: readonly { id: T; label: string }[];
  selected: T[]; onToggle: (id: T) => void; error?: string | undefined;
}) {
  return (
    <fieldset className="mo-chips">
      <legend>{props.label}</legend>
      {props.options.map(o => {
        const on = props.selected.includes(o.id);
        return (
          // INS-11 — le bouton porte son état ET remonte la valeur.
          // Le défaut d'origine ne faisait que basculer une classe CSS.
          <button key={o.id} type="button" aria-pressed={on}
                  className={on ? 'mo-chip mo-chip--on' : 'mo-chip'}
                  onClick={() => props.onToggle(o.id)}>{o.label}</button>
        );
      })}
      {props.error ? <p className="mo-error" role="alert">{props.error}</p> : null}
    </fieldset>
  );
}

export const Actions = ({ children }: { children: ReactNode }) => <div className="mo-actions">{children}</div>;
