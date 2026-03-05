const config = require('../../config')
const { menuCategory } = require('../../utils/format')
const CATEGORIES = {
  général: ['ping','help','menu','info','profil','pp','tts','tr','dict','wiki','météo','heure','calc','qr','sticker','toimg','ascii','morse','binaire','tag','echo','random'],
  jeux: ['pendu','morpion','puissance4','blackjack','quiz','shifumi','roulette','pile','dé','slotmachine','devinette','enigme','charade','blagues'],
  groupe: ['tagall','membres','admins','warn','kick','ban','mute','lock','bienvenue','antilink','antispam','antinsfw'],
  téléchargement: ['yt','ytmp3','tiktok','fb','twitter','instagram','spotify'],
  vip: ['ia-chat','ia-image','ia-coder','vv','shazam','lyrics'],
}
module.exports = {
  config: { name: 'menu', description: 'Affiche le menu du bot', usage: 'menu [catégorie]', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { args, pushName } = ctx
    const cat = args[0]?.toLowerCase()
    if (cat && CATEGORIES[cat]) {
      return ctx.reply({ text: menuCategory('📂', cat.toUpperCase(), CATEGORIES[cat]) })
    }
    await ctx.reply({ text: [`╭─「 🤖 *${config.botName} v${config.botVersion}* 」`, `│ 👋 Salut *${pushName}* !`, `│ Prefix : *${config.prefix}*`, `│`, ...Object.keys(CATEGORIES).map(c => `│ 📂 *${config.prefix}menu ${c}*`), `│`, `│ 💡 *${config.prefix}help <cmd>* pour les détails`, `╰─────────────────`].join('\n') })
  }
}