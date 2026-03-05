/**
 * NOVA-MD — CMD/vip/ia-image.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-image', aliases: ['imagine'], description: 'Génère une image avec l'IA', usage: 'ia-image <description>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Décris l'image. Ex: *!ia-image un chat astronaute dans l'espace*' })
    if (!config.openaiApiKey) return ctx.reply({ text: '❌ Clé API OpenAI non configurée (OPENAI_API_KEY dans .env).' })
    await ctx.react('🎨')
    try {
      const res = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3', prompt: text, n: 1, size: '1024x1024'
      }, {
        headers: { Authorization: `Bearer ${config.openaiApiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000
      })
      const url = res.data.data[0].url
      const img = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
      await sock.sendMessage(from, { image: Buffer.from(img.data), caption: `🎨 *${text.slice(0,80)}*` }, { quoted: msg })
      db.settings.incrementStat('ia_image')
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Génération d'image échouée.' })
    }
  }
}