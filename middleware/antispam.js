/**
 * NOVA-MD — middleware/antispam.js
 * Détecte et sanctionne le spam / flood de messages
 */

const config = require('../config')

/**
 * Vérifie si un utilisateur spam dans un groupe
 * Appelé par le router sur chaque message entrant
 */
async function check(ctx, db) {
  const { sock, from, sender, msg, isSenderAdmin, isOwner } = ctx

  // Ignorer les admins et l'owner
  if (isSenderAdmin || isOwner) return

  const MAX    = config.maxSpamMsg  // nb messages max dans la fenêtre
  const WINDOW = config.spamWindow  // fenêtre de temps en ms

  const row = db.groups.getSpamCount(sender, from)
  const now = Date.now()

  // Réinitialiser si hors fenêtre
  if (now - row.lastMsg > WINDOW) {
    db.groups.incrementSpam(sender, from) // repart à 1
    return
  }

  db.groups.incrementSpam(sender, from)
  const current = db.groups.getSpamCount(sender, from).count

  if (current >= MAX) {
    try {
      // Supprimer le message
      await sock.sendMessage(from, { delete: msg.key })

      // Muter l'utilisateur
      await sock.groupParticipantsUpdate(from, [sender], 'remove')

      await sock.sendMessage(from, {
        text: `🚫 @${sender.split('@')[0]} a été expulsé pour *spam*.`,
        mentions: [sender]
      })

      // Reset compteur
      db.groups.resetSpamCounters()
    } catch {}
  } else if (current === MAX - 1) {
    // Avertissement avant expulsion
    try {
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split('@')[0]}, arrête de spammer ou tu seras expulsé !`,
        mentions: [sender]
      })
    } catch {}
  }
}

module.exports = { check }
