/**
 * NOVA-MD — CMD/groupe/warnlist.js
 */

module.exports = {
  config: { name: 'warnlist', description: 'Liste les avertissements du groupe', usage: 'warnlist', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    const list = db.groups.getWarnsList(from)
    if (!list.length) return ctx.reply({ text: '✅ Aucun avertissement dans ce groupe.' })
    const lines = list.map((w,i) => `${i+1}. @${w.jid.split('@')[0]} — *${w.count} avert.*`)
    await ctx.reply({ text: [`⚠️ *Avertissements*`, ``, ...lines].join('\n'), mentions: list.map(w => w.jid) })
  }
}