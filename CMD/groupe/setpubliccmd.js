/**
 * NOVA-MD — CMD/groupe/setpubliccmd.js
 */

module.exports = {
  config: { name: 'setpubliccmd', description: 'Définit les commandes accessibles en mode privé', usage: 'setpubliccmd <cmd1,cmd2,...>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Ex: *!setpubliccmd ping,help,menu*' })
    const cmds = text.split(',').map(c => c.trim().toLowerCase()).filter(Boolean)
    db.groups.setSetting(from, 'publicCmds', cmds)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Commandes publiques : ${cmds.map(c => `*${c}*`).join(', ')}` })
  }
}