/**
 * ╔══════════════════════════════════════════╗
 * ║           NOVA-MD WhatsApp Bot           ║
 * ║        Développé par Sasuwa7             ║
 * ║     github.com/Sasuwa7/NOVA-MD           ║
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
const readline     = require('readline')

const config       = require('./config')
const db           = require('./database')
const { loadCommands } = require('./core/loader')
const { handleMessage } = require('./core/handler')
const scheduler    = require('./core/scheduler')

// ─── INIT ────────────────────────────────────────────────────────────────────

async function start() {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║           NOVA-MD  v${config.botVersion}              ║
  ║        Démarrage en cours...             ║
  ╚══════════════════════════════════════════╝
  `)

  // 1. Init bases de données
  db.init()

  // 2. Charger les commandes
  const commands = loadCommands()
  console.log(`[NOVA] ✅ ${commands.size} commandes chargées`)

  // 3. Préparer le dossier de session
  const sessionPath = path.join(__dirname, 'sessions', config.sessionId)
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  // 4. Démarrer le socket Baileys
  await connectBot(commands, sessionPath)
}

// ─── CONNEXION ───────────────────────────────────────────────────────────────

async function connectBot(commands, sessionPath, retryCount = 0) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

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

  // ─── PAIRING CODE (NOVA-MILK) ─────────────────────────────────────────────
  if (!sock.authState.creds.registered) {
    await new Promise(resolve => setTimeout(resolve, 2000))

    let phoneNumber = config.owner[0]
    if (!phoneNumber) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
      phoneNumber = await new Promise(resolve => {
        rl.question('\n📱 Entrez votre numéro (avec indicatif, sans +) : ', ans => {
          rl.close()
          resolve(ans.trim())
        })
      })
    }

    const code = await sock.requestPairingCode(phoneNumber)
    const formatted = code.match(/.{1,4}/g).join('-')
    console.log(`\n🔑 NOVA-MILK — Code de couplage : \x1b[32m${formatted}\x1b[0m\n`)
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  sock.ev.on('creds.update', saveCreds)

  // Connexion / déconnexion
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (connection === 'open') {
      console.log(`\n[NOVA] 🟢 Connecté en tant que ${sock.user?.name || sock.user?.id}`)
      console.log(`[NOVA] 🤖 Prefix : ${config.prefix} | Mode : ${config.selfMode ? 'Self' : 'Public'}`)

      // Démarrer le scheduler
      scheduler.init(sock, db)
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode
        : 500

      const shouldReconnect = code !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        const delay = Math.min(5000 * (retryCount + 1), 30000)
        console.log(`[NOVA] 🔴 Déconnecté (${code}). Reconnexion dans ${delay / 1000}s...`)
        setTimeout(() => connectBot(commands, sessionPath, retryCount + 1), delay)
      } else {
        console.log('[NOVA] ❌ Déconnecté définitivement. Supprime le dossier sessions/ et relance.')
        process.exit(1)
      }
    }
  })

  // Messages entrants
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      await handleMessage(sock, commands, db, msg)
    }
  })

  // Membres rejoignent / quittent un groupe
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const groupSettings = db.groups.getSettings(id)

    if (action === 'add' && groupSettings.welcome) {
      try {
        const meta = await sock.groupMetadata(id)
        for (const jid of participants) {
          const welcomeText = groupSettings.welcomeMsg ||
            `✨ Bienvenue @${jid.split('@')[0]} dans *${meta.subject}* !\nTape ${config.prefix}rules pour voir les règles.`
          await sock.sendMessage(id, {
            text: welcomeText,
            mentions: [jid]
          })
        }
      } catch {}
    }

    if (action === 'remove' && groupSettings.goodbye) {
      try {
        const meta = await sock.groupMetadata(id)
        for (const jid of participants) {
          const goodbyeText = groupSettings.goodbyeMsg ||
            `👋 Au revoir @${jid.split('@')[0]} ! On espère te revoir dans *${meta.subject}*.`
          await sock.sendMessage(id, {
            text: goodbyeText,
            mentions: [jid]
          })
        }
      } catch {}
    }

    // Anti-promote / anti-demote
    if (action === 'promote') {
      const settings = db.groups.getSettings(id)
      if (settings.antipromote) {
        const antipromoteMod = require('./middleware/antipromote')
        for (const jid of participants) {
          await antipromoteMod.handle(sock, id, jid, db)
        }
      }
    }

    if (action === 'demote') {
      const settings = db.groups.getSettings(id)
      if (settings.antidemote) {
        const antidemoteMod = require('./middleware/antidemote')
        for (const jid of participants) {
          await antidemoteMod.handle(sock, id, jid, db)
        }
      }
    }
  })

  return sock
}

// ─── GESTION ERREURS GLOBALES ─────────────────────────────────────────────────

process.on('uncaughtException', err => {
  console.error('[NOVA] ❌ Erreur non gérée:', err.message)
  db.settings?.logError({ command: 'uncaughtException', error: err.message, time: Date.now() })
})

process.on('unhandledRejection', (reason) => {
  console.error('[NOVA] ❌ Promesse rejetée:', reason)
  if (db.settings) {
    db.settings.logError({ 
      command: 'unhandledRejection', 
      error: String(reason), 
      time: Date.now() 
    })
  }
})

// ─── DÉMARRAGE ────────────────────────────────────────────────────────────────

start().catch(err => {
  console.error('[NOVA] ❌ Erreur au démarrage:', err)
  process.exit(1)
})
