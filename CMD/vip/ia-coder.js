/**
 * NOVA-MD — CMD/vip/ia-coder.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-coder', aliases: ['code','coder'], description: 'Génère du code avec l'IA', usage: 'ia-coder <description>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Décris le code à générer. Ex: *!ia-coder fonction Python qui calcule fibonacci*' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('💻')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 2048,
        messages: [{ role: 'user', content: `Génère du code pour : ${text}\nAjoute des commentaires clairs.` }]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `💻 *Code généré*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Génération de code échouée.' }) }
  }
}