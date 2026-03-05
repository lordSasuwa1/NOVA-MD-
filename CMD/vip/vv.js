/**
 * NOVA-MD — CMD/vip/vv.js
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
module.exports = {
  config: { name: 'vv', description: 'Permet de voir une image/vidéo à vue unique', usage: 'vv (citer un message view-once)', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { msg, msgType, quoted, sock, from } = ctx
    const isViewOnce = msg?.message?.viewOnceMessage || msg?.message?.viewOnceMessageV2 || quoted?.viewOnceMessage
    if (!isViewOnce) return ctx.reply({ text: '⚠️ Cite un message à vue unique (🔒).' })
    await ctx.react('👁️')
    try {
      const inner = msg?.message?.viewOnceMessage?.message || msg?.message?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message
      const type = Object.keys(inner)[0]
      const buffer = await downloadMediaMessage({ message: inner }, 'buffer', {})
      if (type === 'imageMessage') {
        await sock.sendMessage(from, { image: buffer, caption: '👁️ Vue unique déverrouillée' }, { quoted: msg })
      } else if (type === 'videoMessage') {
        await sock.sendMessage(from, { video: buffer, caption: '👁️ Vue unique déverrouillée' }, { quoted: msg })
      }
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Impossible de récupérer le contenu.' }) }
  }
}