# Games 63 v2.1.0

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
- Sound is **off by default** for new visitors and can be enabled using the 🔇 / 🔊 header button; clicks and major events in all 12 games use Web Audio after a user gesture. Mobile sound depends on user interaction and browser policies.
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

The complete `games63-cpanel-v2.0.1.zip` contains all 12 games and the fixed
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
