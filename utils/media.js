/**
 * NOVA-MD — utils/media.js
 * Envoi et traitement des médias WhatsApp
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { Readable } = require('stream')

// ─── ENVOI MÉDIAS ─────────────────────────────────────────────────────────────

/**
 * Envoie une image
 * @param {object} sock
 * @param {string} jid
 * @param {string|Buffer} source - URL, chemin fichier ou Buffer
 * @param {object} options - { caption, quoted, mentions }
 */
async function sendImage(sock, jid, source, options = {}) {
  const image = await toBuffer(source)
  return sock.sendMessage(jid, {
    image,
    caption: options.caption || '',
    mentions: options.mentions || [],
  }, options.quoted ? { quoted: options.quoted } : {})
}

/**
 * Envoie une vidéo
 */
async function sendVideo(sock, jid, source, options = {}) {
  const video = await toBuffer(source)
  return sock.sendMessage(jid, {
    video,
    caption: options.caption || '',
    gifPlayback: options.gif || false,
    mentions: options.mentions || [],
  }, options.quoted ? { quoted: options.quoted } : {})
}

/**
 * Envoie un audio
 */
async function sendAudio(sock, jid, source, options = {}) {
  const audio = await toBuffer(source)
  return sock.sendMessage(jid, {
    audio,
    mimetype: options.mimetype || 'audio/mp4',
    ptt: options.ptt || false,
  }, options.quoted ? { quoted: options.quoted } : {})
}

/**
 * Envoie un document/fichier
 */
async function sendDocument(sock, jid, source, options = {}) {
  const document = await toBuffer(source)
  return sock.sendMessage(jid, {
    document,
    mimetype: options.mimetype || 'application/octet-stream',
    fileName: options.fileName || 'fichier',
    caption: options.caption || '',
  }, options.quoted ? { quoted: options.quoted } : {})
}

/**
 * Envoie un sticker
 */
async function sendSticker(sock, jid, source, options = {}) {
  const sticker = await toBuffer(source)
  return sock.sendMessage(jid, {
    sticker,
  }, options.quoted ? { quoted: options.quoted } : {})
}

/**
 * Envoie un GIF (vidéo en lecture automatique)
 */
async function sendGif(sock, jid, source, options = {}) {
  return sendVideo(sock, jid, source, { ...options, gif: true })
}

/**
 * Envoie un message vocal (PTT)
 */
async function sendVoice(sock, jid, source, options = {}) {
  return sendAudio(sock, jid, source, { ...options, ptt: true, mimetype: 'audio/ogg; codecs=opus' })
}

// ─── HELPERS BUFFER ──────────────────────────────────────────────────────────

/**
 * Convertit une source (URL, chemin, Buffer) en Buffer
 */
async function toBuffer(source) {
  if (Buffer.isBuffer(source)) return source
  if (typeof source === 'string') {
    if (isUrl(source)) {
      const res = await axios.get(source, { responseType: 'arraybuffer', timeout: 20000 })
      return Buffer.from(res.data)
    }
    if (fs.existsSync(source)) {
      return fs.readFileSync(source)
    }
  }
  throw new Error('Source invalide : URL, chemin ou Buffer attendu')
}

/**
 * Vérifie si une chaîne est une URL
 */
function isUrl(str) {
  try { new URL(str); return true } catch { return false }
}

/**
 * Télécharge un fichier depuis une URL et le sauvegarde
 */
async function downloadFile(url, destPath) {
  const res = await axios.get(url, { responseType: 'stream', timeout: 30000 })
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath)
    res.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

/**
 * Obtient la miniature d'une vidéo YouTube (thumbnail)
 */
function getYtThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Détecte le type de média d'un message
 */
function getMediaType(msgType) {
  const types = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    stickerMessage: 'sticker',
  }
  return types[msgType] || null
}

/**
 * Vérifie si un message contient un média téléchargeable
 */
function hasMedia(msgType) {
  return ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(msgType)
}

/**
 * Retourne le chemin du dossier temp/
 */
function tempPath(filename) {
  const dir = path.join(__dirname, '../temp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, filename)
}

/**
 * Supprime un fichier temporaire
 */
function cleanTemp(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {}
}

module.exports = {
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
  sendGif,
  sendVoice,
  toBuffer,
  downloadFile,
  getYtThumbnail,
  getMediaType,
  hasMedia,
  tempPath,
  cleanTemp
}
