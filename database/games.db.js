/**
 * NOVA-MD — database/games.db.js (sql.js)
 */
'use strict'

const { openDb } = require('./_sqlHelper')
let db

async function init() {
  db = await openDb('games')
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id        TEXT PRIMARY KEY,
      type      TEXT NOT NULL,
      groupId   TEXT NOT NULL,
      data      TEXT DEFAULT '{}',
      createdAt INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS game_scores (
      jid     TEXT NOT NULL,
      game    TEXT NOT NULL,
      score   INTEGER DEFAULT 0,
      wins    INTEGER DEFAULT 0,
      losses  INTEGER DEFAULT 0,
      PRIMARY KEY (jid, game)
    )
  `)
  console.log('[DB] ✅ games.db initialisé (sql.js)')
}

// Sessions
function getSession(groupId, type) {
  const s = db.prepare('SELECT * FROM game_sessions WHERE groupId=? AND type=?').get(groupId, type)
  if (!s) return null
  try { s.data = JSON.parse(s.data) } catch {}
  return s
}
function setSession(groupId, type, data) {
  const id = groupId + ':' + type
  const json = JSON.stringify(data)
  const exists = db.prepare('SELECT 1 FROM game_sessions WHERE id=?').get(id)
  if (exists) { db.prepare('UPDATE game_sessions SET data=? WHERE id=?').run(json, id) }
  else { db.prepare('INSERT INTO game_sessions (id,type,groupId,data,createdAt) VALUES (?,?,?,?,?)').run(id, type, groupId, json, Date.now()) }
}
function deleteSession(groupId, type) { db.prepare('DELETE FROM game_sessions WHERE groupId=? AND type=?').run(groupId, type) }
function hasSession(groupId, type) { return !!db.prepare('SELECT 1 FROM game_sessions WHERE groupId=? AND type=?').get(groupId, type) }

// Scores
function addWin(jid, game, points = 0) {
  const s = db.prepare('SELECT * FROM game_scores WHERE jid=? AND game=?').get(jid, game)
  if (s) { db.prepare('UPDATE game_scores SET wins=wins+1, score=score+? WHERE jid=? AND game=?').run(points, jid, game) }
  else { db.prepare('INSERT INTO game_scores (jid,game,score,wins) VALUES (?,?,?,1)').run(jid, game, points) }
}
function addLoss(jid, game) {
  const s = db.prepare('SELECT 1 FROM game_scores WHERE jid=? AND game=?').get(jid, game)
  if (s) { db.prepare('UPDATE game_scores SET losses=losses+1 WHERE jid=? AND game=?').run(jid, game) }
  else { db.prepare('INSERT INTO game_scores (jid,game,losses) VALUES (?,?,1)').run(jid, game) }
}
function getScore(jid, game) { return db.prepare('SELECT * FROM game_scores WHERE jid=? AND game=?').get(jid, game) || { score:0, wins:0, losses:0 } }
function getTop(game, limit = 10) { return db.prepare('SELECT * FROM game_scores WHERE game=? ORDER BY score DESC LIMIT ?').all(game, limit) }
function resetScores(game) {
  if (game) { db.prepare('DELETE FROM game_scores WHERE game=?').run(game) }
  else { db.prepare('DELETE FROM game_scores').run() }
}

module.exports = { init, getSession, setSession, deleteSession, hasSession, addWin, addLoss, getScore, getTop, resetScores }
