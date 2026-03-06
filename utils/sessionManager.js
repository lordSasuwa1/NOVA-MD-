/**
 * NOVA-MD — utils/sessionManager.js
 * Gestion de la session Baileys via variable d'environnement
 *
 * Fonctionnement :
 *   1er démarrage (pas de SESSION_DATA) → pairing code → session sauvée en base64 dans SESSION_DATA
 *   Démarrages suivants → SESSION_DATA décodée → fichiers session restaurés dans sessions/
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const zlib = require('zlib')

const SESSION_DIR = path.join(__dirname, '../sessions')

/**
 * Restaure les fichiers de session depuis SESSION_DATA (variable d'env)
 * Appelé AVANT makeWASocket()
 * @returns {boolean} true si session restaurée, false si premier démarrage
 */
function restoreSession() {
  const sessionData = process.env.SESSION_DATA
  if (!sessionData) {
    console.log('📋 Aucune SESSION_DATA trouvée — premier démarrage, pairing code requis.')
    return false
  }

  try {
    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })

    // Décode base64 → décompresse gzip → parse JSON
    const compressed = Buffer.from(sessionData, 'base64')
    const json = zlib.gunzipSync(compressed).toString('utf8')
    const files = JSON.parse(json)

    let count = 0
    for (const [filename, content] of Object.entries(files)) {
      const filePath = path.join(SESSION_DIR, filename)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content))
      count++
    }

    console.log(`✅ Session restaurée depuis SESSION_DATA (${count} fichiers)`)
    return true
  } catch (err) {
    console.error('❌ Erreur restauration session :', err.message)
    return false
  }
}

/**
 * Encode tous les fichiers de session en base64 compressé
 * Appelé APRÈS connexion réussie pour sauvegarder la SESSION_DATA
 * @returns {string} valeur à mettre dans SESSION_DATA
 */
function encodeSession() {
  if (!fs.existsSync(SESSION_DIR)) throw new Error('Dossier sessions/ introuvable')

  const files = {}

  function readDir(dir, base = '') {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry)
      const relPath  = base ? `${base}/${entry}` : entry
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        readDir(fullPath, relPath)
      } else {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          files[relPath] = content
        } catch {
          // fichier binaire → base64
          files[relPath] = fs.readFileSync(fullPath).toString('base64')
        }
      }
    }
  }

  readDir(SESSION_DIR)

  const json       = JSON.stringify(files)
  const compressed = zlib.gzipSync(Buffer.from(json, 'utf8'))
  const encoded    = compressed.toString('base64')

  console.log(`📦 Session encodée — ${Object.keys(files).length} fichiers, ${(encoded.length / 1024).toFixed(1)} KB`)
  return encoded
}

/**
 * Sauvegarde automatique en affichant la valeur SESSION_DATA dans les logs
 * (pour la copier dans Render > Environment)
 */
function printSessionData() {
  try {
    const encoded = encodeSession()
    console.log('\n' + '='.repeat(60))
    console.log('📋 COPIE CETTE VALEUR DANS RENDER > Environment > SESSION_DATA :')
    console.log('='.repeat(60))
    console.log(encoded)
    console.log('='.repeat(60) + '\n')
    return encoded
  } catch (err) {
    console.error('❌ Impossible d\'encoder la session :', err.message)
    return null
  }
}

module.exports = { restoreSession, encodeSession, printSessionData }
