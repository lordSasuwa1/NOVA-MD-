module.exports = {
  config: { name: 'tag', description: 'Mentionne un utilisateur avec un message', usage: 'tag @utilisateur [message]', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { mentionedJid, text, sock, from, msg, args } = ctx
    if (!mentionedJid?.length) return ctx.reply({ text: '⚠️ Mentionne quelqu'un. Ex: *!tag @joueur Salut !*' })
    const target = mentionedJid[0]
    const message = args.slice(1).join(' ') || 'Hey !'
    await sock.sendMessage(from, { text: `👋 @${target.split('@')[0]}\n${message}`, mentions: [target] }, { quoted: msg })
  }
}