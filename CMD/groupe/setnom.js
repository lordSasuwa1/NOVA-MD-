/**
 * NOVA-MD — CMD/groupe/setnom.js
 */

module.exports = {
  config: { name: 'setnom', description: 'Change le nom du groupe', usage: 'setnom <nom>', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un nom. Ex: *!setnom Mon Super Groupe*' })
    await sock.groupUpdateSubject(from, text)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Nom du groupe changé en *${text}*.` })
  }
}