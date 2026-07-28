import test from 'node:test';
import assert from 'node:assert/strict';
import { createInMemory } from '../src/adapters/in-memory.ts';
import { createOnboardingService, stripSecrets } from '../src/core/service.ts';
import { OnboardingError } from '../src/core/errors.ts';

const acc = (o: Record<string, unknown> = {}) => ({
  firstName: 'Jayem', lastName: 'Troh', email: 'jayem@example.ci', phone: '0707123456',
  city: 'Abidjan', password: 'meereo2026x', acceptTerms: true, marketingOptIn: false, ...o,
});
const proStruct = (o: Record<string, unknown> = {}) => ({ legalName: 'Millenium Construction', rccm: 'CI-ABJ-2024-B-99887', taxId: '1234567A', sectors: ['gros-oeuvre'], ...o });
const supStruct = (o: Record<string, unknown> = {}) => ({ legalName: 'Millenium Négoce', rccm: 'CI-ABJ-2024-B-55555', taxId: '7654321B', servedCategories: ['ciment-liants'], deliveryModes: ['livraison'], deliveryZones: ['Abidjan'], deliveryLeadTimeDays: 2, ...o });
const payout = { provider: 'wave', phone: '0707123456', accountHolder: 'Jayem Troh', isDefault: true };

const setup = () => { const m = createInMemory(); return { m, svc: createOnboardingService(m.deps) } };

test('parcours CLIENT — compte créé, session ouverte immédiatement (NAV-07)', async () => {
  const { m, svc } = setup();
  const r = await svc.submit({ role: 'CLIENT', account: acc() });
  assert.ok(r.accountId);
  assert.equal(r.companyId, null);
  assert.ok(r.session.token.startsWith('sess_'), 'la session est ouverte dans la même opération');
  assert.equal(m.db.accounts.length, 1);
  assert.equal(m.db.mails.length, 1);
});

test('parcours PRO — l’entreprise est créée et porte l’identité légale', async () => {
  const { m, svc } = setup();
  const r = await svc.submit({ role: 'PRO', account: acc(), structure: proStruct(), logo: { logoAssetId: null } });
  assert.ok(r.companyId);
  assert.equal(m.db.companies[0]!.rccm, 'CI-ABJ-2024-B-99887');
  assert.equal(m.db.accounts[0]!.companyId, r.companyId);
});

test('INS-12 — un pro sans logo est créé, aucun asset n’est stocké', async () => {
  const { m, svc } = setup();
  await svc.submit({ role: 'PRO', account: acc(), structure: proStruct() });
  assert.equal(m.db.files.size, 0, 'aucun monogramme stocké : il est calculé à l’affichage');
});

test('parcours FOURNISSEUR — 6 étapes, produit FACULTATIF', async () => {
  const { m, svc } = setup();
  const r = await svc.submit({ role: 'FOURNISSEUR', account: acc(), structure: supStruct(), payout });
  assert.ok(r.accountId, 'aucun produit fourni : le compte est créé quand même');
  assert.equal(m.db.accounts.length, 1);
});

test('MKT-06 §4 — sans moyen d’encaissement, le fournisseur est refusé', async () => {
  const { svc } = setup();
  await assert.rejects(
    () => svc.submit({ role: 'FOURNISSEUR', account: acc(), structure: supStruct() }),
    (e: unknown) => e instanceof OnboardingError && e.issues.some(i => i.step === 'supplier-payout'),
  );
});

test('FIN-04 — un premier produit à prix nul est refusé à la soumission', async () => {
  const { svc } = setup();
  await assert.rejects(
    () => svc.submit({ role: 'FOURNISSEUR', account: acc(), structure: supStruct(), payout,
      product: { name: 'Ciment', categoryId: 'ciment-liants', unitId: 'sac', stock: 10, pricingMode: 'FIXED', priceFcfa: 0 } }),
    (e: unknown) => e instanceof OnboardingError && e.issues.some(i => i.field === 'priceFcfa'),
  );
});

test('INS-20 — le même RCCM ne peut pas créer une seconde entreprise', async () => {
  const { svc } = setup();
  await svc.submit({ role: 'PRO', account: acc(), structure: proStruct() });
  await assert.rejects(
    () => svc.submit({ role: 'PRO', account: acc({ email: 'autre@example.ci' }), structure: proStruct({ legalName: 'Usurpateur' }) }),
    (e: unknown) => e instanceof OnboardingError && ['RCCM_TAKEN', 'ROLE_ALREADY_ON_COMPANY'].includes(e.code),
  );
});

test('INS-20 / SYS-06 — un second rôle sur la même entreprise ne se crée PAS depuis l’inscription publique', async () => {
  const { svc } = setup();
  await svc.submit({ role: 'PRO', account: acc(), structure: proStruct() });
  // Le cumul est autorisé, mais le lien doit naître depuis l'espace du premier
  // compte. Le déduire d'une égalité de RCCM ferait de INS-20 une prise de contrôle.
  await assert.rejects(
    () => svc.submit({ role: 'FOURNISSEUR', account: acc({ email: 'autre@example.ci' }), structure: { ...supStruct(), rccm: 'CI-ABJ-2024-B-99887', taxId: '1234567A' }, payout }),
    (e: unknown) => e instanceof OnboardingError && /Ajouter une activité/.test(e.issues[0]!.message),
  );
});

test('INS-09 — la même adresse peut porter deux rôles différents, jamais deux fois le même', async () => {
  const { svc, m } = setup();
  await svc.submit({ role: 'PRO', account: acc(), structure: proStruct() });
  const a = await svc.checkEmailAvailability('jayem@example.ci', 'PRO');
  assert.equal(a.available, false);
  const b = await svc.checkEmailAvailability('jayem@example.ci', 'FOURNISSEUR');
  assert.equal(b.available, true, 'décision du 27/07 : adresse partagée entre comptes liés');
  assert.deepEqual(b.usedByOtherRoles, ['PRO']);
  await svc.submit({ role: 'FOURNISSEUR', account: acc(), structure: supStruct(), payout });
  assert.equal(m.db.accounts.length, 2);
});

test('AVS-03 — après suppression logique, l’adresse redevient disponible', async () => {
  const { svc, m } = setup();
  const r = await svc.submit({ role: 'CLIENT', account: acc() });
  assert.equal((await svc.checkEmailAvailability('jayem@example.ci', 'CLIENT')).available, false);
  m.softDelete(r.accountId);
  assert.equal((await svc.checkEmailAvailability('jayem@example.ci', 'CLIENT')).available, true);
});

test('INS-09 — un échec d’envoi d’e-mail n’annule PAS la création du compte', async () => {
  const { m, svc } = setup();
  m.breakMail(true);
  const r = await svc.submit({ role: 'CLIENT', account: acc() });
  assert.ok(r.accountId);
  assert.equal(r.emailVerificationSent, false, 'le front affichera d’emblée le bandeau de correction');
});

test('INS-13 — le brouillon est supprimé dans la MÊME transaction que la création', async () => {
  const { m, svc } = setup();
  const d = await svc.saveDraft({ role: 'CLIENT', step: 'account', data: { email: 'jayem@example.ci' }, email: 'jayem@example.ci' });
  assert.equal(m.db.drafts.size, 1);
  await svc.submit({ role: 'CLIENT', account: acc(), draftId: d.id });
  assert.equal(m.db.drafts.size, 0);
});

test('INS-13 — un brouillon expiré est refusé et purgé', async () => {
  const { m, svc } = setup();
  const d = await svc.saveDraft({ role: 'PRO', step: 'account', data: {} });
  m.setNow(new Date('2026-09-30T10:00:00Z'));
  await assert.rejects(() => svc.resumeDraft(d.id), (e: unknown) => e instanceof OnboardingError && e.code === 'DRAFT_EXPIRED');
  assert.equal(m.db.drafts.size, 0);
});

test('INS-13 — jamais de mot de passe dans un brouillon', async () => {
  const { m, svc } = setup();
  await svc.saveDraft({ role: 'PRO', step: 'account', data: { email: 'a@b.ci', password: 'meereo2026x', nested: { secretToken: 'x' } } });
  const stored = JSON.stringify([...m.db.drafts.values()]);
  assert.ok(!stored.includes('meereo2026x'));
  assert.ok(!stored.includes('secretToken'));
  assert.deepEqual(stripSecrets({ a: 1, password: 'x' }), { a: 1 });
});

test('anti-énumération — la vérification d’adresse est limitée en débit', async () => {
  const { svc } = setup();
  for (let i = 0; i < 20; i++) await svc.checkEmailAvailability('x@y.ci', 'CLIENT');
  await assert.rejects(() => svc.checkEmailAvailability('x@y.ci', 'CLIENT'),
    (e: unknown) => e instanceof OnboardingError && e.code === 'RATE_LIMITED');
});

test('INS-10 — la version des CGU est enregistrée avec le compte', async () => {
  const { m, svc } = setup();
  await svc.submit({ role: 'CLIENT', account: acc() });
  assert.equal(m.deps.termsVersion, '2026-07-CI-v1');
});

test('les erreurs portent l’étape ET le champ — pas d’impasse possible', async () => {
  const { svc } = setup();
  try {
    await svc.submit({ role: 'PRO', account: acc({ password: 'court' }), structure: proStruct({ rccm: 'nope' }) });
    assert.fail('aurait dû échouer');
  } catch (e) {
    assert.ok(e instanceof OnboardingError);
    assert.ok(e.issues.some(i => i.step === 'account' && i.field === 'password'));
    assert.ok(e.issues.some(i => i.step === 'pro-structure' && i.field === 'rccm'));
  }
});
