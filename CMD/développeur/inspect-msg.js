/**
 * NOVA-MD — CMD/développeur/inspect-msg.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

const util = require('util')
module.exports = {
  config: { name: 'inspect-msg', aliases: ['inspect'], description: 'Inspecte la structure complète d'un message', usage: 'inspect-msg (répondre à un message)', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { msg, quoted } = ctx
    const target = quoted ? { message: quoted } : msg
    const dump = util.inspect(target?.message || target, { depth: 5 }).slice(0, 3500)
    await ctx.reply({ text: [`🔬 *inspect-msg*`, `\`\`\``, dump, `\`\`\``].join('\n') })
  }
}