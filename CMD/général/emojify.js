const fs = require('fs'), path = require('path')
module.exports = {
  config: { name: 'emojify', description: 'Remplace des mots par des emojis', usage: 'emojify <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte.' })
    let dict = {}
    try { dict = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/emojify.json'), 'utf8')) } catch {}
    const result = text.split(' ').map(w => dict[w.toLowerCase()] ? dict[w.toLowerCase()] + ' ' + w : w).join(' ')
    await ctx.reply({ text: `😊 ${result}` })
  }
}