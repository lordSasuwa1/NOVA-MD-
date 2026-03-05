/**
 * NOVA-MD — CMD/groupe/membres.js
 */

module.exports = {
  config: { name: 'membres', aliases: ['members','liste'], description: 'Liste les membres du groupe', usage: 'membres', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { groupMetadata } = ctx
    const total = groupMetadata.participants.length
    const admins = groupMetadata.participants.filter(p => p.admin).length
    const list = groupMetadata.participants.map((p,i) => `${i+1}. @${p.id.split('@')[0]} ${p.admin ? '👑' : ''}`).join('\n')
    await ctx.reply({ text: [`👥 *Membres — ${groupMetadata.subject}*`, ``, `📊 Total : *${total}*`, `👑 Admins : *${admins}*`, ``, list].join('\n'), mentions: groupMetadata.participants.map(p => p.id) })
  }
}