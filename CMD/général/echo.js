const sessions = new Map()
module.exports = {
  config: { name: 'echo', description: 'Répète automatiquement chaque message (mode écho)', usage: 'echo', permission: 2, category: 'général', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    db.groups.setSetting(from, 'echo', true)
    await ctx.reply({ text: '🔁 Mode *écho* activé ! Utilise *!echo-stop* pour désactiver.' })
  }
}