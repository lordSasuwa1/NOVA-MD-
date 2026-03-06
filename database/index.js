/**
 * NOVA-MD — database/index.js (sql.js)
 */
'use strict'

const users    = require('./users.db')
const groups   = require('./groups.db')
const games    = require('./games.db')
const sessions = require('./sessions.db')
const settings = require('./settings.db')

async function init() {
  // Init séquentiel — sql.js est async pour l'ouverture
  await settings.init()
  await users.init()
  await groups.init()
  await games.init()
  await sessions.init()
}

module.exports = { init, users, groups, games, sessions, settings }
