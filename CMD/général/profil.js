module.exports = {
  config: { name: 'profil', aliases: ['profile','me'], description: 'Affiche ton profil', usage: 'profil', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sender, pushName } = ctx
    let user = db.users.get(sender)
    if (!user) user = db.users.create(sender, pushName)
    const { profileMsg } = require('../../utils/format')
    await ctx.reply({ text: profileMsg(user, pushName) })
  }
}