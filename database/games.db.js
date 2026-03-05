/**
 * NOVA-MD — database/games.db.js
 * Gestion des jeux : sessions actives, scores, loterie, paris
 */

module.exports = (db) => {

  function init() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id        TEXT PRIMARY KEY,
        groupId   TEXT NOT NULL,
        type      TEXT NOT NULL,
        state     TEXT DEFAULT '{}',
        createdAt INTEGER DEFAULT (strftime('%s','now') * 1000),
        updatedAt INTEGER DEFAULT (strftime('%s','now') * 1000)
      );
      CREATE TABLE IF NOT EXISTS scores (
        jid       TEXT NOT NULL,
        game      TEXT NOT NULL,
        points    INTEGER DEFAULT 0,
        wins      INTEGER DEFAULT 0,
        losses    INTEGER DEFAULT 0,
        weekly    INTEGER DEFAULT 0,
        PRIMARY KEY (jid, game)
      );
      CREATE TABLE IF NOT EXISTS loteries (
        groupId      TEXT PRIMARY KEY,
        participants TEXT DEFAULT '[]',
        prize        INTEGER DEFAULT 100,
        drawAt       INTEGER NOT NULL,
        createdBy    TEXT NOT NULL,
        createdAt    INTEGER DEFAULT (strftime('%s','now') * 1000)
      );
      CREATE TABLE IF NOT EXISTS bets (
        id        TEXT PRIMARY KEY,
        groupId   TEXT NOT NULL,
        bettor    TEXT NOT NULL,
        target    TEXT NOT NULL,
        amount    INTEGER DEFAULT 0,
        condition TEXT DEFAULT '',
        status    TEXT DEFAULT 'pending',
        createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
      );
      CREATE TABLE IF NOT EXISTS bombes (
        groupId       TEXT PRIMARY KEY,
        currentHolder TEXT NOT NULL,
        expiresAt     INTEGER NOT NULL,
        createdAt     INTEGER DEFAULT (strftime('%s','now') * 1000)
      );
    `)
    console.log('[DB:GAMES] ✅ Tables initialisées')
  }

  function getSession(groupId, type) {
    const row = db.prepare('SELECT * FROM game_sessions WHERE groupId = ? AND type = ?').get(groupId, type)
    if (!row) return null
    try { row.state = JSON.parse(row.state) } catch { row.state = {} }
    return row
  }

  function setSession(groupId, type, state) {
    const id = `${type}_${groupId}`
    const stateStr = JSON.stringify(state)
    const now = Date.now()
    db.prepare(`
      INSERT INTO game_sessions (id, groupId, type, state, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET state = ?, updatedAt = ?
    `).run(id, groupId, type, stateStr, now, now, stateStr, now)
  }

  function deleteSession(groupId, type) {
    db.prepare('DELETE FROM game_sessions WHERE groupId = ? AND type = ?').run(groupId, type)
  }

  function hasActiveSession(groupId, type) {
    return !!db.prepare('SELECT 1 FROM game_sessions WHERE groupId = ? AND type = ?').get(groupId, type)
  }

  function getExpiredSessions(maxAgeMs) {
    const limit = Date.now() - maxAgeMs
    return db.prepare('SELECT * FROM game_sessions WHERE updatedAt < ?').all(limit)
  }

  function addScore(jid, game, points = 1) {
    db.prepare(`
      INSERT INTO scores (jid, game, points, wins, weekly) VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(jid, game) DO UPDATE SET points = points + ?, wins = wins + 1, weekly = weekly + ?
    `).run(jid, game, points, points, points, points)
  }

  function addLoss(jid, game) {
    db.prepare(`
      INSERT INTO scores (jid, game, losses) VALUES (?, ?, 1)
      ON CONFLICT(jid, game) DO UPDATE SET losses = losses + 1
    `).run(jid, game)
  }

  function getScore(jid, game) {
    return db.prepare('SELECT * FROM scores WHERE jid = ? AND game = ?').get(jid, game) || null
  }

  function getTopScores(game, limit = 10) {
    return db.prepare('SELECT * FROM scores WHERE game = ? ORDER BY points DESC LIMIT ?').all(game, limit)
  }

  function getGlobalTop(limit = 10) {
    return db.prepare('SELECT jid, SUM(points) as total FROM scores GROUP BY jid ORDER BY total DESC LIMIT ?').all(limit)
  }

  function resetWeeklyScores() { db.prepare('UPDATE scores SET weekly = 0').run() }
  function resetScores(jid) { db.prepare('DELETE FROM scores WHERE jid = ?').run(jid) }
  function resetAllScores() { db.prepare('DELETE FROM scores').run() }

  function createLoterie(groupId, prize, drawAt, createdBy) {
    db.prepare(`INSERT OR REPLACE INTO loteries (groupId, participants, prize, drawAt, createdBy) VALUES (?, '[]', ?, ?, ?)`)
      .run(groupId, prize, drawAt, createdBy)
  }

  function joinLoterie(groupId, jid) {
    const lot = getLoterie(groupId)
    if (!lot) return false
    const parts = lot.participants
    if (parts.includes(jid)) return false
    parts.push(jid)
    db.prepare('UPDATE loteries SET participants = ? WHERE groupId = ?').run(JSON.stringify(parts), groupId)
    return true
  }

  function getLoterie(groupId) {
    const row = db.prepare('SELECT * FROM loteries WHERE groupId = ?').get(groupId)
    if (!row) return null
    try { row.participants = JSON.parse(row.participants) } catch { row.participants = [] }
    return row
  }

  function getActiveLoteries() {
    return db.prepare('SELECT * FROM loteries').all().map(r => {
      try { r.participants = JSON.parse(r.participants) } catch { r.participants = [] }
      return r
    })
  }

  function deleteLoterie(groupId) { db.prepare('DELETE FROM loteries WHERE groupId = ?').run(groupId) }

  function createBombe(groupId, holder, expiresAt) {
    db.prepare('INSERT OR REPLACE INTO bombes (groupId, currentHolder, expiresAt) VALUES (?, ?, ?)').run(groupId, holder, expiresAt)
  }

  function updateBombeHolder(groupId, newHolder, newExpiry) {
    db.prepare('UPDATE bombes SET currentHolder = ?, expiresAt = ? WHERE groupId = ?').run(newHolder, newExpiry, groupId)
  }

  function getBombe(groupId) { return db.prepare('SELECT * FROM bombes WHERE groupId = ?').get(groupId) || null }
  function getActiveBombes() { return db.prepare('SELECT * FROM bombes').all() }
  function deleteBombe(groupId) { db.prepare('DELETE FROM bombes WHERE groupId = ?').run(groupId) }

  function createBet(groupId, bettor, target, amount, condition) {
    const id = `bet_${groupId}_${Date.now()}`
    db.prepare('INSERT INTO bets (id, groupId, bettor, target, amount, condition) VALUES (?, ?, ?, ?, ?, ?)').run(id, groupId, bettor, target, amount, condition)
    return id
  }

  function validateBet(id, result) { db.prepare('UPDATE bets SET status = ? WHERE id = ?').run(result, id) }
  function getActiveBets(groupId) { return db.prepare("SELECT * FROM bets WHERE groupId = ? AND status = 'pending'").all(groupId) }

  return {
    init,
    getSession, setSession, deleteSession, hasActiveSession, getExpiredSessions,
    addScore, addLoss, getScore, getTopScores, getGlobalTop,
    resetWeeklyScores, resetScores, resetAllScores,
    createLoterie, joinLoterie, getLoterie, getActiveLoteries, deleteLoterie,
    createBombe, updateBombeHolder, getBombe, getActiveBombes, deleteBombe,
    createBet, validateBet, getActiveBets
  }
}
