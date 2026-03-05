/**
 * NOVA-MD — CMD/groupe/setdesc.js
 */

module.exports = {
  config: { name: 'setdesc', description: 'Change la description du groupe', usage: 'setdesc <description>', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une description.' })
    await sock.groupUpdateDescription(from, text)
    await ctx.react('✅')
    await ctx.reply({ text: '✅ Description du groupe mise à jour !' })
  }
}