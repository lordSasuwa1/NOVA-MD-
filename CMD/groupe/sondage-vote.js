/**
 * NOVA-MD — CMD/groupe/sondage-vote.js
 */

module.exports = {
  config: { name: 'sondage-vote', aliases: ['vote'], description: 'Vote pour une option du sondage', usage: 'sondage-vote <numéro>', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, sender, args } = ctx
    const poll = db.groups.getPoll(from)
    if (!poll) return ctx.reply({ text: '❌ Aucun sondage en cours.' })
    const idx = parseInt(args[0]) - 1
    if (isNaN(idx) || !poll.options[idx]) return ctx.reply({ text: `⚠️ Choisis entre 1 et ${poll.options.length}.` })
    db.groups.votePoll(poll.id, sender, poll.options[idx])
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Vote enregistré pour : *${poll.options[idx]}*` })
  }
}