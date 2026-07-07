/**
 * MEEREO Core Engines — Point d'entrée centralisé
 */

const workflowEngine = require('./workflowEngine')
const eventEngine = require('./eventEngine')
const rulesEngine = require('./rulesEngine')
const permissionEngine = require('./permissionEngine')

module.exports = {
  workflow: workflowEngine,
  events: eventEngine,
  rules: rulesEngine,
  permissions: permissionEngine,
}
