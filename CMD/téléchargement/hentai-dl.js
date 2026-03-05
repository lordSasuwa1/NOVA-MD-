/**
 * NOVA-MD — CMD/téléchargement/hentai-dl.js
 */

const { ytVideo } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const axios = require('axios')
const fs = require('fs')
module.exports = {
  config: { name: 'hentai-dl', description: 'Télécharge un contenu hentai animé depuis une URL (NSFW)', usage: 'hentai-dl <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une URL.' })
    const { isNsfwAllowed } = require('../nsfw/_nsfwHelper')
    if (!isNsfwAllowed(ctx, db)) return ctx.reply({ text: '🔞 NSFW désactivé dans ce groupe. Active avec *!nsfw on*' })
    await ctx.react('📥')
    let f = null
    try {
      f = await ytVideo(text, { quality: '480' })
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '🔞 Contenu téléchargé' }, { quoted: msg })
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}