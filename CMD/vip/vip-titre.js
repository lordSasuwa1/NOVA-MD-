/**
 * NOVA-MD — CMD/vip/vip-titre.js
 */

module.exports = {
  config: { name: 'vip-titre', description: 'Change ton titre VIP', usage: 'vip-titre <titre>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { sender, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un titre. Ex: *!vip-titre Le Guerrier*' })
    if (text.length > 30) return ctx.reply({ text: '⚠️ Titre trop long (max 30 caractères).' })
    db.users.update(sender, { titre: text })
    await ctx.react('⭐')
    await ctx.reply({ text: `⭐ Ton titre VIP a été mis à jour : *${text}*` })
  }
}