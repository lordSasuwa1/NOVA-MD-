/**
 * NOVA-MD — CMD/groupe/groupinfo.js
 */

module.exports = {
  config: { name: 'groupinfo', aliases: ['ginfo','infogroupe'], description: 'Infos sur le groupe', usage: 'groupinfo', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, groupMetadata } = ctx
    const settings = db.groups.getSettings(from)
    const { groupInfoMsg } = require('../../utils/format')
    await ctx.reply({ text: groupInfoMsg(groupMetadata, settings) })
  }
}