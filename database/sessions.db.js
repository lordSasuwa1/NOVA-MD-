/**
 * NOVA-MD — database/sessions.db.js
 * Gestion des sessions Baileys multi-comptes
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = path.join(__dirname, '../sessions/sessions.db')
let db

function init() {
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id        TEXT PRIMARY KEY,
      number    TEXT NOT NULL,
      label     TEXT DEFAULT '',
      active    INTEGER DEFAULT 1,
      createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `)
  console.log('[DB] ✅ sessions.db initialisé')
}

function create(id, number, label = '') {
  db.prepare('INSERT OR REPLACE INTO sessions (id, number, label) VALUES (?, ?, ?)').run(id, number, label)
}

function get(id) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) || null
}

function getAll() {
  return db.prepare('SELECT * FROM sessions WHERE active = 1').all()
}

function remove(id) {
  db.prepare('UPDATE sessions SET active = 0 WHERE id = ?').run(id)
  const sessionDir = path.join(__dirname, '../sessions', id)
  if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
}

function count() {
  return db.prepare('SELECT COUNT(*) as c FROM sessions WHERE active = 1').get().c
}

function getSessionPath(id) {
  const dir = path.join(__dirname, '../sessions', id)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

module.exports = { init, create, get, getAll, remove, count, getSessionPath }
