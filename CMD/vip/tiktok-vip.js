/**
 * NOVA-MD — CMD/vip/tiktok-vip.js
 */

const { tiktok } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'tiktok-vip', description: 'Télécharge TikTok sans watermark (VIP, HD)', usage: 'tiktok-vip <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien TikTok.' })
    await ctx.react('🎵')
    let f = null
    try {
      f = await tiktok(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '🎵 TikTok HD (sans watermark)' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement TikTok VIP échoué.' }) }
    finally { if (f) cleanTemp(f) }
  }
}