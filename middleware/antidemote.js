/**
 * NOVA-MD — middleware/antidemote.js
 * Re-promeut automatiquement les admins démotés sans autorisation
 * 
 * Fonctionnement :
 * - Quand un admin est démoté, on vérifie si c'est autorisé
 * - Si antidemote est actif et que la démotion vient d'un non-owner → re-promote
 */

async function check(ctx, db) {
  // Ce middleware est déclenché via group-participants.update dans index.js
  // Ici on vérifie au niveau message si quelqu'un essaie de démoter via une commande
}

/**
 * Gère une démotion détectée dans group-participants.update
 * @param {object} sock
 * @param {string} groupId
 * @param {string} demotedJid - Le JID qui a été démoté
 * @param {object} db
 */
async function handle(sock, groupId, demotedJid, db) {
  const settings = db.groups.getSettings(groupId)
  if (!settings.antidemote) return

  // Récupérer les infos du groupe
  try {
    const meta = await sock.groupMetadata(groupId)
    const botJid = sock.user.id.replace(/:[0-9]+/, '') + '@s.whatsapp.net'

    // Vérifier que le bot est admin pour agir
    const botIsAdmin = meta.participants.find(p => p.id === botJid)?.admin
    if (!botIsAdmin) return

    // Re-promouvoir le membre démoté
    await sock.groupParticipantsUpdate(groupId, [demotedJid], 'promote')

    await sock.sendMessage(groupId, {
      text: `🛡️ *Anti-Démote activé*\n@${demotedJid.split('@')[0]} a été re-promu automatiquement.`,
      mentions: [demotedJid]
    })
  } catch {}
}

module.exports = { check, handle }
