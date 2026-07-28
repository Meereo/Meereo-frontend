/** Les écrans d'étape. Chacun lit son schéma depuis le noyau — aucune règle
 *  de validation n'est réécrite ici. */
import { useEffect, useRef, useState } from 'react';
import { Field, Chips, Actions } from './Field.tsx';
import { useStepForm } from './useStepForm.ts';
import { api } from './api-client.ts';
import { PASSWORD_HINT } from '../core/password-policy.ts';
import {
  makeAccountSchema, proStructureSchema, supplierStructureSchema,
  productSchema, payoutMethodSchema, type Role,
} from '../core/schemas.ts';
import {
  PRO_SECTORS, MARKETPLACE_CATEGORIES, SALE_UNITS, PAYOUT_PROVIDERS, DELIVERY_MODES,
} from '../core/reference-data.ts';

/* ── Rôle ─────────────────────────────────────────────────────── */

const ROLES: { id: Role; title: string; desc: string }[] = [
  { id: 'CLIENT',      title: 'Client',        desc: 'Je fais construire ou rénover.' },
  { id: 'PRO',         title: 'Professionnel', desc: 'Je réalise des travaux.' },
  { id: 'FOURNISSEUR', title: 'Fournisseur',   desc: 'Je vends des matériaux.' },
];

export function RoleStep({ value, onPick }: { value: Role | null; onPick: (r: Role) => void }) {
  return (
    <section>
      <h2>Vous êtes…</h2>
      <div className="mo-roles" role="radiogroup" aria-label="Votre profil">
        {ROLES.map(r => (
          <button key={r.id} type="button" role="radio" aria-checked={value === r.id}
                  className={value === r.id ? 'mo-role is-on' : 'mo-role'} onClick={() => onPick(r.id)}>
            <strong>{r.title}</strong><span>{r.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── Compte ───────────────────────────────────────────────────── */

export function AccountStep(props: {
  role: Role; initial?: Record<string, unknown>;
  onValid: (v: unknown) => void; onBack?: () => void;
}) {
  const schema = makeAccountSchema(props.role);
  const f = useStepForm(schema, { marketingOptIn: false, acceptTerms: false, ...props.initial });
  const [emailState, setEmailState] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const [otherRoles, setOtherRoles] = useState<Role[]>([]);
  const lastAsked = useRef<string>('');

  const email = String(f.values.email ?? '');
  const emailFormatError = f.errorOf('email');

  useEffect(() => {
    // ⚠️ Défaut corrigé, à ne pas réintroduire : cet effet dépendait d'un objet
    // recréé à chaque rendu. Il bouclait, restait en « checking », et le bouton
    // « Continuer » demeurait désactivé — parcours inutilisable alors que
    // TOUTES les règles de validation étaient correctes.
    // Les dépendances doivent rester des CHAÎNES stables.
    if (!email || emailFormatError) { setEmailState('idle'); return }
    if (lastAsked.current === `${email}|${props.role}`) return;
    lastAsked.current = `${email}|${props.role}`;
    let cancelled = false;
    setEmailState('checking');
    api.emailAvailable(email, props.role).then(r => {
      if (cancelled) return;
      if (r.ok) { setEmailState(r.data.available ? 'free' : 'taken'); setOtherRoles(r.data.usedByOtherRoles) }
      else setEmailState('idle');
    });
    return () => { cancelled = true };
  }, [email, emailFormatError, props.role]);

  return (
    <section>
      <h2>Votre compte</h2>
      <Field label="Prénom" name="firstName" required value={String(f.values.firstName ?? '')}
             onChange={v => f.set('firstName', v)} onBlur={() => f.blur('firstName')} error={f.errorOf('firstName')} autoComplete="given-name" />
      <Field label="Nom" name="lastName" required value={String(f.values.lastName ?? '')}
             onChange={v => f.set('lastName', v)} onBlur={() => f.blur('lastName')} error={f.errorOf('lastName')} autoComplete="family-name" />
      <Field label="Adresse e-mail" name="email" type="email" required value={email}
             onChange={v => f.set('email', v)} onBlur={() => f.blur('email')}
             error={emailState === 'taken' ? 'Un compte de ce type existe déjà avec cette adresse.' : f.errorOf('email')}
             autoComplete="email" />
      {emailState === 'free' && otherRoles.length > 0 ? (
        <p className="mo-note">
          Cette adresse porte déjà un compte {otherRoles.join(', ')}. Vos comptes resteront distincts ;
          vous pourrez passer de l’un à l’autre sans vous reconnecter.
        </p>
      ) : null}
      <Field label="Téléphone" name="phone" type="tel" required value={String(f.values.phone ?? '')}
             onChange={v => f.set('phone', v)} onBlur={() => f.blur('phone')} error={f.errorOf('phone')}
             hint="Ex. : +225 07 07 12 34 56" autoComplete="tel" />
      <Field label="Ville" name="city" required={props.role !== 'CLIENT'} value={String(f.values.city ?? '')}
             onChange={v => f.set('city', v)} onBlur={() => f.blur('city')} error={f.errorOf('city')} autoComplete="address-level2" />
      <Field label="Mot de passe" name="password" type="password" required value={String(f.values.password ?? '')}
             onChange={v => f.set('password', v)} onBlur={() => f.blur('password')} error={f.errorOf('password')}
             hint={PASSWORD_HINT} autoComplete="new-password" />

      <label className="mo-check">
        <input type="checkbox" checked={f.values.acceptTerms === true}
               onChange={e => f.set('acceptTerms', e.target.checked)} onBlur={() => f.blur('acceptTerms')} />
        J’accepte les <a href="/legal/cgu" target="_blank" rel="noreferrer">conditions générales d’utilisation</a> et la{' '}
        <a href="/legal/confidentialite" target="_blank" rel="noreferrer">politique de confidentialité</a>.
      </label>
      {f.errorOf('acceptTerms') ? <p className="mo-error" role="alert">{f.errorOf('acceptTerms')}</p> : null}

      <label className="mo-check">
        <input type="checkbox" checked={f.values.marketingOptIn === true}
               onChange={e => f.set('marketingOptIn', e.target.checked)} />
        Je souhaite recevoir les actualités de MEEREO. <span className="mo-hint">(facultatif)</span>
      </label>

      <Actions>
        {props.onBack ? <button type="button" onClick={props.onBack}>Retour</button> : null}
        {/* INS-06 — l'état du bouton est DÉRIVÉ. Jamais posé à la main. */}
        <button type="button" className="mo-primary"
                disabled={!f.isValid || emailState === 'checking' || emailState === 'taken'}
                onClick={() => f.parsedValue && props.onValid(f.parsedValue)}>
          Continuer
        </button>
      </Actions>
    </section>
  );
}

/* ── Structures ───────────────────────────────────────────────── */

function IdentityFields(f: ReturnType<typeof useStepForm>) {
  return (
    <>
      <Field label="Raison sociale" name="legalName" required value={String(f.values.legalName ?? '')}
             onChange={v => f.set('legalName', v)} onBlur={() => f.blur('legalName')} error={f.errorOf('legalName')} />
      <Field label="Numéro RCCM" name="rccm" required value={String(f.values.rccm ?? '')}
             onChange={v => f.set('rccm', v)} onBlur={() => f.blur('rccm')} error={f.errorOf('rccm')}
             hint="Format : CI-ABJ-AAAA-X-NNNNN" />
      <Field label="Numéro de contribuable" name="taxId" required value={String(f.values.taxId ?? '')}
             onChange={v => f.set('taxId', v)} onBlur={() => f.blur('taxId')} error={f.errorOf('taxId')} />
      {/* INS-20 — la vérification d'unicité est faite par le serveur ET par la base.
          On ne promet rien ici que la base ne garantisse. */}
    </>
  );
}

export function ProStructureStep(p: { initial?: Record<string, unknown>; onValid: (v: unknown) => void; onBack: () => void }) {
  const f = useStepForm(proStructureSchema, { sectors: [], ...p.initial });
  const sectors = (f.values.sectors as string[]) ?? [];
  return (
    <section>
      <h2>Votre entreprise</h2>
      {IdentityFields(f)}
      <Chips label="Secteurs d’activité" options={PRO_SECTORS} selected={sectors as never[]}
             onToggle={id => f.set('sectors', sectors.includes(id) ? sectors.filter(x => x !== id) : [...sectors, id])}
             error={f.errorOf('sectors')} />
      <Actions>
        <button type="button" onClick={p.onBack}>Retour</button>
        <button type="button" className="mo-primary" disabled={!f.isValid}
                onClick={() => f.parsedValue && p.onValid(f.parsedValue)}>Continuer</button>
      </Actions>
    </section>
  );
}

export function SupplierStructureStep(p: { initial?: Record<string, unknown>; onValid: (v: unknown) => void; onBack: () => void }) {
  const f = useStepForm(supplierStructureSchema, { servedCategories: [], deliveryModes: [], deliveryZones: [], deliveryLeadTimeDays: null, ...p.initial });
  const cats = (f.values.servedCategories as string[]) ?? [];
  const modes = (f.values.deliveryModes as string[]) ?? [];
  const zones = (f.values.deliveryZones as string[]) ?? [];
  return (
    <section>
      <h2>Votre entreprise</h2>
      {IdentityFields(f)}
      <Chips label="Catégories vendues" options={MARKETPLACE_CATEGORIES} selected={cats as never[]}
             onToggle={id => f.set('servedCategories', cats.includes(id) ? cats.filter(x => x !== id) : [...cats, id])}
             error={f.errorOf('servedCategories')} />
      <Chips label="Modes de livraison" options={DELIVERY_MODES} selected={modes as never[]}
             onToggle={id => f.set('deliveryModes', modes.includes(id) ? modes.filter(x => x !== id) : [...modes, id])}
             error={f.errorOf('deliveryModes')} />
      <Field label="Zones de livraison" name="deliveryZones" required value={zones.join(', ')}
             onChange={v => f.set('deliveryZones', v.split(',').map(s => s.trim()).filter(Boolean))}
             onBlur={() => f.blur('deliveryZones')} error={f.errorOf('deliveryZones')}
             hint="Séparez par des virgules. Ex. : Abidjan, Bassam, Yamoussoukro" />
      <Field label="Délai de livraison (jours)" name="deliveryLeadTimeDays" type="number"
             value={String(f.values.deliveryLeadTimeDays ?? '')}
             onChange={v => f.set('deliveryLeadTimeDays', v === '' ? null : Number(v))}
             onBlur={() => f.blur('deliveryLeadTimeDays')} error={f.errorOf('deliveryLeadTimeDays')} />
      <Actions>
        <button type="button" onClick={p.onBack}>Retour</button>
        <button type="button" className="mo-primary" disabled={!f.isValid}
                onClick={() => f.parsedValue && p.onValid(f.parsedValue)}>Continuer</button>
      </Actions>
    </section>
  );
}

/* ── Logo (INS-12) ────────────────────────────────────────────── */

export function LogoStep(p: { onValid: (v: unknown) => void; onSkip: () => void; onBack: () => void }) {
  const [asset, setAsset] = useState<{ assetId: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <section>
      <h2>Votre logo</h2>
      {/* INS-12 — étape FRANCHISSABLE. Aucune image de repli n'est produite :
          le monogramme est CALCULÉ à l'affichage par le composant de QAL-07. */}
      <p className="mo-note">
        Facultatif. Sans logo, vos initiales vous représentent — vous pourrez en ajouter un à tout moment.
      </p>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
             onChange={async e => {
               const file = e.target.files?.[0]; if (!file) return;
               setError(null);
               const b64 = btoa(String.fromCharCode(...new Uint8Array(await file.arrayBuffer())));
               const r = await api.uploadLogo(file.name, file.type, b64);
               if (r.ok) setAsset(r.data);
               else setError('Ce fichier a été refusé. Vérifiez son format et son poids (10 Mo maximum).');
             }} />
      {asset ? <img src={asset.url} alt="Aperçu de votre logo" className="mo-logo-preview" /> : null}
      {error ? <p className="mo-error" role="alert">{error}</p> : null}
      <Actions>
        <button type="button" onClick={p.onBack}>Retour</button>
        <button type="button" onClick={p.onSkip}>Passer cette étape</button>
        <button type="button" className="mo-primary" disabled={!asset}
                onClick={() => asset && p.onValid({ logoAssetId: asset.assetId })}>Continuer</button>
      </Actions>
    </section>
  );
}

/* ── Encaissement (MKT-06 §4) ─────────────────────────────────── */

export function SupplierPayoutStep(p: { initial?: Record<string, unknown>; onValid: (v: unknown) => void; onBack: () => void }) {
  const f = useStepForm(payoutMethodSchema, { isDefault: true, ...p.initial });
  return (
    <section>
      <h2>Comment serez-vous payé ?</h2>
      {/* MKT-06 §4 — MEEREO n'encaisse pas à votre place : sans ce moyen de
          réception, aucune vente n'est possible et rien ne peut être rattrapé. */}
      <p className="mo-note">Les acheteurs vous règlent directement. Ce numéro reçoit vos paiements.</p>
      <fieldset className="mo-chips">
        <legend>Opérateur</legend>
        {PAYOUT_PROVIDERS.map(o => (
          <button key={o.id} type="button" aria-pressed={f.values.provider === o.id}
                  className={f.values.provider === o.id ? 'mo-chip mo-chip--on' : 'mo-chip'}
                  onClick={() => f.set('provider', o.id)}>{o.label}</button>
        ))}
        {f.errorOf('provider') ? <p className="mo-error" role="alert">{f.errorOf('provider')}</p> : null}
      </fieldset>
      <Field label="Numéro mobile" name="phone" type="tel" required value={String(f.values.phone ?? '')}
             onChange={v => f.set('phone', v)} onBlur={() => f.blur('phone')} error={f.errorOf('phone')}
             hint="Un numéro mobile est requis : le Mobile Money n’accepte pas les lignes fixes." />
      <Field label="Titulaire du compte" name="accountHolder" required value={String(f.values.accountHolder ?? '')}
             onChange={v => f.set('accountHolder', v)} onBlur={() => f.blur('accountHolder')} error={f.errorOf('accountHolder')} />
      <Actions>
        <button type="button" onClick={p.onBack}>Retour</button>
        <button type="button" className="mo-primary" disabled={!f.isValid}
                onClick={() => f.parsedValue && p.onValid(f.parsedValue)}>Continuer</button>
      </Actions>
    </section>
  );
}

/* ── Premier produit (facultatif) ─────────────────────────────── */

export function SupplierProductStep(p: { onValid: (v: unknown) => void; onSkip: () => void; onBack: () => void }) {
  const f = useStepForm(productSchema, { pricingMode: 'FIXED', priceFcfa: null, stock: 0 });
  const onQuote = f.values.pricingMode === 'ON_QUOTE';
  return (
    <section>
      <h2>Votre premier produit</h2>
      <p className="mo-note">Facultatif. Vous pourrez enrichir votre catalogue depuis votre espace.</p>
      <Field label="Nom du produit" name="name" required value={String(f.values.name ?? '')}
             onChange={v => f.set('name', v)} onBlur={() => f.blur('name')} error={f.errorOf('name')} />
      <fieldset className="mo-chips">
        <legend>Catégorie</legend>
        {MARKETPLACE_CATEGORIES.map(o => (
          <button key={o.id} type="button" aria-pressed={f.values.categoryId === o.id}
                  className={f.values.categoryId === o.id ? 'mo-chip mo-chip--on' : 'mo-chip'}
                  onClick={() => f.set('categoryId', o.id)}>{o.label}</button>
        ))}
      </fieldset>
      <fieldset className="mo-chips">
        <legend>Unité de vente</legend>
        {SALE_UNITS.map(o => (
          <button key={o.id} type="button" aria-pressed={f.values.unitId === o.id}
                  className={f.values.unitId === o.id ? 'mo-chip mo-chip--on' : 'mo-chip'}
                  onClick={() => f.set('unitId', o.id)}>{o.label}</button>
        ))}
      </fieldset>
      <Field label="Stock disponible" name="stock" type="number" required value={String(f.values.stock ?? '')}
             onChange={v => f.set('stock', v === '' ? 0 : Number(v))} onBlur={() => f.blur('stock')} error={f.errorOf('stock')} />

      {/* FIN-04 — « sur devis » est un ÉTAT, pas un prix à zéro.
          Le champ prix est MASQUÉ, pas grisé : un champ grisé laisse croire
          qu'une valeur existe quelque part. */}
      <fieldset className="mo-chips">
        <legend>Prix</legend>
        <button type="button" aria-pressed={!onQuote} className={!onQuote ? 'mo-chip mo-chip--on' : 'mo-chip'}
                onClick={() => { f.set('pricingMode', 'FIXED'); f.set('priceFcfa', null) }}>Prix ferme</button>
        <button type="button" aria-pressed={onQuote} className={onQuote ? 'mo-chip mo-chip--on' : 'mo-chip'}
                onClick={() => { f.set('pricingMode', 'ON_QUOTE'); f.set('priceFcfa', null) }}>Sur devis</button>
      </fieldset>
      {!onQuote ? (
        <Field label="Prix (FCFA)" name="priceFcfa" type="number" required value={String(f.values.priceFcfa ?? '')}
               onChange={v => f.set('priceFcfa', v === '' ? null : Number(v))}
               onBlur={() => f.blur('priceFcfa')} error={f.errorOf('priceFcfa')} />
      ) : (
        <p className="mo-note">Les acheteurs vous adresseront une demande de devis depuis la Marketplace.</p>
      )}

      <Actions>
        <button type="button" onClick={p.onBack}>Retour</button>
        <button type="button" onClick={p.onSkip}>Passer cette étape</button>
        <button type="button" className="mo-primary" disabled={!f.isValid}
                onClick={() => f.parsedValue && p.onValid(f.parsedValue)}>Continuer</button>
      </Actions>
    </section>
  );
}

/* ── Fin ──────────────────────────────────────────────────────── */

export function DoneStep(p: { role: Role; emailSent: boolean; email: string; warnings: string[] }) {
  return (
    <section>
      <h2>Votre compte est créé</h2>
      {/* INS-09 — la porte de correction. Le bandeau AFFICHE L'ADRESSE :
          sans elle, l'utilisateur ne peut pas voir sa faute de frappe, et
          c'est justement parce qu'il ne reçoit rien qu'il est là. */}
      <div className="mo-banner" role="status">
        <p><strong>Confirmez votre adresse</strong> — {p.emailSent
          ? <>un lien vient d’être envoyé à <strong>{p.email}</strong>.</>
          : <>nous n’avons pas pu envoyer le lien à <strong>{p.email}</strong>.</>}</p>
        <div className="mo-actions">
          <button type="button">Renvoyer le lien</button>
          <button type="button">Corriger mon adresse</button>
        </div>
      </div>
      {p.warnings.length ? (
        <ul className="mo-warnings">{p.warnings.map(w => <li key={w}>{w}</li>)}</ul>
      ) : null}
      {p.role !== 'CLIENT' ? (
        // Décision 27/07 — la page publique existe mais reste en BROUILLON.
        <p className="mo-note">
          Votre page publique est créée en <strong>brouillon</strong>. Elle ne sera visible qu’une fois
          publiée depuis votre espace.
        </p>
      ) : null}
      <a className="mo-primary" href="/espace">Accéder à mon espace</a>
    </section>
  );
}
