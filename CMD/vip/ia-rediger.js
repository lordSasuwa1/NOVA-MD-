/**
 * NOVA-MD — CMD/vip/ia-rediger.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-rediger', aliases: ['rediger','ecrire'], description: 'Rédige un texte avec l'IA', usage: 'ia-rediger <sujet>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un sujet. Ex: *!ia-rediger une lettre de motivation pour un stage informatique*' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('✍️')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 1024,
        messages: [{ role: 'user', content: `Rédige en français : ${text}` }]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `✍️ *Rédaction*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Rédaction échouée.' }) }
  }
}