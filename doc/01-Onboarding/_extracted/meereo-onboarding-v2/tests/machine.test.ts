import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, setRole, setStepData, advance, goBack, canGoTo, stepper, isComplete } from '../src/core/machine.ts';
import { inputStepsOf } from '../src/core/steps.ts';

const acc = { firstName: 'Jayem', lastName: 'Troh', email: 'a@b.ci', phone: '0707123456', city: 'Abidjan', password: 'meereo2026x', acceptTerms: true, marketingOptIn: false };
const proStruct = { legalName: 'Millenium', rccm: 'CI-ABJ-2024-B-99887', taxId: '1234567A', sectors: ['gros-oeuvre'] };

test('INS-15 — le fil est dérivé du rôle : 2 / 4 / 6 étapes de saisie', () => {
  assert.equal(inputStepsOf('CLIENT').length, 2, 'client : rôle + compte (étape projet supprimée le 27/07)');
  assert.equal(inputStepsOf('PRO').length, 4);
  assert.equal(inputStepsOf('FOURNISSEUR').length, 6, 'dont l’encaissement MKT-06 §4');
});

test('le parcours client ne contient plus d’étape projet', () => {
  assert.ok(!inputStepsOf('CLIENT').some(s => s.id.includes('project')));
});

test('INS-06 — impossible d’avancer sans valider l’étape courante', () => {
  let s = setRole(initialState(), 'PRO');
  assert.equal(s.step, 'account');
  assert.equal(advance(s).step, 'account', 'bloqué : compte invalide');
  s = setStepData(s, 'account', acc);
  assert.equal(advance(s).step, 'pro-structure');
});

test('INS-06 — le retour arrière est toujours permis et ne perd rien', () => {
  let s = setRole(initialState(), 'PRO');
  s = setStepData(s, 'account', acc); s = advance(s);
  s = setStepData(s, 'pro-structure', proStruct);
  const back = goBack(s);
  assert.equal(back.step, 'account');
  assert.deepEqual(back.data['pro-structure'], proStruct, 'aucune donnée perdue');
  assert.ok(canGoTo(back, 'pro-structure'));
});

test('INS-12 — l’étape logo est franchissable sans fichier', () => {
  let s = setRole(initialState(), 'PRO');
  s = setStepData(s, 'account', acc); s = advance(s);
  s = setStepData(s, 'pro-structure', proStruct); s = advance(s);
  assert.equal(s.step, 'pro-logo');
  assert.equal(advance(s).step, 'pro-done', 'franchissable sans rien saisir');
});

test('la garde interdit de sauter une étape obligatoire', () => {
  const s = setRole(initialState(), 'FOURNISSEUR');
  assert.ok(!canGoTo(s, 'supplier-payout'));
  assert.ok(canGoTo(s, 'account'));
});

test('changer de rôle conserve le compte et écarte les étapes de l’ancien rôle', () => {
  let s = setRole(initialState(), 'FOURNISSEUR');
  s = setStepData(s, 'account', acc);
  s = setStepData(s, 'supplier-payout', { provider: 'wave' });
  const s2 = setRole(s, 'PRO');
  assert.deepEqual(s2.data.account, acc);
  assert.equal(s2.data['supplier-payout'], undefined);
});

test('le fil affiché reflète l’avancement réel', () => {
  let s = setRole(initialState(), 'PRO');
  s = setStepData(s, 'account', acc); s = advance(s);
  const items = stepper(s);
  assert.equal(items.length, 4);
  assert.ok(items.find(i => i.id === 'account')!.done);
  assert.ok(items.find(i => i.id === 'pro-structure')!.current);
  assert.ok(!items.find(i => i.id === 'pro-logo')!.done);
});

test('isComplete — vrai seulement quand toutes les étapes obligatoires valident', () => {
  let s = setRole(initialState(), 'CLIENT');
  assert.ok(!isComplete(s));
  s = setStepData(s, 'account', acc);
  assert.ok(isComplete(s));
});
