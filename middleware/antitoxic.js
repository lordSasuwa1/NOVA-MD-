/**
 * NOVA-MD — middleware/antitoxic.js
 * Filtre les mots toxiques / insultes dans les groupes
 */

// Liste de base — extensible via !filtremots
const DEFAULT_TOXIC = [
  'connard', 'connasse', 'salope', 'pute', 'enculé', 'fdp', 'pd',
  'batard', 'bâtard', 'ta mère', 'nique', 'niquer', 'merde',
  'idiot', 'imbécile', 'crétin', 'con', 'conne', 'abruti',
  'fils de pute', 'va te faire', 'ferme ta gueule', 'ta gueule'
]

/**
 * Construit la regex des mots filtrés pour un groupe
 * Combine la liste par défaut + les mots custom du groupe
 */
function buildRegex(settings) {
  const custom = settings.filtreMotsListe || []
  const all = [...DEFAULT_TOXIC, ...custom]
  if (!all.length) return null
  const escaped = all.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
}

async function check(ctx, db) {
  const { sock, from, sender, body, msg, isSenderAdmin, isOwner, isBotAdmin } = ctx

  if (isSenderAdmin || isOwner) return
  if (!isBotAdmin) return
  if (!body) return

  const settings = db.groups.getSettings(from)
  const regex = buildRegex(settings)
  if (!regex || !regex.test(body)) return

  try {
    await sock.sendMessage(from, { delete: msg.key })

    const warns = db.groups.addGroupWarn(sender, from)
    const maxWarn = settings.maxWarn || 3

    if (warns >= maxWarn) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
      await sock.sendMessage(from, {
        text: `🤬 @${sender.split('@')[0]} a été expulsé pour langage *toxique* répété.`,
        mentions: [sender]
      })
      db.groups.resetGroupWarns(sender, from)
    } else {
      await sock.sendMessage(from, {
        text: `🤬 @${sender.split('@')[0]}, surveille ton langage !\n⚠️ Avertissement *${warns}/${maxWarn}*`,
        mentions: [sender]
      })
    }
  } catch {}
}

module.exports = { check }
