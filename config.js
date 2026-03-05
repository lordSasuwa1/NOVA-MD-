/**
 * NOVA-MD — config.js
 * Configuration globale du bot
 */

require('dotenv').config()

module.exports = {

  // ─── IDENTITÉ ─────────────────────────────────────────────────────────────
  botName:    process.env.BOT_NAME    || 'NOVA-MD',
  botVersion: process.env.BOT_VERSION || '1.0.0',
  ownerName:  process.env.OWNER_NAME  || 'Owner',

  // ─── OWNER ────────────────────────────────────────────────────────────────
  // Liste des numéros owner (sans +, sans @s.whatsapp.net)
  owner: (process.env.OWNER_NUMBER || '').split(',').map(n => n.trim()).filter(Boolean),

  // Numéros développeurs (accès total comme owner)
  devs: (process.env.DEV_NUMBERS || '').split(',').map(n => n.trim()).filter(Boolean),

  // ─── BOT ──────────────────────────────────────────────────────────────────
  prefix:    process.env.PREFIX    || '!',
  selfMode:  process.env.SELF_MODE === 'true',
  language:  process.env.LANGUAGE  || 'fr',

  // ─── SESSION ──────────────────────────────────────────────────────────────
  sessionId: process.env.SESSION_ID || 'main',

  // ─── API KEYS ─────────────────────────────────────────────────────────────
  claudeApiKey:   process.env.CLAUDE_API_KEY   || '',
  openaiApiKey:   process.env.OPENAI_API_KEY   || '',
  weatherApiKey:  process.env.WEATHER_API_KEY  || '',
  giphyApiKey:    process.env.GIPHY_API_KEY    || '',
  spotifyClientId:     process.env.SPOTIFY_CLIENT_ID     || '',
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',

  // ─── LIMITES ──────────────────────────────────────────────────────────────
  maxWarn:       parseInt(process.env.MAX_WARN       || '3'),
  maxSpamMsg:    parseInt(process.env.MAX_SPAM_MSG   || '5'),
  spamWindow:    parseInt(process.env.SPAM_WINDOW    || '5000'),   // ms
  maxFileSize:   parseInt(process.env.MAX_FILE_SIZE  || '50'),     // MB
  cooldown:      parseInt(process.env.COOLDOWN       || '2000'),   // ms entre commandes

  // ─── NSFW ─────────────────────────────────────────────────────────────────
  nsfwEnabled:   process.env.NSFW_ENABLED === 'true',

  // ─── THÈME ────────────────────────────────────────────────────────────────
  theme: process.env.THEME || 'cybernetique',

  // ─── MESSAGES SYSTÈME ─────────────────────────────────────────────────────
  messages: {
    maintenance:  '🔧 *NOVA-MD* est en maintenance. Reviens plus tard !',
    groupOnly:    '👥 Cette commande est utilisable uniquement en groupe.',
    privateOnly:  '💬 Cette commande est utilisable uniquement en privé.',
    botNotAdmin:  '⚠️ Je dois être admin du groupe pour effectuer cette action.',
    cooldown:     '⏳ Attends un peu avant de réutiliser cette commande.',
    noTarget:     '👤 Mentionne ou cite un utilisateur.',
    noText:       '📝 Envoie un texte avec la commande.',
    noMedia:      '🖼️ Envoie ou cite une image/vidéo avec la commande.',
    noReply:      '↩️ Réponds à un message avec cette commande.',
  },

  // ─── LOGS ─────────────────────────────────────────────────────────────────
  logActivity: process.env.LOG_ACTIVITY !== 'false',
  logErrors:   process.env.LOG_ERRORS   !== 'false',
}
