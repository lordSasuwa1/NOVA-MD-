/**
 * NOVA-MD — CMD/vip/twitter-vip.js
 */

const { twitter } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'twitter-vip', description: 'Télécharge Twitter/X HD (VIP)', usage: 'twitter-vip <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Twitter/X.' })
    await ctx.react('🐦')
    let f = null
    try {
      f = await twitter(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '🐦 Twitter/X HD' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement Twitter échoué.' }) }
    finally { if (f) cleanTemp(f) }
  }
}