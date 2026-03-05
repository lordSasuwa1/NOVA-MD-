/**
 * NOVA-MD — CMD/nsfw/nsfw-stats.js
 * Statistiques des commandes NSFW utilisées
 */

module.exports = {
  config: {
    name: 'nsfw-stats',
    description: 'Affiche les statistiques d\'utilisation des commandes NSFW',
    usage: 'nsfw-stats',
    permission: 4,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    const total = db.settings.getStat('nsfw_total')
    const allStats = db.settings.getAllStats()

    const nsfwStats = Object.entries(allStats)
      .filter(([k]) => k.startsWith('nsfw_') && k !== 'nsfw_total')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k, v]) => `  • \`${k.replace('nsfw_', '')}\` → *${v}x*`)

    await ctx.reply({
      text: [
        `🔞 *Statistiques NSFW*`,
        ``,
        `📊 Total requêtes : *${total}*`,
        ``,
        `🏆 Top 10 catégories :`,
        ...nsfwStats
      ].join('\n')
    })
  }
}
