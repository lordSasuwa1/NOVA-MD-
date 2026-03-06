/**
 * ╔══════════════════════════════════════════╗
 * ║           NOVA-MD base WhatsApp Bo       ║
 * ║        Développé par Sasuwa7             ║
 * ║     github.com/lordsasuwa1/NOVA-MD-      ║
 * ╚══════════════════════════════════════════╝
 */

const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
} = require('@whiskeysockets/baileys')

const { Boom }     = require('@hapi/boom')
const pino         = require('pino')
const path         = require('path')
const fs           = require('fs')

const config       = require('./config')
const db           = require('./database')
const { loadCommands } = require('./core/loader')
const { handleMessage } = require('./core/handler')
const scheduler    = require('./core/scheduler')
const { restoreSession, printSessionData } = require('./utils/sessionManager')

// ─── COULEURS CONSOLE ─────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  gray:   '\x1b[90m',
}

function log(emoji, label, msg, color = C.cyan) {
  const time = new Date().toLocaleTimeString('fr-FR')
  console.log(`${C.gray}[${time}]${C.reset} ${emoji} ${color}${C.bold}[${label}]${C.reset} ${msg}`)
}

function logStep(n, total, msg) {
  console.log(`${C.blue}  ┣━ (${n}/${total})${C.reset} ${msg}`)
}

function logDivider() {
  console.log(`${C.gray}  ┃${C.reset}`)
}

// ─── RESTAURATION SESSION (Render / hébergement éphémère) ────────────────────
log('📦', 'SESSION', 'Vérification SESSION_DATA...', C.yellow)
const restored = restoreSession()
if (restored) {
  log('✅', 'SESSION', 'Fichiers de session restaurés depuis SESSION_DATA', C.green)
} else {
  log('⚠️', 'SESSION', 'Aucune SESSION_DATA — pairing code sera requis', C.yellow)
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

async function start() {
  console.log(`
${C.magenta}${C.bold}  ╔══════════════════════════════════════════╗
  ║           NOVA-MD  v${config.botVersion}                  ║
  ║        by Sasuwa7 | github.com/Sasuwa7   ║
  ╚══════════════════════════════════════════╝${C.reset}
  `)

  const STEPS = 4
  log('🚀', 'BOOT', 'Initialisation NOVA-MD...', C.magenta)
  logDivider()

  // ── Étape 1 : Base de données ───────────────────────────────────
  logStep(1, STEPS, 'Initialisation des bases de données SQLite...')
  try {
   await db.init()
    const userCount  = db.users.count()
    const groupCount = db.groups.count()
    log('✅', 'DB', `Bases prêtes — ${C.green}${userCount}${C.reset} users | ${C.green}${groupCount}${C.reset} groupes`, C.green)
  } catch (err) {
    log('❌', 'DB', `Erreur init DB : ${err.message}`, C.red)
    process.exit(1)
  }
  logDivider()

  // ── Étape 2 : Chargement des commandes ─────────────────────────
  logStep(2, STEPS, 'Chargement des commandes...')
  const commands = loadCommands()
  const byCategory = {}
  for (const cmd of commands.values()) {
    const cat = cmd.config.category || 'autre'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  }
  log('✅', 'LOADER', `${C.green}${commands.size}${C.reset} commandes chargées`, C.green)
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`${C.gray}         ┗ ${cat.padEnd(18)}${C.reset} ${C.yellow}${count}${C.reset} commandes`)
  }
  logDivider()

  // ── Étape 3 : Dossier de session ───────────────────────────────
  logStep(3, STEPS, `Préparation session "${config.sessionId}"...`)
  const sessionPath = path.join(__dirname, 'sessions', config.sessionId)
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true })
    log('📁', 'SESSION', `Dossier créé : sessions/${config.sessionId}`, C.cyan)
  } else {
    const sessionFiles = fs.readdirSync(sessionPath).length
    log('📁', 'SESSION', `Dossier existant — ${sessionFiles} fichier(s) trouvé(s)`, C.cyan)
  }
  logDivider()

  // ── Étape 4 : Connexion Baileys ────────────────────────────────
  logStep(4, STEPS, 'Connexion à WhatsApp via Baileys...')
  logDivider()

  await connectBot(commands, sessionPath)
}

// ─── CONNEXION ────────────────────────────────────────────────────────────────

async function connectBot(commands, sessionPath, retryCount = 0) {
  log('🔌', 'BAILEYS', 'Chargement des credentials...', C.cyan)
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  log('🌐', 'BAILEYS', 'Récupération de la dernière version WhatsApp Web...', C.cyan)
  const { version, isLatest } = await fetchLatestBaileysVersion()
  log('ℹ️', 'BAILEYS', `Version WA Web : ${C.green}${version.join('.')}${C.reset} ${isLatest ? '(dernière)' : C.yellow + '(ancienne)' + C.reset}`, C.cyan)

  const logger = pino({ level: 'silent' })

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    browser: ['NOVA-MD', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    getMessage: async () => ({ conversation: '' }),
  })

  // ─── PAIRING CODE ─────────────────────────────────────────────────────────
  if (!sock.authState.creds.registered) {
    await new Promise(resolve => setTimeout(resolve, 365))

    // ✅ Numéro importé depuis .env via config (OWNER_NUMBER)
    const ownerNumber = config.owner?.[0]?.replace(/[^0-9]/g, '')

    if (!ownerNumber) {
      log('❌', 'PAIRING', 'OWNER_NUMBER manquant dans .env — impossible de générer le code', C.red)
      process.exit(1)
    }

    log('📱', 'PAIRING', `Numéro owner : ${C.green}+${ownerNumber}${C.reset}`, C.yellow)
    log('⏳', 'PAIRING', 'Demande du code de couplage NOVA-MILK...', C.yellow)

    try {
      const code = await sock.requestPairingCode(ownerNumber)
      const formatted = code.match(/.{1,4}/g).join('-')
      console.log(`
${C.magenta}${C.bold}  ╔══════════════════════════════╗
  ║     🔑  CODE NOVA-MILK       ║
  ║                              ║
  ║       ${C.green}${formatted}${C.magenta}         ║
  ║                              ║
  ║  Entre ce code dans WA       ║
  ║  Appareils liés > Lier       ║
  ╚══════════════════════════════╝${C.reset}
      `)
    } catch (err) {
      log('❌', 'PAIRING', `Erreur génération code : ${err.message}`, C.red)
    }
  } else {
    log('✅', 'PAIRING', 'Session existante — pairing non requis', C.green)
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  sock.ev.on('creds.update', async () => {
    saveCreds()
    log('💾', 'CREDS', 'Credentials mis à jour et sauvegardés', C.gray)
  })

  // ── Connexion / déconnexion ────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

    if (connection === 'connecting') {
      log('🔄', 'CONNEXION', 'Connexion à WhatsApp en cours...', C.yellow)
    }

    if (connection === 'open') {
      const botName = sock.user?.name || 'NOVA-MD'
      const botJid  = sock.user?.id   || '?'
      console.log(`
${C.green}${C.bold}  ╔══════════════════════════════════════════╗
  ║  🟢  NOVA-MD CONNECTÉ !                  ║
  ╠══════════════════════════════════════════╣
  ║  🤖  Nom     : ${botName.padEnd(26)}║
  ║  📱  JID     : ${botJid.split(':')[0].padEnd(26)}║
  ║  ⚡  Préfixe : ${config.prefix.padEnd(26)}║
  ║  🌐  Mode    : ${(config.selfMode ? 'Self' : 'Public').padEnd(26)}║
  ║  🎮  Cmds    : ${String(commands.size).padEnd(26)}║
  ╚══════════════════════════════════════════╝${C.reset}
      `)

      // Sauvegarde session si hébergement éphémère
      if (process.env.SESSION_DATA !== undefined || process.env.RENDER) {
        log('📦', 'SESSION', 'Encodage session pour SESSION_DATA...', C.yellow)
        printSessionData()
      }

      // Démarrer le scheduler
      scheduler.init(sock, db)
      log('⏰', 'SCHEDULER', 'Tâches planifiées démarrées', C.cyan)
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode
        : 500

      const reason = DisconnectReason[statusCode] || `code ${statusCode}`
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        const delay = Math.min(5000 * (retryCount + 1), 30000)
        log('🔴', 'CONNEXION', `Déconnecté — Raison : ${reason}`, C.red)
        log('🔄', 'CONNEXION', `Tentative ${retryCount + 1} dans ${delay / 1000}s...`, C.yellow)
        setTimeout(() => connectBot(commands, sessionPath, retryCount + 1), delay)
      } else {
        log('❌', 'CONNEXION', 'Déconnexion définitive (logged out)', C.red)
        log('ℹ️', 'CONNEXION', `Supprime sessions/${config.sessionId}/ et relance`, C.gray)
        process.exit(1)
      }
    }
  })

  // ── Messages entrants ──────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      try {
        await handleMessage(sock, commands, db, msg)
      } catch (err) {
        log('❌', 'HANDLER', `Erreur message : ${err.message}`, C.red)
        db.settings?.logError({ command: 'handler', error: err.message, time: Date.now() })
      }
    }
  })

  // ── Membres groupe ─────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const groupSettings = db.groups.getSettings(id)
    log('👥', 'GROUP', `Action "${action}" — ${participants.length} membre(s) dans ${id.split('@')[0]}`, C.gray)

    if (action === 'add' && groupSettings.welcome) {
      try {
        const meta = await sock.groupMetadata(id)
        for (const jid of participants) {
          const welcomeText = groupSettings.welcomeMsg ||
            `✨ Bienvenue @${jid.split('@')[0]} dans *${meta.subject}* !\nTape ${config.prefix}rules pour voir les règles.`
          await sock.sendMessage(id, { text: welcomeText, mentions: [jid] })
          log('👋', 'WELCOME', `Message envoyé à @${jid.split('@')[0]}`, C.cyan)
        }
      } catch (err) {
        log('❌', 'WELCOME', `Erreur : ${err.message}`, C.red)
      }
    }

    if (action === 'remove' && groupSettings.goodbye) {
      try {
        const meta = await sock.groupMetadata(id)
        for (const jid of participants) {
          const goodbyeText = groupSettings.goodbyeMsg ||
            `👋 Au revoir @${jid.split('@')[0]} ! On espère te revoir dans *${meta.subject}*.`
          await sock.sendMessage(id, { text: goodbyeText, mentions: [jid] })
          log('👋', 'GOODBYE', `Message envoyé à @${jid.split('@')[0]}`, C.cyan)
        }
      } catch (err) {
        log('❌', 'GOODBYE', `Erreur : ${err.message}`, C.red)
      }
    }

    if (action === 'promote' && groupSettings.antipromote) {
      const mod = require('./middleware/antipromote')
      for (const jid of participants) {
        await mod.handle(sock, id, jid, db)
        log('🛡️', 'ANTIPROMOTE', `Promotion annulée pour @${jid.split('@')[0]}`, C.yellow)
      }
    }

    if (action === 'demote' && groupSettings.antidemote) {
      const mod = require('./middleware/antidemote')
      for (const jid of participants) {
        await mod.handle(sock, id, jid, db)
        log('🛡️', 'ANTIDEMOTE', `Démote annulé pour @${jid.split('@')[0]}`, C.yellow)
      }
    }
  })

  return sock
}

// ─── ERREURS GLOBALES ─────────────────────────────────────────────────────────

process.on('uncaughtException', err => {
  log('❌', 'FATAL', `Exception non gérée : ${err.message}`, C.red)
  console.error(err.stack)
  db.settings?.logError({ command: 'uncaughtException', error: err.message, time: Date.now() })
})

process.on('unhandledRejection', reason => {
  log('❌', 'FATAL', `Promesse rejetée : ${reason}`, C.red)
})

process.on('SIGINT', () => {
  log('⛔', 'SHUTDOWN', 'Arrêt manuel (SIGINT) — à bientôt !', C.yellow)
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('⛔', 'SHUTDOWN', 'Arrêt système (SIGTERM)', C.yellow)
  process.exit(0)
})

// ─── DÉMARRAGE ────────────────────────────────────────────────────────────────

start().catch(err => {
  log('❌', 'BOOT', `Erreur critique au démarrage : ${err.message}`, C.red)
  console.error(err.stack)
  process.exit(1)
})
