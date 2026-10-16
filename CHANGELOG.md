# Changelog

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
