/**
 * NOVA-MD — CMD/groupe/sondage-resultat.js
 */

module.exports = {
  config: { name: 'sondage-resultat', aliases: ['resultats'], description: 'Affiche les résultats du sondage', usage: 'sondage-resultat', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    const poll = db.groups.getPoll(from)
    if (!poll) return ctx.reply({ text: '❌ Aucun sondage en cours.' })
    const total = Object.keys(poll.votes).length
    const counts = poll.options.map(o => ({ opt: o, count: Object.values(poll.votes).filter(v => v === o).length }))
    const bars = counts.map(c => {
      const pct = total ? Math.round((c.count / total) * 10) : 0
      return `▪️ *${c.opt}* : ${'█'.repeat(pct)}${'░'.repeat(10-pct)} ${c.count} (${total ? Math.round(c.count/total*100) : 0}%)`
    })
    await ctx.reply({ text: [`📊 *Résultats — ${poll.question}*`, ``, ...bars, ``, `👥 Total votes : *${total}*`].join('\n') })
  }
}