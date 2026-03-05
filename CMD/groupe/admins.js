/**
 * NOVA-MD — CMD/groupe/admins.js
 */

module.exports = {
  config: { name: 'admins', description: 'Liste les admins du groupe', usage: 'admins', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { groupMetadata } = ctx
    const admins = groupMetadata.participants.filter(p => p.admin)
    const list = admins.map((p,i) => `${i+1}. @${p.id.split('@')[0]} (${p.admin === 'superadmin' ? '👑 Super' : '🛡️ Admin'})`).join('\n')
    await ctx.reply({ text: [`👑 *Admins — ${groupMetadata.subject}*`, ``, `📊 Total : *${admins.length}*`, ``, list].join('\n'), mentions: admins.map(p => p.id) })
  }
}