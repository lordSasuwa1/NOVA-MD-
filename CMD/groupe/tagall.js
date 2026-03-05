/**
 * NOVA-MD — CMD/groupe/tagall.js
 */

module.exports = {
  config: { name: 'tagall', aliases: ['mentionall'], description: 'Mentionne tous les membres du groupe', usage: 'tagall [message]', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { sock, from, groupMetadata, args, msg } = ctx
    const members = groupMetadata.participants.map(p => p.id)
    const text = args.join(' ') || '📢 Attention tout le monde !'
    const mentions = members.map(m => `@${m.split('@')[0]}`).join(' ')
    await sock.sendMessage(from, { text: `${text}\n\n${mentions}`, mentions: members }, { quoted: msg })
  }
}