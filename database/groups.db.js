/**
 * NOVA-MD — database/groups.db.js (sql.js)
 */
'use strict'

const { openDb } = require('./_sqlHelper')
let db

async function init() {
  db = await openDb('groups')
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id          TEXT PRIMARY KEY,
      name        TEXT DEFAULT '',
      settings    TEXT DEFAULT '{}',
      rules       TEXT DEFAULT '',
      welcome     TEXT DEFAULT '',
      goodbye     TEXT DEFAULT '',
      createdAt   INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS group_warns (
      jid         TEXT NOT NULL,
      groupId     TEXT NOT NULL,
      count       INTEGER DEFAULT 0,
      PRIMARY KEY (jid, groupId)
    );
    CREATE TABLE IF NOT EXISTS group_mutes (
      jid         TEXT NOT NULL,
      groupId     TEXT NOT NULL,
      mutedBy     TEXT DEFAULT '',
      mutedAt     INTEGER DEFAULT 0,
      PRIMARY KEY (jid, groupId)
    );
    CREATE TABLE IF NOT EXISTS polls (
      id          TEXT PRIMARY KEY,
      groupId     TEXT NOT NULL,
      question    TEXT NOT NULL,
      options     TEXT NOT NULL,
      votes       TEXT DEFAULT '{}',
      createdBy   TEXT DEFAULT '',
      createdAt   INTEGER DEFAULT 0
    )
  `)
  console.log('[DB] ✅ groups.db initialisé (sql.js)')
}

function getOrCreate(id, name = '') {
  let g = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
  if (!g) { db.prepare('INSERT INTO groups (id, name, createdAt) VALUES (?,?,?)').run(id, name, Date.now()); g = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) }
  return g
}

function getSettings(id) {
  const g = db.prepare('SELECT settings FROM groups WHERE id = ?').get(id)
  try { return g ? JSON.parse(g.settings) : {} } catch { return {} }
}

function setSetting(id, key, value) {
  getOrCreate(id)
  const s = getSettings(id)
  s[key] = value
  db.prepare('UPDATE groups SET settings = ? WHERE id = ?').run(JSON.stringify(s), id)
}

function getAll() { return db.prepare('SELECT * FROM groups').all() }
function count() { return db.prepare('SELECT COUNT(*) as c FROM groups').get()?.c || 0 }

function setWelcome(id, msg) { getOrCreate(id); db.prepare('UPDATE groups SET welcome = ? WHERE id = ?').run(msg, id) }
function setGoodbye(id, msg) { getOrCreate(id); db.prepare('UPDATE groups SET goodbye = ? WHERE id = ?').run(msg, id) }
function setRules(id, rules) { getOrCreate(id); db.prepare('UPDATE groups SET rules = ? WHERE id = ?').run(rules, id) }
function getRules(id) { return db.prepare('SELECT rules FROM groups WHERE id = ?').get(id)?.rules || null }

// Warns
function addGroupWarn(jid, groupId) {
  const w = db.prepare('SELECT count FROM group_warns WHERE jid=? AND groupId=?').get(jid, groupId)
  if (w) { db.prepare('UPDATE group_warns SET count = count + 1 WHERE jid=? AND groupId=?').run(jid, groupId) }
  else { db.prepare('INSERT INTO group_warns (jid, groupId, count) VALUES (?,?,1)').run(jid, groupId) }
  return db.prepare('SELECT count FROM group_warns WHERE jid=? AND groupId=?').get(jid, groupId)?.count || 1
}
function getWarnsList(groupId) { return db.prepare('SELECT * FROM group_warns WHERE groupId=? AND count > 0').all(groupId) }
function resetGroupWarns(jid, groupId) { db.prepare('UPDATE group_warns SET count=0 WHERE jid=? AND groupId=?').run(jid, groupId) }

// Mutes
function mute(jid, groupId, mutedBy = '') { db.prepare('INSERT OR REPLACE INTO group_mutes (jid, groupId, mutedBy, mutedAt) VALUES (?,?,?,?)').run(jid, groupId, mutedBy, Date.now()) }
function unmute(jid, groupId) { db.prepare('DELETE FROM group_mutes WHERE jid=? AND groupId=?').run(jid, groupId) }
function isMuted(jid, groupId) { return !!db.prepare('SELECT 1 FROM group_mutes WHERE jid=? AND groupId=?').get(jid, groupId) }
function getMutedList(groupId) { return db.prepare('SELECT * FROM group_mutes WHERE groupId=?').all(groupId) }

// Polls
function createPoll(groupId, question, options, createdBy) {
  const id = Date.now().toString(36)
  db.prepare('INSERT INTO polls (id,groupId,question,options,votes,createdBy,createdAt) VALUES (?,?,?,?,?,?,?)').run(id, groupId, question, JSON.stringify(options), '{}', createdBy, Date.now())
  return id
}
function getPoll(groupId) {
  const p = db.prepare('SELECT * FROM polls WHERE groupId=? ORDER BY createdAt DESC LIMIT 1').get(groupId)
  if (!p) return null
  try { p.options = JSON.parse(p.options); p.votes = JSON.parse(p.votes) } catch {}
  return p
}
function votePoll(id, jid, option) {
  const p = db.prepare('SELECT votes FROM polls WHERE id=?').get(id)
  if (!p) return
  const votes = JSON.parse(p.votes || '{}')
  votes[jid] = option
  db.prepare('UPDATE polls SET votes=? WHERE id=?').run(JSON.stringify(votes), id)
}

module.exports = {
  init, getOrCreate, getSettings, setSetting, getAll, count,
  setWelcome, setGoodbye, setRules, getRules,
  addGroupWarn, getWarnsList, resetGroupWarns,
  mute, unmute, isMuted, getMutedList,
  createPoll, getPoll, votePoll
}
