## v2.4.1 — language flags and Wolf console polish (18 October 2026)

- Replaced the native language selector with a responsive, keyboard-friendly flag picker for all 28 existing UI languages. English (UK) remains the default on new devices.
- Flags are locally bundled PNG assets; they render consistently on Windows, Android and iOS, including offline mode. The flags are graphical assets, not font files.
- Updated service worker's precache and bumped cache/version references to ensure new assets reach users.
- Removed duplicate position numbers/arrows drawn in the bottom bezel of Wolf & Eggs; the functional controls below the console remain in place.
- Preserved existing game engines and score/favourites storage keys.

# Games 63 v2.4.0 - targeted layout and app links update

- Pool: moved the canvas label to a centred accessible heading above the table, aligned three score elements to the same table width, and prevented overlaps on narrow screens.
- Formula Sprint: portrait-first gameplay on phones; removed the unnecessary rotation requirement, and constrained canvas height inside the mobile game modal.
- Wolf & Eggs: lifted both lower rails and their basket/egg endpoints by 33-34 canvas units, keeping catches and drawing aligned on every viewport.
- Added related 63.lv apps panel: Radio, Translate, GO, Price, Book, Whiteboard, AI, and Language; Games 63 is intentionally omitted as the current site.
- PWA cache version and static asset query strings updated to v2.4.0.
- All other 16 game modules, stored favourites, preferences and scores remain unchanged.

## Install
Back up site files. Extract the changed-files ZIP into the games.63.lv document root, overwriting matching files while keeping the same paths. cPanel should use mode 0644 for files and 0755 for directories. Refresh the PWA/cache after the upload.

---

# Games 63 changelog

## 2.3.0 (2026-10-17)

- Polished the header/footer Games 63 logo wordmark spacing and hero title line wrapping.
- Added a phone-first game modal, close-to-catalog behaviour, portrait-to-landscape orientation assistance, portrait override and responsive game display.
- Formula Sprint now has twelve visible difficulty tiers, smoother opponent motion and limited rival lane-changing behaviour; Wolf & Eggs has a visual level-progress bar.
- Repaired the Service Worker cache name bug and switched offline navigation/code to network-first with cache fallback; added Games 63-only cache clean & reload button without clearing saved scores.
- More consistent cache headers for cPanel, safe .htaccess syntax and compatibility with the pre-existing 403 permission fix.
- Improved HTML/PWA metadata: English (UK) default, canonical/social descriptions and structured 16-game CollectionPage listing; local React/vendor files deferred and game images lazily loaded.
- Kept all 16 game modules and saved high scores/favourites.

## 2.2.0 (2026-10-17)

- Four original, offline-capable browser games: Novuss mini, Star Hopper (three-level platformer), City Tycoon and Cirks / Snakes & Ladders. Games total: 16.
- Replaced the old one-player mini-snooker stage with two-player local 8-ball pool: seven blue balls, seven orange striped balls, one black 8, cue ball; 15-ball rack, scratch and turn handling, pocket physics.
- Wolf & Eggs: aligned birds and lanes, and animated caught eggs actually dropping through the basket rim instead of moving across its surface; retained 12 progressively faster levels.
- Darts 301: clarified the two-step controls (tap target, then throw), distinct intended aim and drifting reticle, keeping miss, difficulty and double-out scoring.
- Mobile header: short Install button, smaller language picker and sound/theme icons, hidden miniature logo tagline on phones.
- Added four illustrated game covers and matching English, Latvian and Russian game descriptions and help. Existing EU / Scandinavian interface language pack retained; new game-specific text outside EN/LV/RU falls back to English.
- Updated PWA asset precache, manifest, versioned CSS/JS and local records handling.
- Preserved the working cPanel-compatible .htaccess with 0644 file permissions and 0755 directories in release ZIPs.
- Canvas engines remain independent of React's render loop. Local React runtime remains v16 (not React 19 in this release).

## 2.1.0 (2026-10-16)

- Stabilised chess squares and retained DOM nodes between moves.
- Rebuilt Wolf & Eggs drawing, lane basket positions and 12 difficulty levels.
- Reworked Darts 301 aiming, selectable difficulty and double-out rules.
- Polished Domino with premium table and new tiles.
- Added 12 help modals, unified muted-by-default sound, audio fixes for Wolf / Domino / Zole.
- Updated responsive gamepad brand icon, labels, offline cache and install assets.
- Preserved all 12 games and the HTTP 500 fix.


## 2.0.1 (2026-10-16)

- Fixed Apache/LiteSpeed HTTP 500 risk caused by malformed single-line
  `<IfModule>` syntax nested in `<FilesMatch>` in the v2.0.0 `.htaccess`.
- Simplified the host configuration and kept cached static assets.
- Bumped URL cache versions and the service worker cache key.
- No change to the 12 game implementations, UI or game save data.
