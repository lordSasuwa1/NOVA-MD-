/**
 * NOVA-MD — CMD/vip/ia-resume.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-resume', aliases: ['resume'], description: 'Résume un texte avec l'IA', usage: 'ia-resume <texte> (ou citer un message)', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, quoted } = ctx
    const input = text || quoted?.conversation || quoted?.extendedTextMessage?.text || ''
    if (!input) return ctx.reply({ text: '⚠️ Donne un texte à résumer ou cite un message.' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('📝')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 512,
        messages: [{ role: 'user', content: `Résume ce texte en français de façon concise :\n\n${input}` }]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `📝 *Résumé*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Résumé échoué.' }) }
  }
}