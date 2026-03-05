module.exports = {
  config: { name: 'citer', aliases: ['cite','quote'], description: 'Cite un message', usage: 'citer (répondre à un message)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { quoted, quotedSender, sock, from, msg } = ctx
    if (!quoted) return ctx.reply({ text: '⚠️ Réponds à un message à citer.' })
    const text = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || '📎 Média'
    await ctx.reply({ text: `💬 *Citation de @${quotedSender?.split('@')[0]}*\n\n_${text}_`, mentions: quotedSender ? [quotedSender] : [] })
  }
}