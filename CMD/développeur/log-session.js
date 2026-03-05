/**
 * NOVA-MD — CMD/développeur/log-session.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

const fs = require('fs')
const path = require('path')
module.exports = {
  config: { name: 'log-session', description: 'Affiche les fichiers de session Baileys', usage: 'log-session [session_id]', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { args } = ctx
    const config = require('../../config')
    const sessionId = args[0] || config.sessionId
    const sessionDir = path.join(__dirname, '../../sessions', sessionId)
    if (!fs.existsSync(sessionDir)) return ctx.reply({ text: `❌ Session *${sessionId}* introuvable.` })
    const files = fs.readdirSync(sessionDir)
    const sizes = files.map(f => {
      const stat = fs.statSync(path.join(sessionDir, f))
      return `• ${f} (${(stat.size/1024).toFixed(1)} KB)`
    })
    await ctx.reply({ text: [`📁 *Session : ${sessionId}*`, `📊 ${files.length} fichiers`, ``, ...sizes.slice(0, 20)].join('\n') })
  }
}