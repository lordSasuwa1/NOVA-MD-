module.exports = {
  config: { name: 'echo-stop', description: 'Désactive le mode écho', usage: 'echo-stop', permission: 2, category: 'général', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    db.groups.setSetting(from, 'echo', false)
    await ctx.reply({ text: '🔇 Mode *écho* désactivé.' })
  }
}