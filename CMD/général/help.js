const config = require('../../config')
module.exports = {
  config: { name: 'help', aliases: ['aide','h'], description: 'Affiche l'aide d'une commande', usage: 'help [commande]', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { args } = ctx
    if (!args[0]) {
      return ctx.reply({ text: [`╭─「 🤖 *${config.botName}* 」`, `│ Prefix : *${config.prefix}*`, `│ `, `│ 📂 *Catégories* :`, `│ • ${config.prefix}menu général`, `│ • ${config.prefix}menu jeux`, `│ • ${config.prefix}menu groupe`, `│ • ${config.prefix}menu téléchargement`, `│ • ${config.prefix}menu vip`, `│`, `│ 💡 *${config.prefix}help <commande>* pour plus d'infos`, `╰─────────────────`].join('\n') })
    }
    const cmd = ctx.commands?.get(args[0].toLowerCase())
    if (!cmd) return ctx.reply({ text: `❌ Commande *${args[0]}* introuvable.` })
    const { helpCmd } = require('../../utils/format')
    await ctx.reply({ text: helpCmd(cmd) })
  }
}