/**
 * NOVA-MD — CMD/vip/facebook-vip.js
 */

const { facebook } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'facebook-vip', description: 'Télécharge Facebook HD (VIP)', usage: 'facebook-vip <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Facebook.' })
    await ctx.react('📘')
    let f = null
    try {
      f = await facebook(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '📘 Facebook HD' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement Facebook échoué.' }) }
    finally { if (f) cleanTemp(f) }
  }
}