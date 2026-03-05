module.exports = {
  config: { name: 'random', description: 'Choisit aléatoirement parmi des options', usage: 'random <opt1>|<opt2>|...', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne des options séparées par |. Ex: *!random pizza|burger|tacos*' })
    const options = text.split('|').map(o => o.trim()).filter(Boolean)
    if (options.length < 2) return ctx.reply({ text: '⚠️ Donne au moins 2 options séparées par |' })
    const chosen = options[Math.floor(Math.random() * options.length)]
    await ctx.reply({ text: `🎲 *Choix aléatoire*\n\n🎯 Résultat : *${chosen}*\n📋 Options : ${options.join(', ')}` })
  }
}