/**
 * NOVA-MD — CMD/développeur/test-cmd.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'test-cmd', description: 'Teste si une commande existe et est valide', usage: 'test-cmd <commande>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { args, commands } = ctx
    const name = args[0]?.toLowerCase()
    if (!name) return ctx.reply({ text: '⚠️ Donne un nom de commande.' })
    const cmd = commands?.get(name)
    if (!cmd) return ctx.reply({ text: `❌ Commande *${name}* introuvable dans le registre.` })
    const c = cmd.config
    const checks = [
      c.name ? '✅ name' : '❌ name manquant',
      typeof cmd.execute === 'function' ? '✅ execute()' : '❌ execute() manquant',
      typeof c.permission === 'number' ? '✅ permission' : '❌ permission manquante',
      c.category ? '✅ category' : '⚠️ category absente',
      c.description ? '✅ description' : '⚠️ description absente',
      c.usage ? '✅ usage' : '⚠️ usage absent',
    ]
    await ctx.reply({ text: [`🧪 *test-cmd : ${name}*`, ``, ...checks].join('\n') })
  }
}