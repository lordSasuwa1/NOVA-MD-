const axios = require('axios')
module.exports = {
  config: { name: 'lien', aliases: ['short','shortlink'], description: 'Raccourcit un lien', usage: 'lien <url>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien. Ex: *!lien https://exemple.com/long-url*' })
    await ctx.react('🔗')
    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`, { timeout: 10000 })
      await ctx.reply({ text: `🔗 *Lien raccourci*\n\n🔗 Original : ${text.slice(0, 60)}...\n✅ Court : *${res.data}*` })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Impossible de raccourcir ce lien.' })
    }
  }
}