/**
 * NOVA-MD — CMD/développeur/eval.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

const util = require('util')
module.exports = {
  config: { name: 'eval', aliases: ['ev'], description: 'Exécute du code JavaScript', usage: 'eval <code>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne du code JS à exécuter.' })
    const start = Date.now()
    try {
      let result = await eval(`(async () => { ${text} })()`)
      if (typeof result !== 'string') result = util.inspect(result, { depth: 3 })
      const ms = Date.now() - start
      await ctx.reply({ text: [`✅ *eval* (${ms}ms)`, `\`\`\`js`, result?.slice(0, 3000) || 'undefined', `\`\`\``].join('\n') })
    } catch (err) {
      await ctx.reply({ text: [`❌ *eval Error*`, `\`\`\``, err.message?.slice(0, 1000), `\`\`\``].join('\n') })
    }
  }
}