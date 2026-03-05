/**
 * NOVA-MD — utils/helpers.js
 * Fonctions utilitaires partagées dans tout le bot
 */

/**
 * Pause asynchrone
 * @param {number} ms - Millisecondes
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retourne un élément aléatoire d'un tableau
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Mélange un tableau (Fisher-Yates)
 */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Formate un numéro WhatsApp en JID
 * Ex: "22900000000" → "22900000000@s.whatsapp.net"
 */
function toJid(number) {
  const clean = number.replace(/[^0-9]/g, '')
  return clean.includes('@') ? clean : `${clean}@s.whatsapp.net`
}

/**
 * Extrait le numéro depuis un JID
 * Ex: "22900000000@s.whatsapp.net" → "22900000000"
 */
function fromJid(jid) {
  return jid?.split('@')[0].split(':')[0] || ''
}

/**
 * Formatte une durée en millisecondes en texte lisible
 * Ex: 90061000 → "1j 1h 1m 1s"
 */
function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)

  const parts = []
  if (d) parts.push(`${d}j`)
  if (h % 24) parts.push(`${h % 24}h`)
  if (m % 60) parts.push(`${m % 60}m`)
  if (s % 60) parts.push(`${s % 60}s`)

  return parts.join(' ') || '0s'
}

/**
 * Formate un timestamp en date lisible
 */
function formatDate(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/**
 * Tronque un texte à une longueur max
 */
function truncate(str, max = 100) {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

/**
 * Capitalise la première lettre
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Vérifie si une chaîne est une URL valide
 */
function isUrl(str) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * Vérifie si un JID est un groupe
 */
function isGroup(jid) {
  return jid?.endsWith('@g.us')
}

/**
 * Extrait les mentions d'un contexte
 * Retourne les JIDs mentionnés ou le JID du message cité
 */
function getMentions(ctx) {
  const mentions = []

  if (ctx.mentionedJid?.length) {
    mentions.push(...ctx.mentionedJid)
  }

  if (ctx.quotedSender) {
    if (!mentions.includes(ctx.quotedSender)) {
      mentions.push(ctx.quotedSender)
    }
  }

  return mentions
}

/**
 * Retourne le premier membre mentionné ou cité
 */
function getTarget(ctx) {
  if (ctx.mentionedJid?.length) return ctx.mentionedJid[0]
  if (ctx.quotedSender) return ctx.quotedSender
  if (ctx.args?.[0]) return toJid(ctx.args[0])
  return null
}

/**
 * Convertit du texte en Morse
 */
const MORSE_CODE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
  'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
  'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  ' ':'/'
}

function toMorse(text) {
  return text.toUpperCase().split('').map(c => MORSE_CODE[c] || '?').join(' ')
}

/**
 * Convertit du texte en binaire
 */
function toBinary(text) {
  return text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
}

/**
 * Inverse un texte
 */
function reverseText(text) {
  return text.split('').reverse().join('')
}

/**
 * Convertit en majuscules
 */
function toUpperCase(text) {
  return text.toUpperCase()
}

/**
 * Convertit en minuscules
 */
function toLowerCase(text) {
  return text.toLowerCase()
}

/**
 * Génère un ID unique simple
 */
function generateId(prefix = 'nova') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Sécurise une valeur pour éviter les injections SQL basiques
 */
function sanitize(str) {
  if (typeof str !== 'string') return str
  return str.replace(/['"\\;]/g, '')
}

/**
 * Retourne la taille d'un fichier Buffer en format lisible
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

module.exports = {
  sleep,
  random,
  shuffle,
  toJid,
  fromJid,
  formatDuration,
  formatDate,
  truncate,
  capitalize,
  isUrl,
  isGroup,
  getMentions,
  getTarget,
  toMorse,
  toBinary,
  reverseText,
  toUpperCase,
  toLowerCase,
  generateId,
  sanitize,
  formatSize
}
