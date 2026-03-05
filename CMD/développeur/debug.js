/**
 * NOVA-MD — CMD/développeur/debug.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

const util = require('util')
module.exports = {
  config: { name: 'debug', description: 'Affiche les infos de débogage d'un message', usage: 'debug (répondre à un message)', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { msg, sender, from, msgType, pushName, isGroup, isSenderAdmin, isOwner, groupMetadata } = ctx
    const info = {
      sender, from, msgType, pushName,
      isGroup, isSenderAdmin, isOwner,
      groupName: groupMetadata?.subject || null,
      msgKeys: Object.keys(msg?.message || {}),
      timestamp: msg?.messageTimestamp,
    }
    await ctx.reply({ text: [`🔍 *DEBUG*`, `\`\`\`json`, JSON.stringify(info, null, 2).slice(0, 3000), `\`\`\``].join('\n') })
  }
}