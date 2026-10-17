# Games 63 — v2.3.0 cPanel release

Latest production package for **https://games.63.lv/**. This is an update to the 16-game v2.2.0 release. It runs on standard cPanel PHP hosting (no Node.js build required on the server), using bundled React for the interface and standalone Canvas games. This release still uses the existing local React 16 runtime; it does **not** upgrade to React 19/Vite.

## Install / upgrade (recommended)

1. In cPanel > File Manager, open the **document root for games.63.lv**; do not assume it is the account's main public_html directory.
2. In File Manager Settings, enable **Show Hidden Files** and back up the current `.htaccess` and site files.
3. Extract **games63-v2.3.0-changed-files.zip** directly over the existing v2.2.0 installation, preserving folder paths (`assets/`, `games/`). If installing a fresh site, extract **games63-cpanel-v2.3.0-full.zip** instead.
4. Use cPanel permissions **0644** for files and **0755** for directories. Never apply `0777`.
5. Open https://games.63.lv/, then use the new header **⟳** button to clear the Games 63 PWA cache and reload. This clears offline game files but deliberately does not erase saved favourites or high scores.
6. For a test, open Wolf & Eggs on a phone: a portrait orientation prompt appears; rotate to landscape or use the manual portrait override. Close **×** to return to the catalog.

## v2.3.0 changes

- Separate breathing room for the coloured **63** in the header and footer logos.
- Hero headings now wrap correctly at narrow desktop and phone widths.
- Mobile game modal contains the gameplay, controls and prominent close button; landscape games wait at a rotation prompt rather than running behind it.
- Mobile game modal survives the device rotating from portrait to landscape. It also supports playing in portrait when rotation is locked.
- Improved Formula Sprint with visible levels 1–12 and smarter traffic that occasionally changes lanes; added progress gauge to existing Wolf & Eggs levels.
- Accessible cache-reset button and fixed an undefined PWA cache constant that could block resource loads. Safe cache policies for updated PHP/JS/CSS and offline fallback.
- English (UK) default website language, canonical/Open Graph metadata, CollectionPage JSON-LD game list, improved initial loading and lazy-loaded cover art.
- All 16 games, translations, DigitalPulse promo, records and favourites are preserved.

## Limitations

- CSS/UI and selected game difficulty mechanics are upgraded. The other 14 game engines retain their existing v2.2.0 rule sets and AI levels; this is **not** a rewrite of all games.
- Phone orientation cannot be locked reliably from a standard webpage on every browser. The app therefore shows a rotation hint and optional portrait mode instead of promising OS-level orientation control.
- All game descriptions are localised fully in English, Latvian and Russian; additional European language packs cover the portal interface and use English fallback for some in-game text.
- Browser automation tests run on a script-injected local page because the test environment blocks local URL navigation. Test the installed ZIP on real devices after deployment; we have not deployed it to the live domain.

---

# Games 63 v2.2.0

A local-first, original **12-game browser portal** for `https://games.63.lv/`.

## Install / update via cPanel

1. Back up your existing games.63.lv files. The ZIP includes the **whole application**, not just a patch.
2. In cPanel > File Manager, open the **document root** for `games.63.lv`.
3. Upload the ZIP and **extract its contents into that root**, so `index.php` is directly in the root (not inside a nested folder).
4. Keep SSL/HTTPS enabled. Use PHP 7.4+ or PHP 8.x. No MySQL, external API, Node.js, Composer or build command required on the server.
5. Open `https://games.63.lv/`, do a hard refresh. If an old installed PWA remains cached, close all tabs and reload to activate the updated service worker.

## Architecture and rendering

- PHP: one lightweight application entry point, no server-side data handling.
- **React-based SPA shell**: the included, self-hosted UMD React runtime drives the catalogue, translations, preferences and navigation. The app does not depend on a CDN and can run offline after caching.
- This portable offline build bundles **React 16** as a local compatibility runtime because React 19 and Vite dependencies were not available to install in the build environment. It is **not** a React 19/Vite build. The UI architecture is isolated to allow migration to React 19/Vite.
- Games: ES modules loaded on demand; canvas games use `requestAnimationFrame`, capped device pixel ratio (2x), and no per-frame React re-render.
- Persistent data: localStorage only; theme, language, favourites and personal best score on each browser/device.
- Web app manifest, local icons and versioned service worker for offline use after first successful install.
- 12 independent original illustrated SVG covers with no external asset or trademark dependency.

## Games

1. Wolf & Eggs — four accurate basket positions, original vector LCD-style graphics, A/B modes and 12 increasing speed levels.
2. Formula Sprint — traffic avoidance with increasing speed and on-screen controls.
3. Block Stack — tetromino line-clearing game.
4. Venice Boats — canal navigation.
5. Moto Rider — motorbike avoidance.
6. Mini Snooker (Latvian: Biljards (snūkers)) — simplified ball physics.
7. Darts 301 — three accuracy difficulties, moving aim, missed darts, bust logic and double-out finish.
8. Farm City — plant, wait, harvest and grow.
9. Durak Cards — card duel vs computer.
10. Chess — stable non-jumping 64-square DOM grid, legal moves, castling, en passant and computer opponent (simplified depth-two evaluation).
11. Domino — double-six draw dominoes vs computer, stocks and cumulative scoring.
12. Zole — Latvian 26-card game, 14 permanent trumps, talon, big/Zole/table modes and computer opponents (simplified bidding/scoring).

## Languages

**UK English by default**, plus Latvian, Russian, all 24 official EU languages, Norwegian, Icelandic and Ukrainian in the language selector (28 total). The **main portal UI and catalogue/common controls** are localised in all listed languages using local translation tables; card-game-specific commands are fully provided in English, Latvian and Russian with English fallback elsewhere. Individual older minigame text has English/Latvian translations and may fall back to English in other languages. Do not describe this version as full in-game translation for all languages.

## Notes

- Intended as browser mini-games, **not** commercial Android game clones. Gameplay, artwork, controls and character designs are original interpretations.
- Single-player versus local computer AI only; no online multiplayer, cross-device sync or server leaderboards.
- Sound is **off by default** for new visitors and can be enabled using the 🔇 / 🔊 header button; clicks and major events in all 16 games use Web Audio after a user gesture. Mobile sound depends on user interaction and browser policies.
- The first visit requires network access; subsequent visits can run from installed offline cache if allowed by the browser.
- The entire app uses a normal small cPanel folder structure similar to Radio 63, not WordPress.
- The DigitalPulse.click section appears above the footer on all pages.

## Security

- No accounts, payments or sensitive server-side data.
- No network calls to third-party CDNs or analytics and no third-party script inclusion.
- Preferences stored in localStorage; XSS risk is limited by static local strings and controlled DOM rendering.
- CSP not enforced in this baseline because canvas gameplay and React compat need some inline style, but PHP returns basic security headers. Enable a restrictive CSP only after browser testing.

## v2.0.1: HTTP 500 hotfix for cPanel

This release fixes a malformed Apache section in the v2.0.0 `.htaccess`.
The old config included an invalid single-line `<IfModule>` directive
inside `<FilesMatch>`, which may cause Apache/LiteSpeed HTTP 500 before
PHP or the JavaScript application can run.

### Upgrade existing v2.0.0 (fastest fix)

1. In cPanel File Manager open the document root for `games.63.lv` and enable
   **Show Hidden Files (dotfiles)** in Settings.
2. Rename `.htaccess` to `.htaccess.bak` (or download a backup).
3. Extract **games63-500-hotfix-htaccess-only.zip** into the document root.
   Overwrite the existing `.htaccess` if asked.
4. Reload the site (Ctrl+Shift+R). No game save data needs resetting.
5. If the server still returns HTTP 500, temporarily rename the new
   `.htaccess` to `.htaccess.test` to isolate Apache configuration, and open
   **cPanel > Metrics > Errors** or the domain's `error_log`. Other causes
   could include an inherited parent `.htaccess` or PHP configuration.

### Full install

The complete `games63-cpanel-v2.0.1.zip` contains all 16 games and the fixed
server config. Back up the site, extract files directly to the subdomain
root, then reload. Neither installation changes local game scores.

## v2.1.0 — visual and gameplay improvements

- Chess: persistent 64 cell DOM nodes and strictly fixed 8×8 sizing stop board jitter/row jumping.
- Wolf: rebuilt vector LCD stage, basket visibly aligned to the four lane catches, A/B and progressive level increases every 12 catches, four misses allowed.
- Darts: drifting aim, difficulty selector, misses, darts per visit, bust rule and double-out (25+25 bull is also valid).
- Domino: upgraded premium felt table, ivory tiles, computer hand backs, clear matching ends and hand highlights.
- Snooker translated into Latvian as **Biljards (snūkers)** (the game remains snooker-style).
- Global sound switch works for legacy Wolf / Domino / Zole as well as modern games; default muted for new visitors. Preferences stay in the original storage key.
- Separate accessible *How to play* modal in every game, includes game-specific three-step instructions and keyboard/touch control hints. English, Latvian and Russian instructions; modal controls translated for other supported locales.
- New Games 63 gamepad branding as SVG + 180/192/512px PNG icons.
- Offline cache key / asset versions updated; `.htaccess` retains the cPanel HTTP 500 fix.

**The app continues to ship a self-contained React compatibility runtime (React 16), not React 19/Vite.** No Node.js installation is required on cPanel. Further migration can be done independently of these gameplay corrections.


## v2.2.0 — installation and gameplay

**Site:** https://games.63.lv/

Upload the complete ZIP to the actual `games.63.lv` document root in cPanel and extract it, replacing the previous game files. For v2.1.1 users, the changed-files ZIP is smaller. Make a backup first. cPanel permissions must remain **0644 for files** (including `.htaccess`) and **0755 for folders**. No Node.js, Composer, database or build process is needed on the server.

This release has 16 original/offline-friendly browser mini-games:
- Wolf & Eggs (four lanes, eggs visibly caught, 12 speed levels)
- Formula Sprint, Block Stack, Venice Boats, Moto Rider
- 8-Ball Pool (two human players on the same device; blue solids vs orange stripes, black 8)
- Darts 301 (aim selection, moving aim, three darts, double-out)
- Farm City, Durak, Chess, Domino, Zole
- Novuss Club (simplified rules vs computer; not a regulation sport simulator)
- Star Hopper (original, non-Nintendo platform game with three stages)
- City Tycoon (simplified property trading / rent game against the computer)
- Cirks (Snakes & Ladders; reach square 100 with an exact roll)

**Controls:** Touch/mouse supported for every game. Open the Help button in each game for instructions in English, Latvian or Russian. On mobile the Install button displays only `Install` / `Instalēt` / `Установить` as appropriate. Sounds are muted by default, with the toggle in the header. The PWA service worker caches game files after installation.

**Scope/limitations:** 8-ball pool uses two local players taking turns, not a network multiplayer server. Novuss and City Tycoon are playable simplified adaptations and do not implement every official competition rule. The platform game has original art, physics and characters; no Nintendo assets. UI translations: the original 28 language choices remain, with complete new game guides for EN/LV/RU; other game guides fall back to English. React remains the existing locally bundled v16 runtime; canvas animation runs separately. Browser-level interaction should be tested on the target mobile and desktop devices after upload.
