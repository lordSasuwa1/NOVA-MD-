/**
 * NOVA-MD — CMD/vip/vocal-texte.js
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { tempPath, cleanTemp } = require('../../utils/media')
const { generateId } = require('../../utils/helpers')
const fs = require('fs')
module.exports = {
  config: { name: 'vocal-texte', aliases: ['stt','transcribe'], description: 'Transcrit un vocal en texte', usage: 'vocal-texte (citer un message vocal)', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { msg, msgType, quoted, sock, from } = ctx
    const isPtt = msgType === 'audioMessage' || quoted?.audioMessage
    if (!isPtt) return ctx.reply({ text: '⚠️ Envoie ou cite un message vocal.' })
    await ctx.react('🎤')
    try {
      const source = msgType === 'audioMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      await ctx.reply({ text: '🎤 Transcription\n\n⚠️ Configure Whisper API (OpenAI) dans .env pour activer la transcription vocale.' })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Transcription échouée.' }) }
  }
}