/**
 * NOVA-MD — CMD/vip/vip-status.js
 */

const { formatDate } = require('../../utils/helpers')
module.exports = {
  config: { name: 'vip-status', description: 'Affiche ton statut VIP', usage: 'vip-status', permission: 0, category: 'vip' },
  async execute(ctx, db) {
    const { sender, pushName } = ctx
    const user = db.users.get(sender) || db.users.create(sender, pushName)
    const isVip = db.users.isVip(sender)
    const expire = user.vipExpire ? formatDate(user.vipExpire) : 'Illimité'
    await ctx.reply({ text: [`╭─「 ⭐ *STATUT VIP* 」`, `│ 👤 Utilisateur : *${pushName}*`, `│ 🏅 Statut : *${isVip ? '⭐ VIP Actif' : '👤 Standard'}*`, isVip ? `│ 📅 Expire : *${expire}*` : `│ 💡 Contacte le proprio pour devenir VIP`, `╰──────────────────`].join('\n') })
  }
}