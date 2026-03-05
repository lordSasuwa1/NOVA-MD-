/**
 * NOVA-MD — CMD/groupe/setbienvenue.js
 */

module.exports = {
  config: { name: 'setbienvenue', description: 'Personnalise le message de bienvenue', usage: 'setbienvenue <message>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Écris le message. Variables : {nom} {groupe} {membres}\nEx: *!setbienvenue Bienvenue {nom} dans {groupe} !*' })
    db.groups.setWelcome(from, text)
    db.groups.setSetting(from, 'welcomeMsg', text)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Message de bienvenue personnalisé !\n\nAperçu : ${text.replace('{nom}','Membre').replace('{groupe}','Groupe').replace('{membres}','10')}` })
  }
}