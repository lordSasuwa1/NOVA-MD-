const axios = require('axios')
const { tempPath, cleanTemp } = require('../../utils/media')
const { generateId } = require('../../utils/helpers')
module.exports = {
  config: { name: 'tts', description: 'Convertit du texte en audio (text-to-speech)', usage: 'tts <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte à convertir. Ex: *!tts Bonjour tout le monde*' })
    await ctx.react('🔊')
    try {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
      const outPath = tempPath(`tts_${generateId()}.mp3`)
      require('fs').writeFileSync(outPath, res.data)
      await sock.sendMessage(from, { audio: require('fs').readFileSync(outPath), mimetype: 'audio/mp4', ptt: true }, { quoted: msg })
      cleanTemp(outPath)
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Échec de la conversion TTS.' })
    }
  }
}