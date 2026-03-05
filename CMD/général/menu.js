/**
 * NOVA-MD — CMD/général/menu.js
 */

const { getActiveTheme, buildMenu } = require('../../utils/themeHelper')
const config = require('../../config')

module.exports = {
  config: {
    name: 'menu',
    aliases: ['aide', 'help2'],
    description: 'Affiche le menu principal',
    usage: 'menu [catégorie]',
    permission: 0,
    category: 'général'
  },

  async execute(ctx, db) {
    const { args, commands, sock, from, msg } = ctx
    const t = getActiveTheme(db)

    // ── Menu d'une catégorie précise ───────────────────────────────
    if (args[0]) {
      const cat = args[0].toLowerCase()
      const cmds = [...(commands?.values() || [])]
        .filter(c => c.config.category === cat)

      if (!cmds.length) return ctx.reply({ text: `❌ Catégorie *${cat}* inconnue ou vide.` })

      const lines = [t.menu.header(config.botName, config.ownerName)]
      lines.push(t.menu.section(cat.toUpperCase(), t.icons[cat] || '📂'))
      for (const c of cmds) {
        lines.push(t.menu.cmd(config.prefix + c.config.name, c.config.description || ''))
      }
      lines.push(t.menu.footer(cmds.length, config.prefix))
      return ctx.reply({ text: lines.join('\n') })
    }

    // ── Menu principal ─────────────────────────────────────────────
    const commandsByCategory = {}
    for (const cmd of (commands?.values() || [])) {
      const cat = cmd.config.category || 'général'
      if (!commandsByCategory[cat]) commandsByCategory[cat] = []
      commandsByCategory[cat].push(cmd.config)
    }

    const menuText = buildMenu(db, config, commandsByCategory)
    await sock.sendMessage(from, { text: menuText }, { quoted: msg })
  }
}
