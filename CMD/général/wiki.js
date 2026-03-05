const axios = require('axios')
module.exports = {
  config: { name: 'wiki', aliases: ['wikipedia'], description: 'Recherche sur Wikipedia', usage: 'wiki <sujet>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un sujet. Ex: *!wiki intelligence artificielle*' })
    await ctx.react('🔍')
    try {
      const search = await axios.get(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`, { timeout: 10000 })
      const { title, extract } = search.data
      const short = extract?.slice(0, 600) || 'Aucun résumé disponible.'
      await ctx.reply({ text: [`📚 *${title}*`, ``, short, ``, `🔗 https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`].join('\n') })
    } catch {
      await ctx.reply({ text: `❌ Aucun résultat Wikipedia pour *${text}*.` })
    }
  }
}