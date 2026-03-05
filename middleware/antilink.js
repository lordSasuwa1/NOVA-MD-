/**
 * NOVA-MD — middleware/antilink.js
 * Supprime les liens non autorisés dans les groupes
 */

// Regex pour détecter les liens
const LINK_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+/gi

// Liens WhatsApp groupe (plus dangereux)
const WA_INVITE_REGEX = /chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi

async function check(ctx, db) {
  const { sock, from, sender, body, msg, isSenderAdmin, isOwner, isBotAdmin } = ctx

  if (isSenderAdmin || isOwner) return
  if (!isBotAdmin) return
  if (!body) return

  const hasLink     = LINK_REGEX.test(body)
  const hasWaInvite = WA_INVITE_REGEX.test(body)

  if (!hasLink && !hasWaInvite) return

  const settings = db.groups.getSettings(from)

  // Mode strict : supprimer tout lien
  // Mode normal : supprimer uniquement les invitations WhatsApp
  const shouldDelete = settings.antilinkStrict ? hasLink : hasWaInvite

  if (!shouldDelete) return

  try {
    // Supprimer le message
    await sock.sendMessage(from, { delete: msg.key })

    // Ajouter un avertissement
    const warns = db.groups.addGroupWarn(sender, from)
    const maxWarn = settings.maxWarn || 3

    if (warns >= maxWarn) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
      await sock.sendMessage(from, {
        text: `🚫 @${sender.split('@')[0]} a été expulsé pour envoi de liens répété.`,
        mentions: [sender]
      })
      db.groups.resetGroupWarns(sender, from)
    } else {
      await sock.sendMessage(from, {
        text: `🔗 @${sender.split('@')[0]}, les liens sont *interdits* ici.\n⚠️ Avertissement *${warns}/${maxWarn}*`,
        mentions: [sender]
      })
    }
  } catch {}
}

module.exports = { check }
