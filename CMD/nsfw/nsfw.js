/**
 * NOVA-MD — CMD/nsfw/nsfw.js
 * Active ou désactive le NSFW dans un groupe
 */

module.exports = {
  config: {
    name: 'nsfw',
    description: 'Active ou désactive le contenu NSFW dans le groupe',
    usage: 'nsfw <on/off>',
    permission: 2,
    category: 'nsfw',
    groupOnly: true,
    botAdmin: true,
  },
  async execute(ctx, db) {
    const { from, args } = ctx

    if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
      const current = db.groups.getSettings(from).nsfw
      return ctx.reply({
        text: `🔞 *NSFW* — Statut actuel : *${current ? '✅ Activé' : '❌ Désactivé'}*\n\nUtilise :\n• \`!nsfw on\` pour activer\n• \`!nsfw off\` pour désactiver`
      })
    }

    const enable = args[0].toLowerCase() === 'on'
    db.groups.setSetting(from, 'nsfw', enable)

    await ctx.react(enable ? '🔞' : '✅')
    await ctx.reply({
      text: enable
        ? `🔞 Contenu *NSFW activé* dans ce groupe.\n⚠️ Réservé aux adultes (+18)`
        : `✅ Contenu *NSFW désactivé* dans ce groupe.`
    })
  }
}
