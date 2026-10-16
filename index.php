<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: SAMEORIGIN');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header('Cache-Control: no-cache, must-revalidate');
?>
<!doctype html>
<html lang="en-GB" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0b1020">
  <meta name="description" content="Games 63: 12 colourful free mobile and desktop browser games. Arcade, racing, cards, chess, domino, Zole and more.">
  <meta name="application-name" content="Games 63">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Games 63">
  <meta property="og:title" content="Games 63 — Free browser games">
  <meta property="og:description" content="12 free browser mini-games, mobile ready, play instantly.">
  <link rel="manifest" href="./manifest.webmanifest?v=2.1.0">
  <link rel="icon" type="image/svg+xml" href="./assets/icon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="./assets/icon-192.png">
  <link rel="apple-touch-icon" href="./assets/icon-180.png" sizes="180x180">
  <link rel="stylesheet" href="./assets/style.css?v=2.1.0">
  <title>Games 63 — Play free browser games</title>
</head>
<body>
 <div id="app"><div class="boot-loading">✦ Loading Games 63…</div></div>
 <noscript><p style="padding:24px">Games 63 needs JavaScript enabled to play.</p></noscript>
 <script src="./assets/vendor/react.production.min.js?v=2.1.0"></script>
 <script src="./assets/vendor/react-dom.production.min.js?v=2.1.0"></script>
 <script type="module" src="./assets/app.js?v=2.1.0"></script>
</body>
</html>
