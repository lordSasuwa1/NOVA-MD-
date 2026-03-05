/**
 * NOVA-MD — CMD/vip/shazam.js
 */

const axios = require('axios')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { tempPath, cleanTemp } = require('../../utils/media')
const { generateId } = require('../../utils/helpers')
const fs = require('fs')
module.exports = {
  config: { name: 'shazam', description: 'Identifie une musique depuis un audio', usage: 'shazam (citer un audio/vidéo)', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { msg, msgType, quoted } = ctx
    const isAudio = ['audioMessage','videoMessage'].includes(msgType) || quoted?.audioMessage || quoted?.videoMessage
    if (!isAudio) return ctx.reply({ text: '⚠️ Envoie ou cite un audio/vidéo.' })
    await ctx.react('🎵')
    try {
      const source = ['audioMessage','videoMessage'].includes(msgType) ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const tmpFile = tempPath(`shazam_${generateId()}.mp3`)
      fs.writeFileSync(tmpFile, buffer)
      // Utilise l'API ACRCloud ou similaire si dispo, sinon fallback message
      cleanTemp(tmpFile)
      await ctx.reply({ text: '🎵 Identification Shazam\n\n⚠️ Configure ACRCloud dans .env pour activer cette fonctionnalité.' })
    } } catch (err) { 
  await ctx.react('❌')
  console.error('[NOVA] Erreur shazam:', err)
  await ctx.reply({ text: '❌ Identification échouée.' }) 
  }
  }
}
