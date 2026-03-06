/**
 * NOVA-MD — database/sessions.db.js (sql.js)
 */
'use strict'

const { openDb } = require('./_sqlHelper')
let db

async function init() {
  db = await openDb('nova_sessions')
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id        TEXT PRIMARY KEY,
      data      TEXT DEFAULT '{}',
      updatedAt INTEGER DEFAULT 0
    )
  `)
  console.log('[DB] ✅ sessions.db initialisé (sql.js)')
}

function get(id) {
  const s = db.prepare('SELECT data FROM sessions WHERE id=?').get(id)
  if (!s) return null
  try { return JSON.parse(s.data) } catch { return null }
}
function set(id, data) {
  const json = JSON.stringify(data)
  const exists = db.prepare('SELECT 1 FROM sessions WHERE id=?').get(id)
  if (exists) { db.prepare('UPDATE sessions SET data=?, updatedAt=? WHERE id=?').run(json, Date.now(), id) }
  else { db.prepare('INSERT INTO sessions (id,data,updatedAt) VALUES (?,?,?)').run(id, json, Date.now()) }
}
function del(id) { db.prepare('DELETE FROM sessions WHERE id=?').run(id) }
function has(id) { return !!db.prepare('SELECT 1 FROM sessions WHERE id=?').get(id) }
function clear() { db.prepare('DELETE FROM sessions').run() }

module.exports = { init, get, set, del, has, clear }
