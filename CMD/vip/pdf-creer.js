/**
 * NOVA-MD — CMD/vip/pdf-créer.js
 */

const axios = require('axios')
module.exports = {
  config: { name: 'pdf-créer', aliases: ['pdf'], description: 'Crée un PDF depuis un texte', usage: 'pdf-créer <titre>|<contenu>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Ex: *!pdf-créer Mon rapport|Contenu du rapport...*' })
    const [titre, ...rest] = text.split('|')
    const contenu = rest.join('|') || titre
    await ctx.react('📄')
    try {
      const html = `<h1>${titre}</h1><p>${contenu.replace(/\n/g, '</p><p>')}</p>`
      const res = await axios.post('https://api.pdfshift.io/v3/convert/pdf', { source: html }, {
        responseType: 'arraybuffer', timeout: 30000,
        auth: { username: 'api', password: process.env.PDFSHIFT_KEY || '' }
      })
      await sock.sendMessage(from, { document: Buffer.from(res.data), mimetype: 'application/pdf', fileName: `${titre.slice(0,30)}.pdf`, caption: '📄 PDF créé !' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Création PDF échouée. Configure PDFSHIFT_KEY dans .env.' }) }
  }
}
