import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSupplier, assessPro, completionMessage } from '../src/core/publish-guard.ts';
import { maxBytesFor, MAX_BYTES_DEFAULT, MAX_BYTES_PLAN } from '../src/adapters/storage/local-fs.ts';

test('MKT-06 — sans encaissement, le fournisseur ne peut ni vendre ni publier', () => {
  const r = assessSupplier({ hasPayoutMethod: false, productCount: 3, hasLogo: true, hasDeliveryZones: true });
  assert.equal(r.canSell, false);
  assert.equal(r.canPublishPage, false);
  assert.match(completionMessage(r), /encaissement/);
});

test('produit facultatif — la page est publiable, la vente ne l’est pas encore', () => {
  const r = assessSupplier({ hasPayoutMethod: true, productCount: 0, hasLogo: false, hasDeliveryZones: true });
  assert.equal(r.canPublishPage, true);
  assert.equal(r.canSell, false);
  assert.ok(r.warnings.some(w => /catalogue/.test(w)), 'on signale sans bloquer');
});

test('pro — au moins un secteur est requis pour publier', () => {
  assert.equal(assessPro({ sectorCount: 0, hasLogo: true, hasPresentation: true }).canPublishPage, false);
  assert.equal(assessPro({ sectorCount: 2, hasLogo: false, hasPresentation: false }).canPublishPage, true);
});

test('SYS-05 — 10 Mo par défaut, 50 Mo pour les plans', () => {
  assert.equal(maxBytesFor('logo.png'), MAX_BYTES_DEFAULT);
  assert.equal(maxBytesFor('plan-rdc.pdf'), MAX_BYTES_PLAN);
  assert.equal(maxBytesFor('coupe.DWG'), MAX_BYTES_PLAN);
});
