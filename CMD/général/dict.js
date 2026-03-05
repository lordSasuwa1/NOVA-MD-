const axios = require('axios')
module.exports = {
  config: { name: 'dict', aliases: ['definition','def'], description: 'Définition d'un mot', usage: 'dict <mot>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un mot. Ex: *!dict soleil*' })
    await ctx.react('📖')
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`, { timeout: 10000 })
      const entry = res.data[0]
      const def = entry.meanings[0]?.definitions[0]?.definition || 'Aucune définition'
      const example = entry.meanings[0]?.definitions[0]?.example || ''
      await ctx.reply({ text: [`📖 *${entry.word}*`, ``, `📝 ${def}`, example ? `\n💬 "${example}"` : ''].join('\n') })
    } catch {
      await ctx.reply({ text: `❌ Aucune définition trouvée pour *${text}*.` })
    }
  }
}