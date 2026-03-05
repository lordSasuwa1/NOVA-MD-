/**
 * NOVA-MD — CMD/développeur/clear-cache.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'clear-cache', aliases: ['clearcache'], description: 'Vide le cache des modules Node.js', usage: 'clear-cache', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const before = Object.keys(require.cache).length
    Object.keys(require.cache).forEach(key => {
      if (!key.includes('node_modules') && !key.includes('database') && !key.includes('sessions')) {
        delete require.cache[key]
      }
    })
    const after = Object.keys(require.cache).length
    await ctx.react('🗑️')
    await ctx.reply({ text: [`🗑️ *Cache vidé*`, ``, `📦 Avant : *${before}* modules`, `📦 Après : *${after}* modules`, `🧹 Libérés : *${before - after}* entrées`].join('\n') })
  }
}