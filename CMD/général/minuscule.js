module.exports = {
  config: { name: 'minuscule', aliases: ['lower'], description: 'Convertit en minuscules', usage: 'minuscule <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte.' })
    await ctx.reply({ text: `🔡 ${text.toLowerCase()}` })
  }
}