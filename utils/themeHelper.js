/**
 * NOVA-MD — utils/themeHelper.js
 * Helpers pour générer des messages avec le thème actif
 */

'use strict'

const path = require('path')

let _themes = null
function getThemes() {
  if (!_themes) _themes = require('../data/themes/themes.json')
  return _themes
}

/**
 * Retourne le thème actif
 * @param {object} db
 * @returns {object} thème
 */
function getActiveTheme(db) {
  const themes = getThemes()
  const key = db?.settings?.get('theme') || 'royal'
  return themes[key] || themes.royal
}

/**
 * Génère le menu principal avec le thème actif
 */
function buildMenu(db, config, commandsByCategory) {
  const t = getActiveTheme(db)

  const categoryLabels = {
    général:       { label: 'Général',       icon: t.icons.general },
    jeux:          { label: 'Jeux',           icon: t.icons.games },
    groupe:        { label: 'Groupe',         icon: t.icons.group },
    téléchargement:{ label: 'Téléchargement', icon: t.icons.download },
    vip:           { label: 'VIP ⭐',         icon: t.icons.vip },
    nsfw:          { label: 'NSFW 🔞',        icon: t.icons.nsfw },
    propriétaire:  { label: 'Propriétaire',   icon: t.icons.owner },
    développeur:   { label: 'Développeur',    icon: t.icons.dev },
  }

  const lines = []
  lines.push(t.menu.header(config.botName, config.ownerName))

  let total = 0
  for (const [cat, meta] of Object.entries(categoryLabels)) {
    const cmds = commandsByCategory[cat]
    if (!cmds?.length) continue
    lines.push(t.menu.section(meta.label, meta.icon))
    for (const cmd of cmds.slice(0, 8)) {
      lines.push(t.menu.cmd(config.prefix + cmd.name, cmd.description?.slice(0, 35) || ''))
      total++
    }
    if (cmds.length > 8) lines.push(`  ${t.icons.bullet} _...et ${cmds.length - 8} de plus_`)
  }

  lines.push(t.menu.footer(total, config.prefix))
  return lines.join('\n')
}

/**
 * Encadre un message avec le style du thème actif
 */
function box(db, title, lines) {
  const t = getActiveTheme(db)
  const content = lines.map(l => `${t.border.side} ${l}`).join('\n')
  return [
    t.border.top,
    `${t.border.side} ${t.icons.star} *${title}*`,
    t.separators?.section || '──────────────────────',
    content,
    t.border.bot
  ].join('\n')
}

module.exports = { getActiveTheme, buildMenu, box, getThemes }
