/**
 * NOVA-MD — CMD/développeur/perf.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'perf', description: 'Affiche les métriques de performance du processus', usage: 'perf', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const mem = process.memoryUsage()
    const cpu = process.cpuUsage()
    const uptime = process.uptime()
    const toMB = b => (b / 1024 / 1024).toFixed(2)
    await ctx.reply({ text: [
      `⚡ *PERFORMANCES NOVA-MD*`,
      ``,
      `🧠 *Mémoire*`,
      `  heap used  : ${toMB(mem.heapUsed)} MB`,
      `  heap total : ${toMB(mem.heapTotal)} MB`,
      `  RSS        : ${toMB(mem.rss)} MB`,
      `  external   : ${toMB(mem.external)} MB`,
      ``,
      `⏱️ *Uptime* : ${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${Math.floor(uptime%60)}s`,
      `🟢 *Node.js* : ${process.version}`,
      `🖥️ *Plateforme* : ${process.platform} (${process.arch})`,
    ].join('\n') })
  }
}