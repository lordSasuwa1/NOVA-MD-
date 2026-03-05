/**
 * NOVA-MD — CMD/vip/ia-chat.js
 */

const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'ia-chat', aliases: ['ia','ai','gpt'], description: 'Discute avec l'IA (Claude)', usage: 'ia-chat <message>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sender } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Envoie un message. Ex: *!ia-chat Explique-moi la relativité*' })
    if (!config.claudeApiKey) return ctx.reply({ text: '❌ Clé API Claude non configurée.' })
    await ctx.react('🤖')
    try {
      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: text }]
      }, {
        headers: { 'x-api-key': config.claudeApiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        timeout: 30000
      })
      const reply = res.data.content[0].text
      db.settings.incrementStat('ia_chat')
      await ctx.reply({ text: `🤖 *NOVA IA*\n\n${reply}` })
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Erreur IA : ${err.response?.data?.error?.message || err.message}` })
    }
  }
}