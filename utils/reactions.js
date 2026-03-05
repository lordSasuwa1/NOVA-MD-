/**
 * NOVA-MD — utils/reactions.js
 * Émojis de réaction selon le type d'action
 */

// ─── RÉACTIONS PAR ACTION ─────────────────────────────────────────────────────

const REACTIONS = {
  // Statuts
  loading:  ['⏳', '🔄', '⌛'],
  success:  ['✅', '🎉', '💯', '🔥'],
  error:    ['❌', '😓', '⚠️'],
  denied:   ['🚫', '🔒', '⛔'],

  // Commandes générales
  search:   ['🔍', '🕵️'],
  download: ['📥', '💾'],
  upload:   ['📤', '🚀'],
  wait:     ['⏳', '🕐'],
  done:     ['✅', '👍'],

  // Jeux
  win:      ['🏆', '🥇', '🎉', '🎊'],
  lose:     ['💀', '😵', '😭'],
  play:     ['🎮', '🕹️'],
  dice:     ['🎲'],
  cards:    ['🃏'],
  spin:     ['🎰'],

  // Modération
  warn:     ['⚠️'],
  kick:     ['👢'],
  ban:      ['🔨'],
  mute:     ['🔇'],
  promote:  ['⬆️'],
  demote:   ['⬇️'],
  delete:   ['🗑️'],
  lock:     ['🔒'],
  unlock:   ['🔓'],

  // IA
  think:    ['🤔', '💭', '🧠'],
  write:    ['✍️', '📝'],
  code:     ['💻', '👨‍💻'],
  translate:['🌐', '🗣️'],

  // VIP
  vip:      ['⭐', '👑', '💎'],

  // Owner
  owner:    ['🛠️', '⚙️'],

  // Médias
  image:    ['🖼️'],
  video:    ['🎬'],
  audio:    ['🎵'],
  sticker:  ['🎭'],
}

/**
 * Retourne un émoji de réaction aléatoire pour une action
 * @param {string} action - Clé dans REACTIONS
 * @returns {string}
 */
function react(action) {
  const list = REACTIONS[action]
  if (!list) return '👍'
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Envoie une réaction sur un message
 * @param {object} sock
 * @param {object} msg
 * @param {string} action
 */
async function sendReaction(sock, msg, action) {
  const emoji = react(action)
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emoji, key: msg.key }
    })
  } catch {}
  return emoji
}

/**
 * Réaction de chargement → puis succès ou erreur
 * Utile pour les commandes longues
 */
async function reactProgress(sock, msg, action) {
  await sendReaction(sock, msg, 'loading')

  return {
    success: () => sendReaction(sock, msg, 'success'),
    error:   () => sendReaction(sock, msg, 'error'),
    done:    () => sendReaction(sock, msg, action || 'done'),
  }
}

module.exports = {
  REACTIONS,
  react,
  sendReaction,
  reactProgress
}
