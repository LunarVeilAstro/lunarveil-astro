// ═══════════════════════════════════════════════════════════════════════════
//  app.js — LunarVeilAstro thin orchestrator (formerly 7150 lines)
//
//  All logic has been split into js/*.js modules, loaded in dependency order.
//  This file exists for backward compatibility — cache busting, etc.
//
//  Load order (see index.html):
//    i18n.js         — UI chrome translations
//    js/astronomy.js — Planetary math, houses, aspects, utilities (shuffle, escHtml)
//    js/data.js      — All static interpretation data (planet signs, tarot deck, etc.)
//    js/reports.js   — Report generators (natal, forecast, synastry, etc.)
//    js/tarot.js     — Tarot interpretation engine + draw/flip UI
//    js/compass.js   — Fortune direction compass
//    js/fortune.js   — Daily fortune slips, RP, lucky items
//    js/lodge.js     — Lodge games (answer book, magic ball, zodiac match)
//    js/ui.js        — Error trap, formatting, geocoding, tabs, PDF/email export
//    app.js          — This file (loaded last)
//
//  For module details, see individual js/*.js files.
// ═══════════════════════════════════════════════════════════════════════════

// All functions are global — accessible from HTML onclick handlers.
// No code needed here. The inline scripts in index.html handle init.
