/**
 * NOVA-MD — CMD/nsfw/nsfw-status.js
 * Affiche le statut NSFW du groupe
 */

module.exports = {
  config: {
    name: 'nsfw-status',
    description: 'Affiche le statut NSFW du groupe',
    usage: 'nsfw-status',
    permission: 0,
    category: 'nsfw',
    groupOnly: true,
  },
  async execute(ctx, db) {
    const { from } = ctx
    const settings = db.groups.getSettings(from)
    const enabled = !!settings.nsfw

    await ctx.reply({
      text: [
        `🔞 *NSFW Status*`,
        ``,
        `📊 État : *${enabled ? '✅ Activé' : '❌ Désactivé'}*`,
        enabled ? `\n⚠️ Ce groupe autorise le contenu adulte (+18).` : `\nUn admin peut activer avec \`!nsfw on\``
      ].join('\n')
    })
  }
}
