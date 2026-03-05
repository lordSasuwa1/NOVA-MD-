/**
 * NOVA-MD — middleware/antinsfw.js
 * Détecte et supprime les médias NSFW dans les groupes
 * Utilise une vérification basique par mots-clés dans les légendes
 * (une API de détection d'images peut être branchée ici)
 */

const NSFW_KEYWORDS = [
  'nude', 'naked', 'porn', 'sex', 'xxx', 'hentai', 'nsfw',
  'boobs', 'ass', 'dick', 'pussy', 'cock', 'tits', 'nudes',
  'onlyfans', 'leaked', 'r18', 'adult', '18+'
]

const NSFW_REGEX = new RegExp(NSFW_KEYWORDS.join('|'), 'gi')

async function check(ctx, db) {
  const { sock, from, sender, body, msgType, msg, isSenderAdmin, isOwner, isBotAdmin } = ctx

  if (isSenderAdmin || isOwner) return
  if (!isBotAdmin) return

  let flagged = false

  // Vérification par légende/texte
  if (body && NSFW_REGEX.test(body)) flagged = true

  // Vérification par type de média (sticker animé souvent NSFW)
  // Une API comme NsfwSpy ou Clarifai peut être branchée ici
  // if (msgType === 'imageMessage') { ... }

  if (!flagged) return

  try {
    await sock.sendMessage(from, { delete: msg.key })

    const warns = db.groups.addGroupWarn(sender, from)
    const settings = db.groups.getSettings(from)
    const maxWarn = settings.maxWarn || 3

    if (warns >= maxWarn) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
      await sock.sendMessage(from, {
        text: `🔞 @${sender.split('@')[0]} a été expulsé pour contenu *NSFW* répété.`,
        mentions: [sender]
      })
      db.groups.resetGroupWarns(sender, from)
    } else {
      await sock.sendMessage(from, {
        text: `🔞 @${sender.split('@')[0]}, le contenu adulte est *interdit* ici.\n⚠️ Avertissement *${warns}/${maxWarn}*`,
        mentions: [sender]
      })
    }
  } catch {}
}

module.exports = { check }
