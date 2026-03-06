/**
 * NOVA-MD — CMD/développeur/db-query.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'db-query', aliases: ['dbq','query'], description: 'Exécute une requête SQL', usage: 'db-query <table> <sql>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { args } = ctx
    const table = args[0]?.toLowerCase()
    const sql = args.slice(1).join(' ')
    if (!table || !sql) return ctx.reply({ text: '⚠️ Format : *!db-query users SELECT * FROM users LIMIT 5*' })

    const dbMap = { users: db.users, groups: db.groups, games: db.games, sessions: db.sessions, settings: db.settings }
    const target = dbMap[table]
    if (!target) return ctx.reply({ text: `❌ Table inconnue : *${table}*\nDisponibles : users, groups, games, sessions, settings` })

    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT')
      let result

      if (isSelect) {
        result = target._db ? (() => {
          // Accès direct à l'instance sql.js
          const rows = []
          const stmt = target._db._db.prepare(sql)
          while (stmt.step()) rows.push(stmt.getAsObject())
          stmt.free()
          return rows
        })() : 'DB non accessible'
      } else {
        target._db?._db.run(sql)
        target._db?._save()
        result = { message: 'Requête exécutée' }
      }

      const out = JSON.stringify(result, null, 2).slice(0, 3000)
      await ctx.reply({ text: [`🗄️ *db-query : ${table}*`, '```json', out, '```'].join('\n') })
    } catch (err) {
      await ctx.reply({ text: `❌ Erreur SQL : ${err.message}` })
    }
  }
}
