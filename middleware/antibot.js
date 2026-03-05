/**
 * NOVA-MD — middleware/antibot.js
 * Détecte et expulse les bots WhatsApp indésirables
 */

// JIDs connus de bots à expulser automatiquement
const KNOWN_BOT_PATTERNS = [
  /@lid$/,         // Comptes LID suspects
  /bot/i,          // JID contenant "bot"
  /^0+@/,          // Numéros invalides
]

/**
 * Vérifie si un JID ressemble à un bot connu
 */
function looksLikeBot(jid) {
  return KNOWN_BOT_PATTERNS.some(p => p.test(jid))
}

/**
 * Vérifie sur chaque message si l'expéditeur est un bot
 */
async function check(ctx, db) {
  const { sock, from, sender, isSenderAdmin, isOwner, isBotAdmin } = ctx

  if (isSenderAdmin || isOwner) return
  if (!isBotAdmin) return

  if (!looksLikeBot(sender)) return

  try {
    await sock.groupParticipantsUpdate(from, [sender], 'remove')
    await sock.sendMessage(from, {
      text: `🤖 Un bot (@${sender.split('@')[0]}) a été détecté et expulsé automatiquement.`,
      mentions: [sender]
    })
  } catch {}
}

/**
 * Vérifie les nouveaux membres qui rejoignent
 * Appelable depuis l'event group-participants.update
 */
async function checkOnJoin(sock, groupId, jid) {
  if (!looksLikeBot(jid)) return

  try {
    await sock.groupParticipantsUpdate(groupId, [jid], 'remove')
    await sock.sendMessage(groupId, {
      text: `🤖 Un bot a tenté de rejoindre le groupe et a été expulsé.`
    })
  } catch {}
}

module.exports = { check, checkOnJoin }
