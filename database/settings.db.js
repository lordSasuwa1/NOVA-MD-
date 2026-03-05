/**
 * NOVA-MD — database/settings.db.js
 * Config globale du bot, blacklist, logs d'erreurs, stats
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '../sessions/settings.db')
let db

function init() {
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS blacklist (
      jid       TEXT PRIMARY KEY,
      reason    TEXT DEFAULT '',
      addedBy   TEXT DEFAULT '',
      addedAt   INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS whitelist (
      jid     TEXT PRIMARY KEY,
      addedAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS errors (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      command   TEXT DEFAULT '',
      error     TEXT NOT NULL,
      sender    TEXT DEFAULT '',
      groupId   TEXT DEFAULT '',
      time      INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS stats (
      key   TEXT PRIMARY KEY,
      value INTEGER DEFAULT 0
    );
  `)

  // Valeurs par défaut
  const defaults = [
    ['maintenance', 'false'],
    ['botMode',     'public'],
    ['startedAt',   String(Date.now())],
  ]
  const insert = db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)')
  for (const [k, v] of defaults) insert.run(k, v)

  console.log('[DB] ✅ settings.db initialisé')
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────

function get(key) {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key)
  if (!row) return null
  try { return JSON.parse(row.value) } catch { return row.value }
}

function set(key, value) {
  const v = typeof value === 'object' ? JSON.stringify(value) : String(value)
  db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, v)
}

function getAll() {
  return Object.fromEntries(
    db.prepare('SELECT key, value FROM config').all().map(r => {
      try { return [r.key, JSON.parse(r.value)] } catch { return [r.key, r.value] }
    })
  )
}

// ─── BLACKLIST ────────────────────────────────────────────────────────────────

function blacklist(jid, reason = '', addedBy = '') {
  db.prepare('INSERT OR REPLACE INTO blacklist (jid, reason, addedBy, addedAt) VALUES (?, ?, ?, ?)').run(jid, reason, addedBy, Date.now())
}

function unblacklist(jid) {
  db.prepare('DELETE FROM blacklist WHERE jid = ?').run(jid)
}

function isBlacklisted(jid) {
  return !!db.prepare('SELECT 1 FROM blacklist WHERE jid = ?').get(jid)
}

function getBlacklist() {
  return db.prepare('SELECT * FROM blacklist').all()
}

// ─── WHITELIST ────────────────────────────────────────────────────────────────

function addWhitelist(jid) {
  db.prepare('INSERT OR IGNORE INTO whitelist (jid) VALUES (?)').run(jid)
}

function removeWhitelist(jid) {
  db.prepare('DELETE FROM whitelist WHERE jid = ?').run(jid)
}

function isWhitelisted(jid) {
  return !!db.prepare('SELECT 1 FROM whitelist WHERE jid = ?').get(jid)
}

function getWhitelist() {
  return db.prepare('SELECT * FROM whitelist').all()
}

// ─── ERREURS ──────────────────────────────────────────────────────────────────

function logError({ command, error, sender, from, time }) {
  db.prepare('INSERT INTO errors (command, error, sender, groupId, time) VALUES (?, ?, ?, ?, ?)').run(
    command || '', error || '', sender || '', from || '', time || Date.now()
  )
  // Garder max 500 erreurs
  db.prepare('DELETE FROM errors WHERE id NOT IN (SELECT id FROM errors ORDER BY time DESC LIMIT 500)').run()
}

function getErrors(limit = 20) {
  return db.prepare('SELECT * FROM errors ORDER BY time DESC LIMIT ?').all(limit)
}

function clearErrors() {
  db.prepare('DELETE FROM errors').run()
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function incrementStat(key, amount = 1) {
  const row = db.prepare('SELECT 1 FROM stats WHERE key = ?').get(key)
  if (row) db.prepare('UPDATE stats SET value = value + ? WHERE key = ?').run(amount, key)
  else db.prepare('INSERT INTO stats (key, value) VALUES (?, ?)').run(key, amount)
}

function getStat(key) {
  return db.prepare('SELECT value FROM stats WHERE key = ?').get(key)?.value || 0
}

function getAllStats() {
  return Object.fromEntries(db.prepare('SELECT key, value FROM stats').all().map(r => [r.key, r.value]))
}

function resetDailyStats() {
  db.prepare('DELETE FROM stats WHERE key LIKE "daily_%"').run()
}

module.exports = {
  init, get, set, getAll,
  blacklist, unblacklist, isBlacklisted, getBlacklist,
  addWhitelist, removeWhitelist, isWhitelisted, getWhitelist,
  logError, getErrors, clearErrors,
  incrementStat, getStat, getAllStats, resetDailyStats
}
