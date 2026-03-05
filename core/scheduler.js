const cron = require('node-cron')
const config = require('../config')

let db = null
let sock = null

/**
 * Initialise le scheduler avec les instances db et sock
 */
function init(socketInstance, dbInstance) {
  sock = socketInstance
  db = dbInstance
  registerJobs()
  console.log('[SCHEDULER] ✅ Tâches planifiées démarrées')
}

/**
 * Enregistre toutes les tâches cron
 */
function registerJobs() {

  // ─── Toutes les minutes ──────────────────────────────────────────────
  cron.schedule('* * * * *', async () => {
    await checkVipExpiry()
    await checkBombeChrono()
    await checkLoterie()
  })

  // ─── Toutes les 5 minutes ────────────────────────────────────────────
  cron.schedule('*/5 * * * *', async () => {
    await cleanTempSessions()
  })

  // ─── Toutes les heures ───────────────────────────────────────────────
  cron.schedule('0 * * * *', async () => {
    await resetAntiSpamCounters()
  })

  // ─── Tous les jours à minuit ─────────────────────────────────────────
  cron.schedule('0 0 * * *', async () => {
    await resetDailyStats()
    await sendDailyReminders()
    await rotateRules()
  })

  // ─── Tous les lundis à 00h01 ─────────────────────────────────────────
  cron.schedule('1 0 * * 1', async () => {
    await resetWeeklyScores()
  })

}

// ─── TÂCHES ──────────────────────────────────────────────────────────────────

/**
 * Vérifie et expire les abonnements VIP
 */
async function checkVipExpiry() {
  try {
    const vipUsers = db.users.getAllVip()
    const now = Date.now()

    for (const user of vipUsers) {
      if (user.vipExpire && now > user.vipExpire) {
        db.users.setVip(user.jid, false)
        console.log(`[SCHEDULER] VIP expiré pour ${user.jid}`)

        // Notifier l'utilisateur
        try {
          await sock.sendMessage(user.jid, {
            text: `⭐ Ton abonnement *VIP NOVA-MD* a expiré.\nContacte ${config.ownerName} pour renouveler.`
          })
        } catch {}
      }
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ checkVipExpiry:', err.message)
  }
}

/**
 * Vérifie les bombes chrono actives et les fait exploser
 */
async function checkBombeChrono() {
  try {
    const bombes = db.games.getActiveBombes()
    const now = Date.now()

    for (const bombe of bombes) {
      if (now >= bombe.expiresAt) {
        db.games.deleteBombe(bombe.groupId)

        try {
          await sock.sendMessage(bombe.groupId, {
            text: `💥 *BOOM !* La bombe a explosé !\n@${bombe.currentHolder.split('@')[0]} n'a pas passé à temps !`,
            mentions: [bombe.currentHolder]
          })
        } catch {}
      }
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ checkBombeChrono:', err.message)
  }
}

/**
 * Vérifie les tirages de loterie programmés
 */
async function checkLoterie() {
  try {
    const loteries = db.games.getActiveLoteries()
    const now = Date.now()

    for (const loterie of loteries) {
      if (now >= loterie.drawAt) {
        const participants = loterie.participants
        if (participants.length === 0) {
          db.games.deleteLoterie(loterie.groupId)
          continue
        }

        const winner = participants[Math.floor(Math.random() * participants.length)]
        db.games.deleteLoterie(loterie.groupId)
        db.games.addScore(winner, 'loterie', loterie.prize || 100)

        try {
          await sock.sendMessage(loterie.groupId, {
            text: `🎰 *TIRAGE DE LA LOTERIE !*\n\n🏆 Gagnant : @${winner.split('@')[0]}\n💰 Gain : ${loterie.prize || 100} points`,
            mentions: [winner]
          })
        } catch {}
      }
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ checkLoterie:', err.message)
  }
}

/**
 * Nettoie les sessions de jeux expirées (pendu, morpion, etc.)
 */
async function cleanTempSessions() {
  try {
    const expiredGames = db.games.getExpiredSessions(10 * 60 * 1000) // 10 min
    for (const game of expiredGames) {
      db.games.deleteSession(game.groupId, game.type)
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ cleanTempSessions:', err.message)
  }
}

/**
 * Remet à zéro les compteurs anti-spam
 */
async function resetAntiSpamCounters() {
  try {
    db.groups.resetSpamCounters()
  } catch (err) {
    console.error('[SCHEDULER] ❌ resetAntiSpamCounters:', err.message)
  }
}

/**
 * Reset les stats journalières du bot
 */
async function resetDailyStats() {
  try {
    db.settings.resetDailyStats()
    console.log('[SCHEDULER] 📊 Stats journalières réinitialisées')
  } catch (err) {
    console.error('[SCHEDULER] ❌ resetDailyStats:', err.message)
  }
}

/**
 * Envoie des rappels quotidiens (ex: VIP qui expire bientôt)
 */
async function sendDailyReminders() {
  try {
    const soon = db.users.getVipExpiringSoon(24 * 60 * 60 * 1000) // 24h
    for (const user of soon) {
      try {
        await sock.sendMessage(user.jid, {
          text: `⚠️ Ton abonnement *VIP NOVA-MD* expire dans *moins de 24h*.\nContacte ${config.ownerName} pour renouveler.`
        })
      } catch {}
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ sendDailyReminders:', err.message)
  }
}

/**
 * Rotation des règles de groupe (reset les avertissements hebdos si activé)
 */
async function rotateRules() {
  try {
    const groups = db.groups.getAll()
    for (const group of groups) {
      if (group.settings?.autoResetWarns) {
        db.users.resetWarnsForGroup(group.id)
      }
    }
  } catch (err) {
    console.error('[SCHEDULER] ❌ rotateRules:', err.message)
  }
}

/**
 * Reset des scores hebdomadaires
 */
async function resetWeeklyScores() {
  try {
    db.games.resetWeeklyScores()
    console.log('[SCHEDULER] 🏆 Scores hebdomadaires réinitialisés')
  } catch (err) {
    console.error('[SCHEDULER] ❌ resetWeeklyScores:', err.message)
  }
}

module.exports = { init }
