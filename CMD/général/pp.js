module.exports = {
  config: { name: 'pp', description: 'Affiche la photo de profil d'un utilisateur', usage: 'pp [@utilisateur]', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, sender, mentionedJid, quotedSender, msg } = ctx
    const target = mentionedJid?.[0] || quotedSender || sender
    try {
      const url = await sock.profilePictureUrl(target, 'image')
      await sock.sendMessage(from, { image: { url }, caption: `📸 Photo de profil de @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg })
    } catch {
      await ctx.reply({ text: `❌ Pas de photo de profil disponible pour @${target.split('@')[0]}`, mentions: [target] })
    }
  }
}