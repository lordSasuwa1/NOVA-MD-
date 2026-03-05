/**
 * NOVA-MD — CMD/vip/media-dl.js
 */

const { ytVideo } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const { formatSize } = require('../../utils/helpers')
const fs = require('fs')
module.exports = {
  config: { name: 'media-dl', aliases: ['dl'], description: 'Télécharge n'importe quel média (VIP)', usage: 'media-dl <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une URL. Ex: *!media-dl https://youtube.com/...*' })
    await ctx.react('📥')
    let filePath = null
    try {
      filePath = await ytVideo(text, { quality: '480' })
      const buf = fs.readFileSync(filePath)
      await sock.sendMessage(from, { video: buf, caption: '🎬 Voilà ton média !' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement échoué. Vérifie le lien.' }) }
    finally { if (filePath) cleanTemp(filePath) }
  }
}