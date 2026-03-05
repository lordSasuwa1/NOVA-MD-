const config = require('../../config')
const { formatDuration } = require('../../utils/helpers')
module.exports = {
  config: { name: 'info', description: 'Infos sur le bot', usage: 'info', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const users = db.users.count()
    const groups = db.groups.count()
    const uptime = formatDuration(process.uptime() * 1000)
    await ctx.reply({ text: [`╭─「 🤖 *${config.botName}* 」`, `│ 📦 Version : *${config.botVersion}*`, `│ ⚡ Préfixe : *${config.prefix}*`, `│ ⏱️ Uptime : *${uptime}*`, `│ 👤 Utilisateurs : *${users}*`, `│ 👥 Groupes : *${groups}*`, `│ 👑 Proprio : *${config.ownerName}*`, `╰─────────────────`].join('\n') })
  }
}