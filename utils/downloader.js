/**
 * NOVA-MD — utils/downloader.js
 * Téléchargements médias : YouTube, TikTok, Instagram, etc.
 */

const { exec } = require('child_process')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const { tempPath, cleanTemp } = require('./media')
const { generateId } = require('./helpers')

// ─── YT-DLP ──────────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo YouTube (mp4)
 * @param {string} url
 * @param {object} opts - { quality: '720', format: 'mp4' }
 * @returns {Promise<string>} chemin du fichier
 */
function ytVideo(url, opts = {}) {
  const quality = opts.quality || '720'
  const outPath = tempPath(`yt_${generateId()}.mp4`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    `-f "bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}]"`,
    '--merge-output-format mp4',
    `--output "${outPath}"`,
    '--no-playlist',
    '--socket-timeout 30',
  ].join(' ')

  return runCmd(cmd).then(() => outPath)
}

/**
 * Télécharge uniquement l'audio d'une vidéo YouTube (mp3)
 */
function ytAudio(url) {
  const outBase = tempPath(`yta_${generateId()}`)
  const outPath = outBase + '.mp3'

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    '-x --audio-format mp3 --audio-quality 0',
    `--output "${outBase}.%(ext)s"`,
    '--no-playlist',
  ].join(' ')

  return runCmd(cmd).then(() => outPath)
}

/**
 * Récupère les métadonnées d'une vidéo YouTube
 */
async function ytInfo(url) {
  const cmd = `yt-dlp "${url}" --dump-json --no-playlist`
  const output = await runCmd(cmd)
  try {
    return JSON.parse(output)
  } catch {
    throw new Error('Impossible de récupérer les infos de la vidéo')
  }
}

// ─── TIKTOK ──────────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo TikTok sans watermark
 */
async function tiktok(url) {
  const outPath = tempPath(`tt_${generateId()}.mp4`)

  // Utilise yt-dlp avec l'option no-watermark
  const cmd = [
    'yt-dlp',
    `"${url}"`,
    '--no-watermark',
    `-o "${outPath}"`,
  ].join(' ')

  await runCmd(cmd)
  return outPath
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────

/**
 * Télécharge un post Instagram (image ou vidéo)
 */
async function instagram(url) {
  const outPath = tempPath(`ig_${generateId()}.mp4`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    `-o "${outPath}"`,
  ].join(' ')

  await runCmd(cmd)
  return outPath
}

// ─── FACEBOOK ────────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo Facebook
 */
async function facebook(url) {
  const outPath = tempPath(`fb_${generateId()}.mp4`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    `-f "best[ext=mp4]"`,
    `-o "${outPath}"`,
  ].join(' ')

  await runCmd(cmd)
  return outPath
}

// ─── TWITTER / X ─────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo Twitter/X
 */
async function twitter(url) {
  const outPath = tempPath(`tw_${generateId()}.mp4`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    `-f "best[ext=mp4]/best"`,
    `-o "${outPath}"`,
  ].join(' ')

  await runCmd(cmd)
  return outPath
}

// ─── SPOTIFY ─────────────────────────────────────────────────────────────────

/**
 * Télécharge une piste Spotify via spotdl
 */
async function spotify(url) {
  const outDir = path.join(__dirname, '../temp')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const cmd = `spotdl "${url}" --output "${outDir}" --format mp3`
  await runCmd(cmd)

  // Trouver le fichier créé le plus récent
  const files = fs.readdirSync(outDir)
    .filter(f => f.endsWith('.mp3'))
    .map(f => ({ f, t: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)

  if (!files.length) throw new Error('Téléchargement Spotify échoué')
  return path.join(outDir, files[0].f)
}

// ─── SOUNDCLOUD ──────────────────────────────────────────────────────────────

/**
 * Télécharge une piste SoundCloud
 */
async function soundcloud(url) {
  const outPath = tempPath(`sc_${generateId()}.mp3`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    '-x --audio-format mp3',
    `-o "${outPath}"`,
  ].join(' ')

  await runCmd(cmd)
  return outPath
}

// ─── PINTEREST ───────────────────────────────────────────────────────────────

/**
 * Récupère l'image ou vidéo d'un pin Pinterest
 */
async function pinterest(url) {
  const outPath = tempPath(`pin_${generateId()}`)

  const cmd = [
    'yt-dlp',
    `"${url}"`,
    `-o "${outPath}.%(ext)s"`,
  ].join(' ')

  await runCmd(cmd)

  // Trouver le fichier généré
  const dir = path.dirname(outPath)
  const base = path.basename(outPath)
  const files = fs.readdirSync(dir).filter(f => f.startsWith(base))
  if (!files.length) throw new Error('Téléchargement Pinterest échoué')
  return path.join(dir, files[0])
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

/**
 * Exécute une commande shell et retourne la sortie
 */
function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message))
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * Télécharge un fichier depuis une URL directe (axios)
 */
async function directDownload(url, ext = 'bin') {
  const outPath = tempPath(`dl_${generateId()}.${ext}`)
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
  fs.writeFileSync(outPath, res.data)
  return outPath
}

module.exports = {
  ytVideo,
  ytAudio,
  ytInfo,
  tiktok,
  instagram,
  facebook,
  twitter,
  spotify,
  soundcloud,
  pinterest,
  directDownload,
  runCmd
}
