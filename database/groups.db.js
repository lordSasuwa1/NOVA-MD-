/**
 * NOVA-MD — database/groups.db.js
 * Gestion des groupes : paramètres, mutes, warns, sondages
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '../sessions/groups.db')
let db

function init() {
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id        TEXT PRIMARY KEY,
      name      TEXT DEFAULT '',
      settings  TEXT DEFAULT '{}',
      rules     TEXT DEFAULT '',
      welcome   TEXT DEFAULT '',
      goodbye   TEXT DEFAULT '',
      createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS muted (
      jid     TEXT NOT NULL,
      groupId TEXT NOT NULL,
      mutedBy TEXT DEFAULT '',
      mutedAt INTEGER DEFAULT (strftime('%s','now') * 1000),
      PRIMARY KEY (jid, groupId)
    );
    CREATE TABLE IF NOT EXISTS warns_group (
      jid     TEXT NOT NULL,
      groupId TEXT NOT NULL,
      count   INTEGER DEFAULT 0,
      PRIMARY KEY (jid, groupId)
    );
    CREATE TABLE IF NOT EXISTS polls (
      id        TEXT PRIMARY KEY,
      groupId   TEXT NOT NULL,
      question  TEXT NOT NULL,
      options   TEXT NOT NULL,
      votes     TEXT DEFAULT '{}',
      createdBy TEXT DEFAULT '',
      createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
    CREATE TABLE IF NOT EXISTS spam_counters (
      jid     TEXT NOT NULL,
      groupId TEXT NOT NULL,
      count   INTEGER DEFAULT 0,
      lastMsg INTEGER DEFAULT 0,
      PRIMARY KEY (jid, groupId)
    );
  `)
  console.log('[DB] ✅ groups.db initialisé')
}

// ─── GROUPE ───────────────────────────────────────────────────────────────────

function get(groupId) {
  const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId)
  if (!row) return null
  row.settings = JSON.parse(row.settings || '{}')
  return row
}

function exists(groupId) {
  return !!db.prepare('SELECT 1 FROM groups WHERE id = ?').get(groupId)
}

function create(groupId, name = '') {
  if (exists(groupId)) return get(groupId)
  db.prepare('INSERT INTO groups (id, name) VALUES (?, ?)').run(groupId, name)
  return get(groupId)
}

function getOrCreate(groupId, name = '') {
  return exists(groupId) ? get(groupId) : create(groupId, name)
}

function getAll() {
  return db.prepare('SELECT * FROM groups').all().map(r => {
    r.settings = JSON.parse(r.settings || '{}')
    return r
  })
}

function count() {
  return db.prepare('SELECT COUNT(*) as c FROM groups').get().c
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function getSettings(groupId) {
  return get(groupId)?.settings || {}
}

function setSetting(groupId, key, value) {
  const s = getOrCreate(groupId).settings || {}
  s[key] = value
  db.prepare('UPDATE groups SET settings = ? WHERE id = ?').run(JSON.stringify(s), groupId)
}

function toggleSetting(groupId, key) {
  const current = getSettings(groupId)[key] || false
  setSetting(groupId, key, !current)
  return !current
}

// ─── RÈGLES / WELCOME / GOODBYE ───────────────────────────────────────────────

function getRules(groupId)       { return get(groupId)?.rules || '' }
function setRules(groupId, v)    { getOrCreate(groupId); db.prepare('UPDATE groups SET rules = ? WHERE id = ?').run(v, groupId) }
function getWelcome(groupId)     { return get(groupId)?.welcome || '' }
function setWelcome(groupId, v)  { getOrCreate(groupId); db.prepare('UPDATE groups SET welcome = ? WHERE id = ?').run(v, groupId) }
function getGoodbye(groupId)     { return get(groupId)?.goodbye || '' }
function setGoodbye(groupId, v)  { getOrCreate(groupId); db.prepare('UPDATE groups SET goodbye = ? WHERE id = ?').run(v, groupId) }

// ─── MUTES ────────────────────────────────────────────────────────────────────

function mute(jid, groupId, mutedBy = '') {
  db.prepare('INSERT OR REPLACE INTO muted (jid, groupId, mutedBy, mutedAt) VALUES (?, ?, ?, ?)').run(jid, groupId, mutedBy, Date.now())
}
function unmute(jid, groupId) {
  db.prepare('DELETE FROM muted WHERE jid = ? AND groupId = ?').run(jid, groupId)
}
function isMuted(jid, groupId) {
  return !!db.prepare('SELECT 1 FROM muted WHERE jid = ? AND groupId = ?').get(jid, groupId)
}
function getMutedList(groupId) {
  return db.prepare('SELECT * FROM muted WHERE groupId = ?').all(groupId)
}

// ─── WARNS GROUPE ─────────────────────────────────────────────────────────────

function addGroupWarn(jid, groupId) {
  const row = db.prepare('SELECT 1 FROM warns_group WHERE jid = ? AND groupId = ?').get(jid, groupId)
  if (row) db.prepare('UPDATE warns_group SET count = count + 1 WHERE jid = ? AND groupId = ?').run(jid, groupId)
  else db.prepare('INSERT INTO warns_group (jid, groupId, count) VALUES (?, ?, 1)').run(jid, groupId)
  return getGroupWarns(jid, groupId)
}
function getGroupWarns(jid, groupId) {
  return db.prepare('SELECT count FROM warns_group WHERE jid = ? AND groupId = ?').get(jid, groupId)?.count || 0
}
function resetGroupWarns(jid, groupId) {
  db.prepare('DELETE FROM warns_group WHERE jid = ? AND groupId = ?').run(jid, groupId)
}
function getWarnsList(groupId) {
  return db.prepare('SELECT * FROM warns_group WHERE groupId = ? ORDER BY count DESC').all(groupId)
}

// ─── SONDAGES ─────────────────────────────────────────────────────────────────

function createPoll(groupId, question, options, createdBy) {
  const id = `poll_${groupId}_${Date.now()}`
  db.prepare('INSERT INTO polls (id, groupId, question, options, createdBy) VALUES (?, ?, ?, ?, ?)').run(id, groupId, question, JSON.stringify(options), createdBy)
  return id
}
function getPoll(groupId) {
  const row = db.prepare('SELECT * FROM polls WHERE groupId = ? ORDER BY createdAt DESC LIMIT 1').get(groupId)
  if (!row) return null
  row.options = JSON.parse(row.options)
  row.votes   = JSON.parse(row.votes)
  return row
}
function votePoll(pollId, jid, option) {
  const row = db.prepare('SELECT votes FROM polls WHERE id = ?').get(pollId)
  if (!row) return null
  const votes = JSON.parse(row.votes)
  votes[jid] = option
  db.prepare('UPDATE polls SET votes = ? WHERE id = ?').run(JSON.stringify(votes), pollId)
  return votes
}
function deletePoll(groupId) {
  db.prepare('DELETE FROM polls WHERE groupId = ?').run(groupId)
}

// ─── ANTI-SPAM ────────────────────────────────────────────────────────────────

function getSpamCount(jid, groupId) {
  return db.prepare('SELECT count, lastMsg FROM spam_counters WHERE jid = ? AND groupId = ?').get(jid, groupId) || { count: 0, lastMsg: 0 }
}
function incrementSpam(jid, groupId) {
  const row = db.prepare('SELECT 1 FROM spam_counters WHERE jid = ? AND groupId = ?').get(jid, groupId)
  if (row) db.prepare('UPDATE spam_counters SET count = count + 1, lastMsg = ? WHERE jid = ? AND groupId = ?').run(Date.now(), jid, groupId)
  else db.prepare('INSERT INTO spam_counters (jid, groupId, count, lastMsg) VALUES (?, ?, 1, ?)').run(jid, groupId, Date.now())
}
function resetSpamCounters() {
  db.prepare('DELETE FROM spam_counters').run()
}

module.exports = {
  init, get, exists, create, getOrCreate, getAll, count,
  getSettings, setSetting, toggleSetting,
  getRules, setRules, getWelcome, setWelcome, getGoodbye, setGoodbye,
  mute, unmute, isMuted, getMutedList,
  addGroupWarn, getGroupWarns, resetGroupWarns, getWarnsList,
  createPoll, getPoll, votePoll, deletePoll,
  getSpamCount, incrementSpam, resetSpamCounters
}
