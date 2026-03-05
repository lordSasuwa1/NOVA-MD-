const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'météo', aliases: ['meteo','weather'], description: 'Météo d'une ville', usage: 'météo <ville>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une ville. Ex: *!météo Paris*' })
    if (!config.weatherApiKey) return ctx.reply({ text: '❌ Clé API météo non configurée (WEATHER_API_KEY dans .env)' })
    await ctx.react('🌤️')
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&appid=${config.weatherApiKey}&units=metric&lang=fr`, { timeout: 10000 })
      const d = res.data
      await ctx.reply({ text: [`🌍 *Météo — ${d.name}, ${d.sys.country}*`, ``, `🌡️ Température : *${Math.round(d.main.temp)}°C* (ressenti ${Math.round(d.main.feels_like)}°C)`, `💧 Humidité : *${d.main.humidity}%*`, `💨 Vent : *${Math.round(d.wind.speed * 3.6)} km/h*`, `🌤️ Ciel : *${d.weather[0].description}*`].join('\n') })
    } catch {
      await ctx.reply({ text: `❌ Ville introuvable : *${text}*.` })
    }
  }
}