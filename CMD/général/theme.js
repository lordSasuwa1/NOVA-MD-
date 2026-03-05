/**
 * NOVA-MD — CMD/général/theme.js
 */

module.exports = {
  config: {
    name: 'theme',
    aliases: ['settheme'],
    description: 'Change le thème visuel du bot',
    usage: 'theme <royal|cyber|kawaii>',
    permission: 0,
    category: 'général'
  },

  async execute(ctx, db) {
    const { args, sender, from } = ctx
    const themes = require('../../data/themes/themes.json')
    const available = Object.keys(themes)

    // Sans argument → affiche les thèmes dispo
    if (!args[0]) {
      const current = db.settings.get('theme') || 'royal'
      const list = available.map(k => {
        const t = themes[k]
        const active = k === current ? ' ✅ *actuel*' : ''
        return `${t.emoji} *${k}* — ${t.name}${active}`
      }).join('\n')

      return ctx.reply({ text: [
        `🎨 *Thèmes disponibles*\n`,
        list,
        `\n💡 Change avec : *!theme <nom>*`
      ].join('\n') })
    }

    const choice = args[0].toLowerCase()
    if (!available.includes(choice)) {
      return ctx.reply({ text: `❌ Thème *${choice}* inconnu.\nDisponibles : ${available.join(', ')}` })
    }

    db.settings.set('theme', choice)
    const t = themes[choice]

    await ctx.react('🎨')
    await ctx.reply({ text: [
      `${t.emoji} Thème changé en *${t.name}* !`,
      ``,
      `Aperçu :`,
      t.menu.header('NOVA-MD', 'Sasuwa7'),
      t.menu.section('Général', t.icons.general),
      t.menu.cmd('ping', 'Tester la latence'),
      t.menu.cmd('menu', 'Afficher le menu'),
      t.menu.footer(291, '!')
    ].join('\n') })
  }
}
