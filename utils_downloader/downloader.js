/**
 * NOVA-MD — utils/downloader.js
 * Téléchargements médias : YouTube, TikTok, Instagram, Facebook, Twitter, Spotify, SoundCloud, Pinterest
 *
 * Stratégie : API tierce rapide en premier → fallback yt-dlp si échec
 * Dépendances système : yt-dlp (obligatoire), spotdl (optionnel pour Spotify)
 */

'use strict'

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
 * Essai 1 : API tikwm.com (sans watermark, HD)
 * Essai 2 : yt-dlp fallback
 */
async function tiktok(url) {
  // Essai 1 : API tierce sans watermark
  try {
    const res = await axios.get(
      `https://api.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      { timeout: 15000 }
    )
    const data = res.data?.data
    if (!data?.play) throw new Error('pas de lien')
    const videoUrl = data.hdplay || data.play
    const buf = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 })
    const outPath = tempPath(`tt_${generateId()}.mp4`)
    fs.writeFileSync(outPath, Buffer.from(buf.data))
    return outPath
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp
  const outPath = tempPath(`tt_${generateId()}.mp4`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    '--no-watermark',
    `-f "best[ext=mp4]/best"`,
    `--merge-output-format mp4`,
    `--no-warnings`,
    `-o "${outPath}"`,
  ].join(' '))
  if (!fs.existsSync(outPath)) throw new Error('TikTok: fichier non généré')
  return outPath
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────

/**
 * Télécharge un post Instagram (image ou vidéo)
 * Essai 1 : API saveig.app
 * Essai 2 : yt-dlp fallback
 */
async function instagram(url) {
  // Essai 1 : API tierce
  try {
    const res = await axios.post(
      'https://saveig.app/api/ajaxSearch',
      new URLSearchParams({ q: url, t: 'media', lang: 'fr' }),
      { timeout: 15000, headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' } }
    )
    const links = res.data?.data
    if (!links?.length) throw new Error('pas de liens')
    const best = links.find(l => l.type === 'mp4') || links[0]
    const mediaUrl = best.url || best.thumbnail
    const isVideo = best.type === 'mp4'
    const buf = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000 })
    const outPath = tempPath(`ig_${generateId()}.${isVideo ? 'mp4' : 'jpg'}`)
    fs.writeFileSync(outPath, Buffer.from(buf.data))
    return outPath
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp
  const outPath = tempPath(`ig_${generateId()}.mp4`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    `--no-warnings`,
    `-o "${outPath}"`,
  ].join(' '))
  if (!fs.existsSync(outPath)) throw new Error('Instagram: fichier non généré')
  return outPath
}

// ─── FACEBOOK ────────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo Facebook
 * Essai 1 : API fdown.net
 * Essai 2 : yt-dlp fallback
 */
async function facebook(url) {
  // Essai 1 : API tierce
  try {
    const res = await axios.get(
      `https://fdown.net/download.php?URLz=${encodeURIComponent(url)}`,
      { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const match = res.data.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/)
    if (!match) throw new Error('lien introuvable')
    const buf = await axios.get(match[1], { responseType: 'arraybuffer', timeout: 60000 })
    const outPath = tempPath(`fb_${generateId()}.mp4`)
    fs.writeFileSync(outPath, Buffer.from(buf.data))
    return outPath
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp
  const outPath = tempPath(`fb_${generateId()}.mp4`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    `-f "best[ext=mp4]/best"`,
    `--no-warnings`,
    `-o "${outPath}"`,
  ].join(' '))
  if (!fs.existsSync(outPath)) throw new Error('Facebook: fichier non généré')
  return outPath
}

// ─── TWITTER / X ─────────────────────────────────────────────────────────────

/**
 * Télécharge une vidéo Twitter/X
 * Essai 1 : API twitsave.com (scraping léger)
 * Essai 2 : yt-dlp fallback
 */
async function twitter(url) {
  // Essai 1 : scraping twitsave
  try {
    const res = await axios.get(
      `https://twitsave.com/info?url=${encodeURIComponent(url)}`,
      { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const match = res.data.match(/https:\/\/video\.twimg\.com\/[^"'\s]+\.mp4[^"'\s]*/g)
    if (!match?.length) throw new Error('lien introuvable')
    const buf = await axios.get(match[0], { responseType: 'arraybuffer', timeout: 60000 })
    const outPath = tempPath(`tw_${generateId()}.mp4`)
    fs.writeFileSync(outPath, Buffer.from(buf.data))
    return outPath
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp
  const outPath = tempPath(`tw_${generateId()}.mp4`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    `-f "best[ext=mp4]/best"`,
    `--no-warnings`,
    `-o "${outPath}"`,
  ].join(' '))
  if (!fs.existsSync(outPath)) throw new Error('Twitter: fichier non généré')
  return outPath
}

// ─── SPOTIFY ─────────────────────────────────────────────────────────────────

/**
 * Télécharge une piste Spotify
 * Essai 1 : spotdl (si installé)
 * Essai 2 : yt-dlp sur la recherche YouTube du titre
 */
async function spotify(url) {
  const outDir = path.join(__dirname, '../temp')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Essai 1 : spotdl
  try {
    await runCmd(`spotdl download "${url}" --output "${outDir}" --format mp3`)
    const files = fs.readdirSync(outDir)
      .filter(f => f.endsWith('.mp3'))
      .map(f => ({ f, t: fs.statSync(path.join(outDir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)
    if (files.length) return path.join(outDir, files[0].f)
    throw new Error('spotdl: aucun fichier généré')
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp direct sur l'URL Spotify (via youtube-search)
  const outPath = tempPath(`spot_${generateId()}.mp3`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    '-x --audio-format mp3 --audio-quality 0',
    `--no-warnings`,
    `-o "${outPath.replace('.mp3', '')}.%(ext)s"`,
  ].join(' '))
  const final = fs.existsSync(outPath) ? outPath : `${outPath.replace('.mp3', '')}.mp3`
  if (!fs.existsSync(final)) throw new Error('Spotify: fichier non généré')
  return final
}

// ─── SOUNDCLOUD ──────────────────────────────────────────────────────────────

/**
 * Télécharge une piste SoundCloud via yt-dlp
 */
async function soundcloud(url) {
  const outPath = tempPath(`sc_${generateId()}.mp3`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    '-x --audio-format mp3 --audio-quality 0',
    `--no-warnings`,
    `-o "${outPath.replace('.mp3', '')}.%(ext)s"`,
  ].join(' '))
  const final = fs.existsSync(outPath) ? outPath : `${outPath.replace('.mp3', '')}.mp3`
  if (!fs.existsSync(final)) throw new Error('SoundCloud: fichier non généré')
  return final
}

// ─── PINTEREST ───────────────────────────────────────────────────────────────

/**
 * Télécharge une image ou vidéo Pinterest
 * Essai 1 : scraping HTML (pinimg.com URLs)
 * Essai 2 : yt-dlp fallback
 */
async function pinterest(url) {
  // Essai 1 : scraping HTML
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
    })
    const html = res.data

    // Cherche vidéo en premier
    const videoMatch = html.match(/"url":"(https:\\u002F\\u002Fv\.pinimg\.com[^"]+\.mp4[^"]*)"/)
      || html.match(/"url":"(https:\/\/v\.pinimg\.com[^"]+\.mp4[^"]*)"/)
    if (videoMatch) {
      const clean = videoMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '')
      const buf = await axios.get(clean, { responseType: 'arraybuffer', timeout: 60000 })
      const outPath = tempPath(`pin_${generateId()}.mp4`)
      fs.writeFileSync(outPath, Buffer.from(buf.data))
      return outPath
    }

    // Cherche image HD
    const imgMatch = html.match(/"url":"(https:(?:\\u002F\\u002F|\/\/)i\.pinimg\.com[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/)
    if (imgMatch) {
      const clean = imgMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '')
      const ext = clean.split('.').pop().split('?')[0] || 'jpg'
      const buf = await axios.get(clean, { responseType: 'arraybuffer', timeout: 30000 })
      const outPath = tempPath(`pin_${generateId()}.${ext}`)
      fs.writeFileSync(outPath, Buffer.from(buf.data))
      return outPath
    }
    throw new Error('Pinterest: aucun média dans le HTML')
  } catch { /* fallback */ }

  // Essai 2 : yt-dlp
  const outBase = tempPath(`pin_${generateId()}`)
  await runCmd([
    'yt-dlp', `"${url}"`,
    `--no-warnings`,
    `-o "${outBase}.%(ext)s"`,
  ].join(' '))
  const dir = path.dirname(outBase)
  const base = path.basename(outBase)
  const files = fs.readdirSync(dir).filter(f => f.startsWith(base))
  if (!files.length) throw new Error('Pinterest: fichier non généré')
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
