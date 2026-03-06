/**
 * NOVA-MD — database/_sqlHelper.js
 * Wrapper sql.js → API synchrone identique à better-sqlite3
 * sql.js est 100% JavaScript, pas de module natif = compatible KataBump
 */

'use strict'

const initSqlJs = require('sql.js')
const fs        = require('fs')
const path      = require('path')

const DB_DIR = path.join(__dirname, '../sessions')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

// Cache des instances DB
const _instances = {}

/**
 * Ouvre ou crée une base de données sql.js
 * Sauvegarde automatique sur disque à chaque écriture
 */
async function openDb(name) {
  if (_instances[name]) return _instances[name]

  const SQL    = await initSqlJs()
  const dbPath = path.join(DB_DIR, name + '.db')
  let db

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath)
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
  }

  // Wrapper pour imiter better-sqlite3
  const wrapper = {
    _db: db,
    _path: dbPath,
    _name: name,

    // Sauvegarde sur disque
    _save() {
      const data = db.export()
      fs.writeFileSync(this._path, Buffer.from(data))
    },

    // Exécute un ou plusieurs statements (CREATE TABLE, PRAGMA, etc.)
    exec(sql) {
      db.run(sql)
      this._save()
      return this
    },

    // Prépare un statement avec .run(), .get(), .all()
    prepare(sql) {
      const self = this
      return {
        // Écriture (INSERT, UPDATE, DELETE)
        run(...params) {
          const flat = params.flat()
          db.run(sql, flat)
          self._save()
          return { changes: 1 }
        },
        // Lecture — une seule ligne
        get(...params) {
          const flat = params.flat()
          const stmt = db.prepare(sql)
          stmt.bind(flat)
          if (stmt.step()) {
            const row = stmt.getAsObject()
            stmt.free()
            return row
          }
          stmt.free()
          return null
        },
        // Lecture — toutes les lignes
        all(...params) {
          const flat = params.flat()
          const results = []
          const stmt = db.prepare(sql)
          stmt.bind(flat)
          while (stmt.step()) {
            results.push(stmt.getAsObject())
          }
          stmt.free()
          return results
        },
      }
    },

    // PRAGMA simplifié
    pragma(sql) {
      try { db.run('PRAGMA ' + sql) } catch {}
      return this
    },

    close() {
      this._save()
      db.close()
      delete _instances[name]
    }
  }

  _instances[name] = wrapper
  return wrapper
}

/**
 * Ouvre une DB de façon synchrone via cache
 * (la première ouverture doit être faite via initDb() au boot)
 */
function getDb(name) {
  if (!_instances[name]) throw new Error(`DB "${name}" non initialisée. Appelle initDb() d'abord.`)
  return _instances[name]
}

module.exports = { openDb, getDb }
