/**
 * NOVA-MD — CMD/groupe/lock.js
 */

module.exports = {
  config: { name: 'lock', description: 'Verrouille le groupe (seuls les admins peuvent écrire)', usage: 'lock', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from } = ctx
    await sock.groupSettingUpdate(from, 'announcement')
    db.groups.setSetting(from, 'locked', true)
    await ctx.react('🔒')
    await ctx.reply({ text: '🔒 Groupe *verrouillé*. Seuls les admins peuvent envoyer des messages.' })
  }
}