/**
 * NOVA-MD — CMD/groupe/sondage.js
 */

module.exports = {
  config: { name: 'sondage', description: 'Crée un sondage dans le groupe', usage: 'sondage <question>|<opt1>|<opt2>|...', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, sender, text } = ctx
    if (db.groups.getPoll(from)) return ctx.reply({ text: '⚠️ Un sondage est déjà en cours. Utilise *!sondage-resultat* pour voir les résultats.' })
    const parts = text.split('|').map(p => p.trim())
    if (parts.length < 3) return ctx.reply({ text: '⚠️ Format : *!sondage question|option1|option2|...*' })
    const [question, ...options] = parts
    const id = db.groups.createPoll(from, question, options, sender)
    const opts = options.map((o,i) => `${i+1}️⃣ ${o}`).join('\n')
    await ctx.reply({ text: [`📊 *SONDAGE*`, ``, `❓ ${question}`, ``, opts, ``, `Vote avec *!sondage-vote <numéro>*`].join('\n') })
  }
}