/**
 * NOVA-MD — CMD/développeur/set-perm.js
 * ⚠️ PERMISSION 5 — Réservé aux développeurs uniquement
 */

module.exports = {
  config: { name: 'set-perm', description: 'Change le niveau de permission d'un utilisateur', usage: 'set-perm @user <0-5>', permission: 5, category: 'développeur' },
  async execute(ctx, db) {
    const { mentionedJid, quotedSender, args } = ctx
    const target = mentionedJid?.[0] || quotedSender
    const perm = parseInt(args[args.length - 1])
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un utilisateur.' })
    if (isNaN(perm) || perm < 0 || perm > 5) return ctx.reply({ text: '⚠️ Permission entre 0 et 5.' })
    const LABELS = ['Public','Membre','Admin','VIP','Owner','Dev']
    db.users.create(target, '')
    db.users.update(target, { permission: perm })
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Permission de @${target.split('@')[0]} définie à *${perm}* (${LABELS[perm]||'?'}).`, mentions: [target] })
  }
}