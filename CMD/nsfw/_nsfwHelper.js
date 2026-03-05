/**
 * NOVA-MD — CMD/nsfw/_nsfwHelper.js
 * Helper partagé pour toutes les commandes NSFW
 * Sources : waifu.pics, nekos.best, hmtai.natanox.com
 */

const axios = require('axios')

// ─── SOURCES PAR CATÉGORIE ────────────────────────────────────────────────────

const SOURCES = {
  // waifu.pics
  hentai:       { api: 'waifupics', cat: 'hentai' },
  'hentai-gif': { api: 'waifupics', cat: 'hentai' },
  nekohentai:   { api: 'waifupics', cat: 'neko' },
  yuri:         { api: 'waifupics', cat: 'yuri' },
  yaoi:         { api: 'waifupics', cat: 'yaoi' },
  ecchi:        { api: 'waifupics', cat: 'ecchi' },
  'waifu-nsfw': { api: 'waifupics', cat: 'waifu' },
  oppai:        { api: 'waifupics', cat: 'oppai' },
  trap:         { api: 'waifupics', cat: 'trap' },
  feet:         { api: 'hmtai',     cat: 'feet' },
  uniform:      { api: 'hmtai',     cat: 'uniform' },
  'maid-nsfw':  { api: 'hmtai',     cat: 'maid' },
  tentacle:     { api: 'hmtai',     cat: 'tentacle' },
  bdsm:         { api: 'hmtai',     cat: 'bdsm' },
  ahegao:       { api: 'hmtai',     cat: 'ahegao' },
  cum:          { api: 'hmtai',     cat: 'cum' },
  anal:         { api: 'hmtai',     cat: 'anal' },
  oral:         { api: 'hmtai',     cat: 'oral' },
  gangbang:     { api: 'hmtai',     cat: 'gangbang' },
  paizuri:      { api: 'hmtai',     cat: 'paizuri' },
  handjob:      { api: 'hmtai',     cat: 'handjob' },
  blowjob:      { api: 'hmtai',     cat: 'blowjob' },
  creampie:     { api: 'hmtai',     cat: 'creampie' },
  femdom:       { api: 'hmtai',     cat: 'femdom' },
  domination:   { api: 'hmtai',     cat: 'domination' },
  spanking:     { api: 'hmtai',     cat: 'spanking' },
  bondage:      { api: 'hmtai',     cat: 'bondage' },
  'swimsuit-nsfw':  { api: 'hmtai', cat: 'swimsuit' },
  'nurse-nsfw':     { api: 'hmtai', cat: 'nurse' },
  'teacher-nsfw':   { api: 'hmtai', cat: 'teacher' },
  'elf-nsfw':       { api: 'hmtai', cat: 'elf' },
  'demon-nsfw':     { api: 'hmtai', cat: 'devil' },
  'angel-nsfw':     { api: 'hmtai', cat: 'angel' },
  kemonomimi:       { api: 'hmtai', cat: 'kemonomimi' },
  'dragon-nsfw':    { api: 'hmtai', cat: 'dragon' },
  'monster-girl':   { api: 'hmtai', cat: 'monster_girl' },
  futanari:         { api: 'hmtai', cat: 'futanari' },
  giantess:         { api: 'hmtai', cat: 'giantess' },
  vore:             { api: 'hmtai', cat: 'vore' },
  ryona:            { api: 'hmtai', cat: 'ryona' },
  'latex-nsfw':     { api: 'hmtai', cat: 'latex' },
  lingerie:         { api: 'hmtai', cat: 'lingerie' },
  nude:             { api: 'waifupics', cat: 'hentai' },
  'solo-nsfw':      { api: 'hmtai', cat: 'solo' },
  'public-nsfw':    { api: 'hmtai', cat: 'public_use' },
  'random-nsfw':    { api: 'random', cat: '' },
}

const RANDOM_CATS = ['hentai', 'yuri', 'yaoi', 'ecchi', 'oppai', 'trap', 'blowjob', 'ahegao', 'femdom']

// ─── FETCHERS ─────────────────────────────────────────────────────────────────

async function fetchWaifuPics(cat) {
  const res = await axios.get(`https://api.waifu.pics/nsfw/${cat}`, { timeout: 10000 })
  return res.data.url
}

async function fetchHmtai(cat) {
  const res = await axios.get(`https://hmtai.hatsunia.cfd/nsfw/${cat}`, { timeout: 10000 })
  return res.data.url
}

async function fetchRandom() {
  const cat = RANDOM_CATS[Math.floor(Math.random() * RANDOM_CATS.length)]
  return fetchWaifuPics(cat)
}

// ─── FONCTION PRINCIPALE ──────────────────────────────────────────────────────

/**
 * Récupère une image NSFW selon la catégorie de la commande
 * @param {string} cmdName - Nom de la commande (ex: 'hentai', 'bdsm')
 * @returns {Promise<string>} URL de l'image
 */
async function fetchNsfw(cmdName) {
  const source = SOURCES[cmdName]
  if (!source) throw new Error(`Catégorie NSFW inconnue : ${cmdName}`)

  switch (source.api) {
    case 'waifupics': return fetchWaifuPics(source.cat)
    case 'hmtai':     return fetchHmtai(source.cat)
    case 'random':    return fetchRandom()
    default:          return fetchWaifuPics(source.cat)
  }
}

/**
 * Vérifie si le NSFW est autorisé dans ce contexte
 */
function isNsfwAllowed(ctx, db) {
  const { from, isGroup } = ctx
  if (!isGroup) return true // En privé, toujours autorisé
  const settings = db.groups.getSettings(from)
  return !!settings.nsfw
}

/**
 * Exécute une commande NSFW générique
 */
async function executeNsfw(ctx, db, cmdName, label) {
  const { sock, from, msg } = ctx

  if (!isNsfwAllowed(ctx, db)) {
    return ctx.reply({
      text: `🔞 Le contenu NSFW est *désactivé* dans ce groupe.\nUn admin peut l'activer avec *!nsfw on*`
    })
  }

  await ctx.react('🔞')

  try {
    const url = await fetchNsfw(cmdName)
    const res = await require('axios').get(url, { responseType: 'arraybuffer', timeout: 15000 })
    const buffer = Buffer.from(res.data)

    const isGif = url.endsWith('.gif') || cmdName.includes('gif')

    if (isGif) {
      await sock.sendMessage(from, { video: buffer, gifPlayback: true, caption: `🔞 *${label}*` }, { quoted: msg })
    } else {
      await sock.sendMessage(from, { image: buffer, caption: `🔞 *${label}*` }, { quoted: msg })
    }

    // Stats
    db.settings.incrementStat(`nsfw_${cmdName}`)
    db.settings.incrementStat('nsfw_total')

  } catch (err) {
    await ctx.react('❌')
    await ctx.reply({ text: `❌ Impossible de récupérer le contenu. Réessaie !` })
  }
}

module.exports = { fetchNsfw, isNsfwAllowed, executeNsfw }
