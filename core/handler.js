const { getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys')
const router = require('./router')
const config = require('../config')

/**
 * Parse un message Baileys entrant
 * Extrait toutes les infos utiles pour le router
 */
async function parseMessage(sock, msg) {
  try {
    const msgType = getContentType(msg.message)
    if (!msgType) return null

    // Infos de base
    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup
      ? msg.key.participant || msg.participant
      : msg.key.remoteJid
    const isOwner = config.owner.includes(sender.replace(/:[0-9]+/, '').split('@')[0])
    const pushName = msg.pushName || 'Utilisateur'

    // Extraction du contenu texte
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.documentMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      ''

    // Détection préfixe
    const prefix = config.prefix
    const isCmd = body.startsWith(prefix)
    const command = isCmd
      ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()
      : null
    const args = isCmd
      ? body.slice(prefix.length + command.length).trim().split(/\s+/).filter(Boolean)
      : []
    const text = isCmd
      ? body.slice(prefix.length + command.length).trim()
      : body

    // Message cité (reply)
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant || null

    // Mentions
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    // Infos groupe
    let groupMetadata = null
    let groupAdmins = []
    let isBotAdmin = false
    let isSenderAdmin = false

    if (isGroup) {
      try {
        groupMetadata = await sock.groupMetadata(from)
        groupAdmins = groupMetadata.participants
          .filter(p => p.admin)
          .map(p => p.id)
        const botJid = sock.user.id.replace(/:[0-9]+/, '') + '@s.whatsapp.net'
        isBotAdmin = groupAdmins.includes(botJid)
        isSenderAdmin = groupAdmins.includes(sender)
      } catch {
        // Groupe inaccessible
      }
    }

    return {
      sock,
      msg,
      from,
      sender,
      pushName,
      isGroup,
      isOwner,
      isCmd,
      command,
      args,
      text,
      body,
      msgType,
      quoted,
      quotedSender,
      mentionedJid,
      groupMetadata,
      groupAdmins,
      isBotAdmin,
      isSenderAdmin,
      prefix,

      // Helpers inline
      reply: (content) => sock.sendMessage(from, content, { quoted: msg }),
      react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
      download: () => downloadMediaMessage(msg, 'buffer', {}),
    }
  } catch (err) {
    console.error('[HANDLER] ❌ Erreur parseMessage:', err.message)
    return null
  }
}

/**
 * Handler principal appelé sur chaque message entrant
 */
async function handleMessage(sock, commands, db, msg) {
  // Ignorer ses propres messages (sauf selfMode)
  if (msg.key.fromMe && !config.selfMode) return

  // Ignorer les messages vides
  if (!msg.message) return

  // Ignorer les messages de status
  if (msg.key.remoteJid === 'status@broadcast') return

  const ctx = await parseMessage(sock, msg)
  if (!ctx) return

  // Passer au router
  await router.route(ctx, commands, db)
}

module.exports = { handleMessage, parseMessage }
