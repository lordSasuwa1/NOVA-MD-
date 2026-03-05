/**
 * NOVA-MD — database/users.db.js
 * Gestion des utilisateurs : profils, permissions, warns, bans, VIP
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '../sessions/users.db')
let db

function init() {
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid         TEXT PRIMARY KEY,
      number      TEXT NOT NULL,
      pushName    TEXT DEFAULT '',
      permission  INTEGER DEFAULT 0,
      vip         INTEGER DEFAULT 0,
      vipExpire   INTEGER DEFAULT 0,
      warns       INTEGER DEFAULT 0,
      banned      INTEGER DEFAULT 0,
      bannedBy    TEXT DEFAULT '',
      bannedAt    INTEGER DEFAULT 0,
      banReason   TEXT DEFAULT '',
      points      INTEGER DEFAULT 0,
      createdAt   INTEGER DEFAULT (strftime('%s','now') * 1000),
      lastSeen    INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `)

  console.log('[DB] ✅ users.db initialisé')
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

function get(jid) {
  return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid) || null
}

function exists(jid) {
  return !!db.prepare('SELECT 1 FROM users WHERE jid = ?').get(jid)
}

function create(jid, pushName = '') {
  if (exists(jid)) return get(jid)
  const number = jid.split('@')[0].split(':')[0]
  db.prepare('INSERT INTO users (jid, number, pushName) VALUES (?, ?, ?)').run(jid, number, pushName)
  return get(jid)
}

function update(jid, fields) {
  const keys = Object.keys(fields)
  if (!keys.length) return
  const set = keys.map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE users SET ${set} WHERE jid = ?`).run(...Object.values(fields), jid)
}

function updateLastSeen(jid) {
  db.prepare('UPDATE users SET lastSeen = ? WHERE jid = ?').run(Date.now(), jid)
}

function getAll() {
  return db.prepare('SELECT * FROM users').all()
}

function count() {
  return db.prepare('SELECT COUNT(*) as c FROM users').get().c
}

// ─── VIP ──────────────────────────────────────────────────────────────────────

function setVip(jid, active, duration = 0) {
  const expire = active && duration ? Date.now() + duration : 0
  db.prepare('UPDATE users SET vip = ?, vipExpire = ? WHERE jid = ?').run(active ? 1 : 0, expire, jid)
}

function isVip(jid) {
  const user = get(jid)
  if (!user?.vip) return false
  if (user.vipExpire && Date.now() > user.vipExpire) {
    setVip(jid, false)
    return false
  }
  return true
}

function getAllVip() {
  return db.prepare('SELECT * FROM users WHERE vip = 1').all()
}

function getVipExpiringSoon(threshold) {
  const limit = Date.now() + threshold
  return db.prepare('SELECT * FROM users WHERE vip = 1 AND vipExpire > 0 AND vipExpire < ?').all(limit)
}

// ─── WARNS ────────────────────────────────────────────────────────────────────

function addWarn(jid) {
  db.prepare('UPDATE users SET warns = warns + 1 WHERE jid = ?').run(jid)
  return getWarns(jid)
}

function getWarns(jid) {
  return get(jid)?.warns || 0
}

function resetWarns(jid) {
  db.prepare('UPDATE users SET warns = 0 WHERE jid = ?').run(jid)
}

function resetWarnsForGroup() {
  db.prepare('UPDATE users SET warns = 0').run()
}

// ─── BAN ──────────────────────────────────────────────────────────────────────

function ban(jid, reason = '', bannedBy = '') {
  db.prepare(`
    UPDATE users SET banned = 1, banReason = ?, bannedBy = ?, bannedAt = ? WHERE jid = ?
  `).run(reason, bannedBy, Date.now(), jid)
}

function unban(jid) {
  db.prepare("UPDATE users SET banned = 0, banReason = '', bannedBy = '' WHERE jid = ?").run(jid)
}

function isBanned(jid) {
  return !!get(jid)?.banned
}

function getAllBanned() {
  return db.prepare('SELECT * FROM users WHERE banned = 1').all()
}

// ─── POINTS ───────────────────────────────────────────────────────────────────

function addPoints(jid, amount) {
  db.prepare('UPDATE users SET points = points + ? WHERE jid = ?').run(amount, jid)
}

function getPoints(jid) {
  return get(jid)?.points || 0
}

function getTopPoints(limit = 10) {
  return db.prepare('SELECT * FROM users ORDER BY points DESC LIMIT ?').all(limit)
}

module.exports = {
  init, get, exists, create, update, updateLastSeen, getAll, count,
  setVip, isVip, getAllVip, getVipExpiringSoon,
  addWarn, getWarns, resetWarns, resetWarnsForGroup,
  ban, unban, isBanned, getAllBanned,
  addPoints, getPoints, getTopPoints
}
