/**
 * NOVA-MD — CMD/vip/lien-vip.js
 */

const axios = require('axios')
module.exports = {
  config: { name: 'lien-vip', description: 'Raccourcit un lien avec titre personnalisé (VIP)', usage: 'lien-vip <url> [alias]', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { args } = ctx
    const url = args[0]
    if (!url) return ctx.reply({ text: '⚠️ Donne un lien. Ex: *!lien-vip https://example.com mon-lien*' })
    await ctx.react('🔗')
    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 })
      await ctx.reply({ text: [`🔗 *Lien VIP raccourci*`, ``, `📎 Original : ${url.slice(0,60)}...`, `✅ Court : *${res.data}*`].join('\n') })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Raccourcissement échoué.' }) }
  }
}