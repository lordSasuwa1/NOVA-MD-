/**
 * NOVA-MD — middleware/antipromote.js
 * Dénomme automatiquement les membres promus sans autorisation
 *
 * Fonctionnement :
 * - Quand un membre est promu, on vérifie si c'est autorisé
 * - Si antipromote est actif → démoter immédiatement
 */

async function check(ctx, db) {
  // Déclenché via group-participants.update dans index.js
}

/**
 * Gère une promotion détectée dans group-participants.update
 * @param {object} sock
 * @param {string} groupId
 * @param {string} promotedJid - Le JID qui a été promu
 * @param {object} db
 */
async function handle(sock, groupId, promotedJid, db) {
  const settings = db.groups.getSettings(groupId)
  if (!settings.antipromote) return

  try {
    const meta = await sock.groupMetadata(groupId)
    const botJid = sock.user.id.replace(/:[0-9]+/, '') + '@s.whatsapp.net'

    const botIsAdmin = meta.participants.find(p => p.id === botJid)?.admin
    if (!botIsAdmin) return

    // Démoter le membre promu non autorisé
    await sock.groupParticipantsUpdate(groupId, [promotedJid], 'demote')

    await sock.sendMessage(groupId, {
      text: `🛡️ *Anti-Promote activé*\n@${promotedJid.split('@')[0]} a été démis de ses fonctions automatiquement.`,
      mentions: [promotedJid]
    })
  } catch {}
}

module.exports = { check, handle }
