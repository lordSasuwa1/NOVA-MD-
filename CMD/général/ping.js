const { formatDuration } = require('../../utils/helpers')
module.exports = {
  config: { name: 'ping', aliases: ['p'], description: 'Vérifie la latence du bot', usage: 'ping', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const start = Date.now()
    const msg = await ctx.reply({ text: '🏓 Calcul...' })
    const latency = Date.now() - start
    const uptime = formatDuration(process.uptime() * 1000)
    await ctx.sock.sendMessage(ctx.from, { text: [`🏓 *PONG !*`, ``, `⚡ Latence : *${latency}ms*`, `⏱️ Uptime : *${uptime}*`, `🧠 RAM : *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB*`].join('\n') }, { quoted: ctx.msg })
  }
}