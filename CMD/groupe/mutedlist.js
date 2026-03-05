/**
 * NOVA-MD — CMD/groupe/mutedlist.js
 */

module.exports = {
  config: { name: 'mutedlist', description: 'Liste les membres en sourdine', usage: 'mutedlist', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    const list = db.groups.getMutedList(from)
    if (!list.length) return ctx.reply({ text: '✅ Aucun membre en sourdine.' })
    const lines = list.map((m,i) => `${i+1}. @${m.jid.split('@')[0]}`)
    await ctx.reply({ text: [`🔇 *Membres en sourdine*`, ``, ...lines].join('\n'), mentions: list.map(m => m.jid) })
  }
}