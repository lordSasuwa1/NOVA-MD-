/**
 * NOVA-MD — CMD/vip/instagram-vip.js
 */

const { instagram } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'instagram-vip', description: 'Télécharge Instagram HD (VIP)', usage: 'instagram-vip <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Instagram.' })
    await ctx.react('📸')
    let f = null
    try {
      f = await instagram(text)
      const buf = fs.readFileSync(f)
      const isVideo = f.endsWith('.mp4')
      await sock.sendMessage(from, isVideo ? { video: buf, caption: '📸 Instagram HD' } : { image: buf, caption: '📸 Instagram HD' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement Instagram échoué.' }) }
    finally { if (f) cleanTemp(f) }
  }
}