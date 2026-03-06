/**
 * NOVA-MD — database/settings.db.js (sql.js)
 */
'use strict'

const { openDb } = require('./_sqlHelper')
let db

async function init() {
  db = await openDb('settings')
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS stats (
      key   TEXT PRIMARY KEY,
      value INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS errors (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      command   TEXT DEFAULT '',
      error     TEXT DEFAULT '',
      time      INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS blacklist (
      jid       TEXT PRIMARY KEY,
      reason    TEXT DEFAULT '',
      addedBy   TEXT DEFAULT '',
      addedAt   INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS whitelist (
      jid       TEXT PRIMARY KEY,
      addedAt   INTEGER DEFAULT 0
    )
  `)
  console.log('[DB] ✅ settings.db initialisé (sql.js)')
}

// Settings généraux
function get(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key=?').get(key)
  if (!row) return null
  try { return JSON.parse(row.value) } catch { return row.value }
}
function set(key, value) {
  const v = JSON.stringify(value)
  const exists = db.prepare('SELECT 1 FROM settings WHERE key=?').get(key)
  if (exists) { db.prepare('UPDATE settings SET value=? WHERE key=?').run(v, key) }
  else { db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run(key, v) }
}

// Stats
function incrementStat(key, by = 1) {
  const s = db.prepare('SELECT value FROM stats WHERE key=?').get(key)
  if (s) { db.prepare('UPDATE stats SET value=value+? WHERE key=?').run(by, key) }
  else { db.prepare('INSERT INTO stats (key,value) VALUES (?,?)').run(key, by) }
}
function getStat(key) { return db.prepare('SELECT value FROM stats WHERE key=?').get(key)?.value || 0 }
function getAllStats() {
  const rows = db.prepare('SELECT * FROM stats').all()
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}
function resetDailyStats() { db.prepare('DELETE FROM stats').run() }

// Errors
function logError(obj) {
  db.prepare('INSERT INTO errors (command,error,time) VALUES (?,?,?)').run(obj.command || '', String(obj.error || '').slice(0,500), obj.time || Date.now())
  // Garde max 100 erreurs
  db.prepare('DELETE FROM errors WHERE id NOT IN (SELECT id FROM errors ORDER BY time DESC LIMIT 100)').run()
}
function getErrors(limit = 10) { return db.prepare('SELECT * FROM errors ORDER BY time DESC LIMIT ?').all(limit) }
function clearErrors() { db.prepare('DELETE FROM errors').run() }

// Blacklist
function blacklist(jid, reason = '', addedBy = '') {
  db.prepare('INSERT OR REPLACE INTO blacklist (jid,reason,addedBy,addedAt) VALUES (?,?,?,?)').run(jid, reason, addedBy, Date.now())
}
function unblacklist(jid) { db.prepare('DELETE FROM blacklist WHERE jid=?').run(jid) }
function isBlacklisted(jid) { return !!db.prepare('SELECT 1 FROM blacklist WHERE jid=?').get(jid) }
function getBlacklist() { return db.prepare('SELECT * FROM blacklist').all() }

// Whitelist
function addWhitelist(jid) { db.prepare('INSERT OR REPLACE INTO whitelist (jid,addedAt) VALUES (?,?)').run(jid, Date.now()) }
function removeWhitelist(jid) { db.prepare('DELETE FROM whitelist WHERE jid=?').run(jid) }
function isWhitelisted(jid) { return !!db.prepare('SELECT 1 FROM whitelist WHERE jid=?').get(jid) }

module.exports = {
  init, get, set,
  incrementStat, getStat, getAllStats, resetDailyStats,
  logError, getErrors, clearErrors,
  blacklist, unblacklist, isBlacklisted, getBlacklist,
  addWhitelist, removeWhitelist, isWhitelisted
}
