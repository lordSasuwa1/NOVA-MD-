/**
 * NOVA-MD — CMD/groupe/unlock.js
 */

module.exports = {
  config: { name: 'unlock', description: 'Déverrouille le groupe', usage: 'unlock', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from } = ctx
    await sock.groupSettingUpdate(from, 'not_announcement')
    db.groups.setSetting(from, 'locked', false)
    await ctx.react('🔓')
    await ctx.reply({ text: '🔓 Groupe *déverrouillé*. Tout le monde peut envoyer des messages.' })
  }
}