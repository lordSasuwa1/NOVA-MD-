const axios = require('axios')
module.exports = {
  config: { name: 'tr', aliases: ['translate','traduire'], description: 'Traduit un texte', usage: 'tr <langue> <texte> | tr <langue> (en réponse)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { args, text, quoted } = ctx
    const lang = args[0] || 'fr'
    const toTranslate = args.slice(1).join(' ') || (quoted ? Object.values(quoted)[0]?.text || Object.values(quoted)[0]?.caption : '') || ''
    if (!toTranslate) return ctx.reply({ text: '⚠️ Donne un texte ou réponds à un message. Ex: *!tr en Bonjour*' })
    await ctx.react('🌐')
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(toTranslate)}&langpair=auto|${lang}`
      const res = await axios.get(url, { timeout: 10000 })
      const translated = res.data.responseData.translatedText
      await ctx.reply({ text: `🌐 *Traduction (${lang})* :\n\n${translated}` })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Traduction échouée. Vérifie le code langue (ex: fr, en, es, ar)' })
    }
  }
}