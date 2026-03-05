/**
 * NOVA-MD — CMD/développeur/db-query.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'db-query', aliases: ['dbq','query'], description: 'Exécute une requête SQL sur une base de données', usage: 'db-query <table> <sql>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { args } = ctx
    const table = args[0]?.toLowerCase()
    const sql = args.slice(1).join(' ')
    if (!table || !sql) return ctx.reply({ text: '⚠️ Format : *!db-query users SELECT * FROM users LIMIT 5*' })
    const dbMap = { users: db.users, groups: db.groups, games: db.games, sessions: db.sessions, settings: db.settings }
    const target = dbMap[table]
    if (!target) return ctx.reply({ text: `❌ Table inconnue : *${table}*\nDisponibles : users, groups, games, sessions, settings` })
    try {
      // Accès direct à l'instance SQLite interne (unsafe, dev only)
      const Database = require('better-sqlite3')
      const p = require('path')
      const dbPath = p.join(__dirname, `../../sessions/${table}.db`)
      const rawDb = new Database(dbPath, { readonly: !sql.trim().toUpperCase().startsWith('SELECT') })
      const stmt = rawDb.prepare(sql)
      const result = sql.trim().toUpperCase().startsWith('SELECT') ? stmt.all() : stmt.run()
      rawDb.close()
      const out = JSON.stringify(result, null, 2).slice(0, 3000)
      await ctx.reply({ text: [`🗄️ *db-query*`, `\`\`\`json`, out, `\`\`\``].join('\n') })
    } catch (err) {
      await ctx.reply({ text: `❌ Erreur SQL : ${err.message}` })
    }
  }
}