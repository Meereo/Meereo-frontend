// ─── Onboarding v2 — Adaptateurs Prisma ─────────────────────────────────────
// 6 ports implémentés contre la base réelle du projet MEEREO.
// ─────────────────────────────────────────────────────────────────────────────

const accountsAdapter = require('./accountsAdapter')
const companiesAdapter = require('./companiesAdapter')
const draftsAdapter = require('./draftsAdapter')
const onboardingTxAdapter = require('./onboardingTxAdapter')
const passwordAdapter = require('./passwordAdapter')
const sessionAdapter = require('./sessionAdapter')

module.exports = {
  accountsAdapter,
  companiesAdapter,
  draftsAdapter,
  onboardingTxAdapter,
  passwordAdapter,
  sessionAdapter,
}
