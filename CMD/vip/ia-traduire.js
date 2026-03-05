/**
 * NOVA-MD — CMD/vip/ia-traduire.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-traduire', description: 'Traduction de haute qualité avec l'IA', usage: 'ia-traduire <langue> <texte>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { args, quoted } = ctx
    const lang = args[0]
    const input = args.slice(1).join(' ') || quoted?.conversation || ''
    if (!lang || !input) return ctx.reply({ text: '⚠️ Ex: *!ia-traduire anglais Bonjour tout le monde*' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('🌐')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 1024,
        messages: [{ role: 'user', content: `Traduis ce texte en ${lang}. Retourne uniquement la traduction :\n\n${input}` }]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `🌐 *Traduction (${lang})*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Traduction IA échouée.' }) }
  }
}