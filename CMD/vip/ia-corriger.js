/**
 * NOVA-MD — CMD/vip/ia-corriger.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-corriger', aliases: ['corriger','correct'], description: 'Corrige un texte avec l'IA', usage: 'ia-corriger <texte>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, quoted } = ctx
    const input = text || quoted?.conversation || quoted?.extendedTextMessage?.text || ''
    if (!input) return ctx.reply({ text: '⚠️ Donne un texte à corriger.' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('✅')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514', max_tokens: 1024,
        messages: [{ role: 'user', content: `Corrige les fautes d'orthographe et de grammaire dans ce texte. Retourne uniquement le texte corrigé :\n\n${input}` }]
      }, { headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, timeout: 30000 })
      await ctx.reply({ text: `✅ *Texte corrigé*\n\n${res.data.content[0].text}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Correction échouée.' }) }
  }
}