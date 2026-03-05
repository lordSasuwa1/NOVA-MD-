module.exports = {
  config: { name: 'heure', aliases: ['time','date'], description: 'Affiche la date et l'heure', usage: 'heure [timezone]', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { args } = ctx
    const tz = args[0] || 'Africa/Cotonou'
    try {
      const now = new Date().toLocaleString('fr-FR', { timeZone: tz, dateStyle: 'full', timeStyle: 'medium' })
      await ctx.reply({ text: `🕐 *Date & Heure*\n\n📅 ${now}\n🌍 Fuseau : *${tz}*` })
    } catch {
      await ctx.reply({ text: `❌ Fuseau horaire invalide : *${tz}*` })
    }
  }
}