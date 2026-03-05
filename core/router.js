const config = require('../config')

// Middlewares
const antispam = require('../middleware/antispam')
const antilink = require('../middleware/antilink')
const antinsfw = require('../middleware/antinsfw')
const antitoxic = require('../middleware/antitoxic')
const antibot = require('../middleware/antibot')
const antidemote = require('../middleware/antidemote')
const antipromote = require('../middleware/antipromote')

/**
 * Niveaux de permission
 * 0 = public       → tout le monde
 * 1 = membre       → utilisateurs enregistrés
 * 2 = admin        → admins du groupe
 * 3 = vip          → utilisateurs premium
 * 4 = owner/dev    → propriétaire du bot
 */
async function checkPermission(ctx, cmdPermission, db) {
  const { sender, isOwner, isSenderAdmin, from, isGroup } = ctx

  // Owner bypass tout
  if (isOwner) return true

  // Niveau 4 → owner uniquement
  if (cmdPermission >= 4) return false

  // Niveau 3 → vip
  if (cmdPermission === 3) {
    const user = db.users.get(sender)
    if (!user?.vip && !user?.premium) return false
    // Vérifier expiration VIP
    if (user.vipExpire && Date.now() > user.vipExpire) {
      db.users.setVip(sender, false)
      return false
    }
    return true
  }

  // Niveau 2 → admin groupe
  if (cmdPermission === 2) {
    return isSenderAdmin || isOwner
  }

  // Niveau 1 → membre enregistré
  if (cmdPermission === 1) {
    return db.users.exists(sender)
  }

  // Niveau 0 → public
  return true
}

/**
 * Vérifie si l'utilisateur est blacklisté
 */
function isBlacklisted(sender, db) {
  return db.settings.isBlacklisted(sender)
}

/**
 * Vérifie si le bot est en maintenance
 */
function isMaintenance(isOwner, db) {
  return db.settings.get('maintenance') === true && !isOwner
}

/**
 * Router principal
 * Applique les middlewares puis exécute la commande
 */
async function route(ctx, commands, db) {
  const { sock, from, sender, isGroup, isOwner, isCmd, command, msg, msgType } = ctx

  try {
    // 1. Blacklist globale
    if (isBlacklisted(sender, db)) return

    // 2. Maintenance
    if (isMaintenance(isOwner, db)) {
      if (isCmd) ctx.reply({ text: config.messages.maintenance })
      return
    }

    // 3. Middlewares groupe (même sans commande)
    if (isGroup) {
      const groupSettings = db.groups.getSettings(from)

      if (groupSettings.antilink)   await antilink.check(ctx, db)
      if (groupSettings.antispam)   await antispam.check(ctx, db)
      if (groupSettings.antinsfw)   await antinsfw.check(ctx, db)
      if (groupSettings.antitoxic)  await antitoxic.check(ctx, db)
      if (groupSettings.antibot)    await antibot.check(ctx, db)
      if (groupSettings.antidemote) await antidemote.check(ctx, db)
      if (groupSettings.antipromote) await antipromote.check(ctx, db)

      // Mode admin uniquement
      if (groupSettings.adminMode && !ctx.isSenderAdmin && !isOwner) return

      // Mode public désactivé
      if (!groupSettings.publicMode) {
        const publicCmds = groupSettings.publicCmds || []
        if (isCmd && !ctx.isSenderAdmin && !isOwner && !publicCmds.includes(command)) return
      }
    }

    // 4. Si pas une commande → stop
    if (!isCmd || !command) return

    // 5. Trouver la commande
    const cmd = commands.get(command)
    if (!cmd) return

    // 6. Vérifier permission
    const allowed = await checkPermission(ctx, cmd.config.permission, db)
    if (!allowed) {
      const msg_perm = getPermissionMessage(cmd.config.permission, ctx)
      return ctx.react('🚫').then(() => ctx.reply({ text: msg_perm }))
    }

    // 7. Vérifier si commande groupe uniquement
    if (cmd.config.groupOnly && !isGroup) {
      return ctx.reply({ text: config.messages.groupOnly })
    }

    // 8. Vérifier si commande privé uniquement
    if (cmd.config.privateOnly && isGroup) {
      return ctx.reply({ text: config.messages.privateOnly })
    }

    // 9. Vérifier si admin groupe requis
    if (cmd.config.botAdmin && !ctx.isBotAdmin) {
      return ctx.reply({ text: config.messages.botNotAdmin })
    }

    // 10. React en cours d'exécution
    await ctx.react('⏳')

    // 11. Exécuter la commande
    await cmd.execute(ctx, db)

  } catch (err) {
    console.error(`[ROUTER] ❌ Erreur commande "${command}":`, err)
    try {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Erreur : ${err.message}` })
    } catch {}

    // Log dans DB
    db.settings.logError({ command, error: err.message, sender, from, time: Date.now() })
  }
}

/**
 * Message d'erreur de permission selon niveau
 */
function getPermissionMessage(level, ctx) {
  const messages = {
    1: '⚠️ Tu dois être enregistré pour utiliser cette commande.',
    2: '⚠️ Cette commande est réservée aux admins du groupe.',
    3: `⭐ Cette commande est réservée aux membres *VIP*.\nContacte ${config.ownerName} pour obtenir le VIP.`,
    4: '🔒 Cette commande est réservée au propriétaire du bot.',
  }
  return messages[level] || '🚫 Accès refusé.'
}

module.exports = { route, checkPermission }
