/**
 * NOVA-MD — database/users.db.js (sql.js)
 */
'use strict'

const { openDb, getDb } = require('./_sqlHelper')
let db

async function init() {
  db = await openDb('users')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid         TEXT PRIMARY KEY,
      number      TEXT NOT NULL DEFAULT '',
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
      titre       TEXT DEFAULT '',
      createdAt   INTEGER DEFAULT 0,
      lastSeen    INTEGER DEFAULT 0
    )
  `)
  console.log('[DB] ✅ users.db initialisé (sql.js)')
}

function get(jid) { return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid) || null }
function exists(jid) { return !!db.prepare('SELECT 1 FROM users WHERE jid = ?').get(jid) }

function create(jid, pushName = '') {
  if (exists(jid)) return get(jid)
  const number = jid.split('@')[0].split(':')[0]
  const now = Date.now()
  db.prepare('INSERT INTO users (jid, number, pushName, createdAt, lastSeen) VALUES (?,?,?,?,?)').run(jid, number, pushName, now, now)
  return get(jid)
}

function update(jid, fields) {
  const keys = Object.keys(fields)
  if (!keys.length) return
  const set = keys.map(k => k + ' = ?').join(', ')
  db.prepare('UPDATE users SET ' + set + ' WHERE jid = ?').run(...Object.values(fields), jid)
}

function updateLastSeen(jid) { db.prepare('UPDATE users SET lastSeen = ? WHERE jid = ?').run(Date.now(), jid) }
function getAll() { return db.prepare('SELECT * FROM users').all() }
function count() { return db.prepare('SELECT COUNT(*) as c FROM users').get()?.c || 0 }

// VIP
function setVip(jid, active, duration = 0) {
  const expire = active && duration ? Date.now() + duration : 0
  db.prepare('UPDATE users SET vip = ?, vipExpire = ? WHERE jid = ?').run(active ? 1 : 0, expire, jid)
}
function isVip(jid) {
  const u = get(jid)
  if (!u?.vip) return false
  if (u.vipExpire && Date.now() > u.vipExpire) { setVip(jid, false); return false }
  return true
}
function getAllVip() { return db.prepare('SELECT * FROM users WHERE vip = 1').all() }
function getVipExpiringSoon(threshold) {
  return db.prepare('SELECT * FROM users WHERE vip = 1 AND vipExpire > 0 AND vipExpire < ?').all(Date.now() + threshold)
}

// Warns
function addWarn(jid) { db.prepare('UPDATE users SET warns = warns + 1 WHERE jid = ?').run(jid); return get(jid)?.warns || 0 }
function getWarns(jid) { return get(jid)?.warns || 0 }
function resetWarns(jid) { db.prepare('UPDATE users SET warns = 0 WHERE jid = ?').run(jid) }

// Ban
function ban(jid, reason = '', bannedBy = '') {
  db.prepare('UPDATE users SET banned=1, banReason=?, bannedBy=?, bannedAt=? WHERE jid=?').run(reason, bannedBy, Date.now(), jid)
}
function unban(jid) { db.prepare("UPDATE users SET banned=0, banReason='', bannedBy='' WHERE jid=?").run(jid) }
function isBanned(jid) { return !!(get(jid)?.banned) }
function getAllBanned() { return db.prepare('SELECT * FROM users WHERE banned = 1').all() }

// Points
function addPoints(jid, n) { db.prepare('UPDATE users SET points = points + ? WHERE jid = ?').run(n, jid) }
function getPoints(jid) { return get(jid)?.points || 0 }
function getTopPoints(limit = 10) { return db.prepare('SELECT * FROM users ORDER BY points DESC LIMIT ?').all(limit) }

module.exports = {
  init, get, exists, create, update, updateLastSeen, getAll, count,
  setVip, isVip, getAllVip, getVipExpiringSoon,
  addWarn, getWarns, resetWarns,
  ban, unban, isBanned, getAllBanned,
  addPoints, getPoints, getTopPoints
}
