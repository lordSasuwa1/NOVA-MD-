const fs = require('fs')
const path = require('path')

// Map permission par dossier CMD
const PERMISSION_MAP = {
  'général': 0,
  'jeux': 0,
  'groupe': 2,
  'téléchargement': 0,
  'nsfw': 0,
  'vip': 3,
  'propriétaire': 4,
  'développeur': 4
}

/**
 * Charge tous les fichiers de commandes depuis CMD/
 * Retourne une Map { nomCommande => { execute, config } }
 */
function loadCommands() {
  const commands = new Map()
  const cmdDir = path.join(__dirname, '../CMD')

  if (!fs.existsSync(cmdDir)) {
    console.error('[LOADER] ❌ Dossier CMD/ introuvable')
    return commands
  }

  const categories = fs.readdirSync(cmdDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  let total = 0

  for (const category of categories) {
    const categoryPath = path.join(cmdDir, category)
    const defaultPermission = PERMISSION_MAP[category] ?? 0

    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.js'))

    for (const file of files) {
      const filePath = path.join(categoryPath, file)

      try {
        const cmd = require(filePath)

        // Validation structure du fichier commande
        if (!cmd.config || !cmd.execute) {
          console.warn(`[LOADER] ⚠️  ${category}/${file} — config ou execute manquant, ignoré`)
          continue
        }

        // Injection permission par défaut si non définie
        if (cmd.config.permission === undefined) {
          cmd.config.permission = defaultPermission
        }

        // Injection catégorie
        cmd.config.category = category

        // Enregistrement par nom de commande
        const name = cmd.config.name || path.basename(file, '.js')
        commands.set(name, cmd)

        // Alias éventuels
        if (Array.isArray(cmd.config.aliases)) {
          for (const alias of cmd.config.aliases) {
            commands.set(alias, cmd)
          }
        }

        total++
      } catch (err) {
        console.error(`[LOADER] ❌ Erreur chargement ${category}/${file}:`, err.message)
      }
    }

    console.log(`[LOADER] ✅ ${category} — ${files.length} commandes chargées`)
  }

  console.log(`[LOADER] 🚀 Total : ${total} commandes enregistrées`)
  return commands
}

/**
 * Recharge une seule commande (utilisé par !reload)
 */
function reloadCommand(commands, filePath) {
  try {
    delete require.cache[require.resolve(filePath)]
    const cmd = require(filePath)
    if (!cmd.config || !cmd.execute) return false

    const name = cmd.config.name
    commands.set(name, cmd)

    if (Array.isArray(cmd.config.aliases)) {
      for (const alias of cmd.config.aliases) {
        commands.set(alias, cmd)
      }
    }

    return true
  } catch (err) {
    console.error(`[LOADER] ❌ Reload échoué pour ${filePath}:`, err.message)
    return false
  }
}

/**
 * Recharge toutes les commandes (utilisé par !reload-all)
 */
function reloadAll(commands) {
  commands.clear()
  const fresh = loadCommands()
  for (const [key, val] of fresh) {
    commands.set(key, val)
  }
  return commands.size
}

module.exports = { loadCommands, reloadCommand, reloadAll }
