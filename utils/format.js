/**
 * NOVA-MD — utils/format.js
 * Formatage des messages, encadrés ASCII, menus
 */

const config = require('../config')

// ─── BORDURES ASCII ───────────────────────────────────────────────────────────

const BORDERS = {
  simple: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  round:  { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  bold:   { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
}

/**
 * Crée un encadré ASCII autour d'un texte
 */
function box(text, style = 'round', width = 30) {
  const b = BORDERS[style] || BORDERS.round
  const lines = text.split('\n')
  const top    = b.tl + b.h.repeat(width) + b.tr
  const bottom = b.bl + b.h.repeat(width) + b.br
  const mid    = lines.map(l => {
    const pad = width - l.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/[^\x00-\x7F]/g, '  ').length
    return b.v + ' ' + l + ' '.repeat(Math.max(0, pad - 1)) + b.v
  }).join('\n')

  return `${top}\n${mid}\n${bottom}`
}

/**
 * Ligne de séparation
 */
function separator(char = '─', length = 30) {
  return char.repeat(length)
}

// ─── FORMATAGE COMMANDES ─────────────────────────────────────────────────────

/**
 * Formate un message d'aide pour une commande
 */
function helpCmd(cmd) {
  const c = cmd.config
  const lines = [
    `*╭─「 ${config.botName} 」*`,
    `*│* 📌 Commande : *${config.prefix}${c.name}*`,
    `*│* 📝 Description : ${c.description || 'Aucune'}`,
  ]

  if (c.usage) lines.push(`*│* 💡 Usage : \`${config.prefix}${c.usage}\``)
  if (c.aliases?.length) lines.push(`*│* 🔗 Alias : ${c.aliases.map(a => `\`${config.prefix}${a}\``).join(', ')}`)
  if (c.example) lines.push(`*│* 📖 Exemple : \`${config.prefix}${c.example}\``)
  if (c.groupOnly) lines.push(`*│* 👥 Groupe uniquement`)
  if (c.privateOnly) lines.push(`*│* 💬 Privé uniquement`)

  lines.push(`*╰────────────────*`)
  return lines.join('\n')
}

/**
 * Formate une liste de commandes par catégorie pour le menu
 */
function menuCategory(emoji, title, commands) {
  const cmds = commands.map(c => `  ╰➤ *${config.prefix}${c}*`).join('\n')
  return `*╭─「 ${emoji} ${title} 」*\n${cmds}\n*╰──────────────*`
}

// ─── MESSAGES SYSTÈME ────────────────────────────────────────────────────────

/**
 * Message de bienvenue dans un groupe
 */
function welcomeMsg(pushName, groupName, memberCount) {
  return (
    `✨ *Bienvenue, ${pushName} !* ✨\n\n` +
    `👥 Tu rejoins *${groupName}*\n` +
    `👤 Membres : *${memberCount}*\n\n` +
    `📋 Tape *${config.prefix}rules* pour voir les règles du groupe.`
  )
}

/**
 * Message d'au revoir dans un groupe
 */
function goodbyeMsg(pushName, groupName) {
  return (
    `👋 *Au revoir, ${pushName} !*\n\n` +
    `Tu as quitté *${groupName}*.\n` +
    `On espère te revoir bientôt 💙`
  )
}

/**
 * Message d'avertissement (warn)
 */
function warnMsg(target, reason, count, max) {
  return (
    `⚠️ *AVERTISSEMENT* ⚠️\n\n` +
    `👤 Utilisateur : @${target.split('@')[0]}\n` +
    `📝 Raison : ${reason || 'Non précisée'}\n` +
    `📊 Avertissements : *${count}/${max}*\n\n` +
    (count >= max ? `🚫 Limite atteinte → expulsion automatique.` : `⚡ Prochaine infraction = sanction plus sévère.`)
  )
}

/**
 * Formate le statut du bot
 */
function botStatusMsg(uptime, groups, users, commands) {
  return [
    `*╭─「 📊 NOVA-MD STATUS 」*`,
    `*│* ⚡ Version : *${config.version}*`,
    `*│* ⏱️ Uptime : *${uptime}*`,
    `*│* 👥 Groupes : *${groups}*`,
    `*│* 👤 Utilisateurs : *${users}*`,
    `*│* 🤖 Commandes : *${commands}*`,
    `*│* 🔧 Prefix : *${config.prefix}*`,
    `*│* 🌐 Mode : *${config.selfMode ? 'Self' : 'Public'}*`,
    `*╰────────────────*`
  ].join('\n')
}

/**
 * Formate un profil utilisateur
 */
function profileMsg(user, pushName) {
  const vipStatus = user.vip ? `⭐ VIP` : `👤 Standard`
  const warnCount = user.warns || 0

  return [
    `*╭─「 👤 PROFIL 」*`,
    `*│* 📛 Nom : *${pushName}*`,
    `*│* 📱 Numéro : *${user.number}*`,
    `*│* 🏅 Statut : *${vipStatus}*`,
    `*│* ⚠️ Avertissements : *${warnCount}*`,
    `*│* 📅 Inscrit le : *${formatDate(user.createdAt)}*`,
    `*╰────────────────*`
  ].join('\n')
}

/**
 * Formate la date
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Inconnu'
  return new Date(timestamp).toLocaleDateString('fr-FR')
}

/**
 * Formate les infos d'un groupe
 */
function groupInfoMsg(meta, settings) {
  return [
    `*╭─「 👥 ${meta.subject} 」*`,
    `*│* 👤 Membres : *${meta.participants.length}*`,
    `*│* 📝 Description : ${meta.desc ? meta.desc.slice(0, 60) + '...' : 'Aucune'}`,
    `*│* 🔗 AntiLink : *${settings.antilink ? '✅' : '❌'}*`,
    `*│* 🤐 AntiSpam : *${settings.antispam ? '✅' : '❌'}*`,
    `*│* 🔞 AntiNSFW : *${settings.antinsfw ? '✅' : '❌'}*`,
    `*│* 🧹 AntiToxic : *${settings.antitoxic ? '✅' : '❌'}*`,
    `*│* 🔒 Mode Admin : *${settings.adminMode ? '✅' : '❌'}*`,
    `*╰────────────────*`
  ].join('\n')
}

/**
 * Message d'erreur standard
 */
function errorMsg(message) {
  return `❌ *Erreur :* ${message}`
}

/**
 * Message de succès standard
 */
function successMsg(message) {
  return `✅ ${message}`
}

/**
 * Message d'usage incorrect
 */
function usageMsg(usage) {
  return `⚠️ *Usage incorrect*\n💡 Utilise : \`${require('../config').prefix}${usage}\``
}

module.exports = {
  box,
  separator,
  helpCmd,
  menuCategory,
  welcomeMsg,
  goodbyeMsg,
  warnMsg,
  botStatusMsg,
  profileMsg,
  groupInfoMsg,
  errorMsg,
  successMsg,
  usageMsg,
  formatDate
}
