/**
 * NOVA-MD — CMD/vip/audio-dl.js
 */

const { ytAudio } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'audio-dl', aliases: ['mp3dl'], description: 'Télécharge l'audio de n'importe quelle URL (VIP)', usage: 'audio-dl <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une URL.' })
    await ctx.react('🎵')
    let filePath = null
    try {
      filePath = await ytAudio(text)
      const buf = fs.readFileSync(filePath)
      await sock.sendMessage(from, { audio: buf, mimetype: 'audio/mp4' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement audio échoué.' }) }
    finally { if (filePath) cleanTemp(filePath) }
  }
}