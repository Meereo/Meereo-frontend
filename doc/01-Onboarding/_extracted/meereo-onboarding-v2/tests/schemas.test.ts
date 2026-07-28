import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeAccountSchema, proStructureSchema, supplierStructureSchema, productSchema,
  payoutMethodSchema, validate, SAMPLE_RCCM,
} from '../src/core/schemas.ts';
import { checkPassword, PASSWORD_POLICY } from '../src/core/password-policy.ts';
import { normalizeCiPhone, isMobileCi } from '../src/core/phone-ci.ts';

const account = (o: Partial<Record<string, unknown>> = {}) => ({
  firstName: 'Jayem', lastName: 'Troh', email: 'J.Troh@Example.CI ',
  phone: '07 07 12 34 56', city: 'Abidjan', password: 'meereo2026x',
  acceptTerms: true, marketingOptIn: false, ...o,
});

test('mot de passe — 10 caractères, une lettre, un chiffre', () => {
  assert.equal(PASSWORD_POLICY.minLength, 10);
  assert.deepEqual(checkPassword('meereo2026x'), []);
  assert.ok(checkPassword('court1').includes('too-short'));
  assert.ok(checkPassword('abcdefghijkl').includes('no-digit'));
  assert.ok(checkPassword('123456789012').includes('no-letter'));
  assert.deepEqual(checkPassword('MOTDEPASSE1'), [], 'aucune majuscule ni spécial imposé');
});

test('e-mail normalisé en minuscules et débarrassé des espaces', () => {
  const r = validate(makeAccountSchema('PRO'), account());
  assert.ok(r.ok); if (r.ok) assert.equal(r.value.email, 'j.troh@example.ci');
});

test('téléphone — E.164 depuis toutes les formes usuelles', () => {
  for (const v of ['0707123456', '07 07 12 34 56', '+225 07 07 12 34 56', '00225 0707123456'])
    assert.equal(normalizeCiPhone(v), '+2250707123456', v);
  assert.equal(normalizeCiPhone('123'), null);
  assert.ok(isMobileCi('+2250707123456'));
});

test('INS-08 — ville obligatoire pour pro/fournisseur, facultative pour client', () => {
  assert.ok(!validate(makeAccountSchema('PRO'), account({ city: '' })).ok);
  assert.ok(validate(makeAccountSchema('CLIENT'), account({ city: '' })).ok);
});

test('INS-10 — les CGU doivent être acceptées', () => {
  const r = validate(makeAccountSchema('CLIENT'), account({ acceptTerms: false }));
  assert.ok(!r.ok); if (!r.ok) assert.match(r.errors.acceptTerms ?? '', /accepter/i);
});

test('INS-01 — le RCCM d’exemple est refusé, le format est vérifié', () => {
  const base = { legalName: 'Millenium Construction', taxId: '1234567A', sectors: ['gros-oeuvre'] };
  assert.ok(!validate(proStructureSchema, { ...base, rccm: SAMPLE_RCCM }).ok);
  assert.ok(!validate(proStructureSchema, { ...base, rccm: 'ABC' }).ok);
  assert.ok(validate(proStructureSchema, { ...base, rccm: 'CI-ABJ-2024-B-99887' }).ok);
});

test('INS-11 — au moins un secteur d’activité', () => {
  const base = { legalName: 'Millenium', rccm: 'CI-ABJ-2024-B-99887', taxId: '1234567A' };
  assert.ok(!validate(proStructureSchema, { ...base, sectors: [] }).ok);
  assert.ok(validate(proStructureSchema, { ...base, sectors: ['gros-oeuvre', 'vrd'] }).ok);
});

test('MKT-06 — le fournisseur doit déclarer catégories, modes et zones', () => {
  const base = { legalName: 'Millenium', rccm: 'CI-ABJ-2024-B-99887', taxId: '1234567A' };
  assert.ok(!validate(supplierStructureSchema, { ...base, servedCategories: [], deliveryModes: ['livraison'], deliveryZones: ['Abidjan'], deliveryLeadTimeDays: 2 }).ok);
  assert.ok(!validate(supplierStructureSchema, { ...base, servedCategories: ['ciment-liants'], deliveryModes: [], deliveryZones: ['Abidjan'], deliveryLeadTimeDays: 2 }).ok);
  assert.ok(validate(supplierStructureSchema, { ...base, servedCategories: ['ciment-liants'], deliveryModes: ['livraison'], deliveryZones: ['Abidjan'], deliveryLeadTimeDays: 2 }).ok);
});

const product = (o: Record<string, unknown> = {}) => ({
  name: 'Ciment CPJ 45', categoryId: 'ciment-liants', unitId: 'sac', stock: 500,
  pricingMode: 'FIXED', priceFcfa: 5500, ...o,
});

test('FIN-04 — un prix ferme à 0 est refusé : le zéro ne signifie plus « sur devis »', () => {
  const r = validate(productSchema, product({ priceFcfa: 0 }));
  assert.ok(!r.ok);
});
test('FIN-04 — prix ferme sans montant : refusé', () => {
  assert.ok(!validate(productSchema, product({ priceFcfa: null })).ok);
});
test('MKT-01 — « sur devis » sans prix : accepté', () => {
  const r = validate(productSchema, product({ pricingMode: 'ON_QUOTE', priceFcfa: null }));
  assert.ok(r.ok); if (r.ok) assert.equal(r.value.priceFcfa, null);
});
test('MKT-01 — « sur devis » AVEC un prix : refusé', () => {
  assert.ok(!validate(productSchema, product({ pricingMode: 'ON_QUOTE', priceFcfa: 5500 })).ok);
});

test('MKT-06 §4 — l’encaissement exige un numéro MOBILE', () => {
  const base = { provider: 'wave', accountHolder: 'Jayem Troh', isDefault: true };
  assert.ok(validate(payoutMethodSchema, { ...base, phone: '0707123456' }).ok);
  assert.ok(!validate(payoutMethodSchema, { ...base, phone: '2712345678' }).ok);
});
