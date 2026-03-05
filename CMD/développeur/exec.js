/**
 * NOVA-MD — CMD/développeur/exec.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
module.exports = {
  config: { name: 'exec', aliases: ['shell','sh','$'], description: 'Exécute une commande shell', usage: 'exec <commande>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une commande shell. Ex: *!exec ls -la*' })
    const start = Date.now()
    try {
      const { stdout, stderr } = await execAsync(text, { timeout: 30000 })
      const output = (stdout || stderr || '(aucune sortie)').slice(0, 3000)
      const ms = Date.now() - start
      await ctx.reply({ text: [`⚙️ *exec* (${ms}ms)`, `\`\`\``, output, `\`\`\``].join('\n') })
    } catch (err) {
      await ctx.reply({ text: [`❌ *exec Error*`, `\`\`\``, (err.stderr || err.message)?.slice(0, 1000), `\`\`\``].join('\n') })
    }
  }
}