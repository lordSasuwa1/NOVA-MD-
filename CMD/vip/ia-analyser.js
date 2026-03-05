/**
 * NOVA-MD — CMD/vip/ia-analyser.js
 */

const axios = require('axios')
const config = require('../../config')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
module.exports = {
  config: { name: 'ia-analyser', aliases: ['analyser','analyse'], description: 'Analyse une image avec l'IA', usage: 'ia-analyser [question] (envoyer/citer une image)', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, msg, msgType, quoted, sock, from } = ctx
    const isImg = msgType === 'imageMessage' || quoted?.imageMessage
    if (!isImg) return ctx.reply({ text: '⚠️ Envoie ou cite une image.' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('🔍')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const b64 = buffer.toString('base64')
      const question = text || 'Décris cette image en détail en français.'
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 1024,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
          { type: 'text', text: question }
        ]}]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `🔍 *Analyse IA*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Analyse échouée.' }) }
  }
}