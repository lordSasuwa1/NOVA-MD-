module.exports = {
  config: { name: 'majuscule', aliases: ['upper'], description: 'Convertit en majuscules', usage: 'majuscule <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte.' })
    await ctx.reply({ text: `🔠 ${text.toUpperCase()}` })
  }
}