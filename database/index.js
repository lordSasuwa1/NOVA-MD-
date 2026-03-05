/**
 * NOVA-MD — database/index.js
 * Initialise et exporte toutes les bases de données
 */

const users    = require('./users.db')
const groups   = require('./groups.db')
const games    = require('./games.db')
const sessions = require('./sessions.db')
const settings = require('./settings.db')

function initAll() {
  users.init()
  groups.init()
  games.init()
  sessions.init()
  settings.init()
  console.log('[DATABASE] ✅ Toutes les bases de données initialisées')
}

module.exports = {
  init: initAll,
  users,
  groups,
  games,
  sessions,
  settings
}
