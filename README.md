# Sight Words Studio

A more expressive fork of the original sight words app with a coach board, richer session flow, and a more playful mobile-first design.

## Hosted app

GitHub Pages URL: `https://brianpeartree.github.io/site-words-studio/`

## Features
- Single-player and multiplayer modes
- Session goals and quick presets
- Learner profiles for emerging, steady, and faster readers
- Coach board with streak, accuracy, and due-word signals
- Strategy suggestions that shift with the current session
- Word list editor for custom sight words
- Pass and Try Again controls for faster practice
- Progress map with known and review word banks
- Session summary with wins, repeats, and words to keep nearby
- Reward shelf with unlockable badges
- Local leaderboard for best sessions on the device
- Local progress tracking in browser storage
- PWA install support for Android and iPhone home screens
- Offline app shell caching after the first load

## Run locally

1. Open a terminal in this folder.
2. Start a local server:

```bash
python3 -m http.server 8000
```

3. Open the site on your phone using your computer's IP address:

```text
http://<computer-ip>:8000
```

Example: `http://192.168.1.100:8000`

## Notes
- This fork uses a different local storage key from the original project, so both apps can live side by side.
- Phones must be on the same Wi-Fi network as the computer.
- Use the mode selector to switch between single-player and multiplayer.
- `Review Now` starts a review-focused session immediately.
- Home-screen installs remember the exact address they were installed from. If your computer's IP changes, or the local server is stopped, an install from `http://<computer-ip>:8000` may fail before the app can load.
- Offline install support requires a service worker, and service workers only run on secure origins. Use `http://localhost` for local desktop testing, or an `https` URL when installing on a phone. A plain `http://<computer-ip>:8000` phone install can open from the home screen, but it will not be offline-ready.
- For the most reliable phone install, host this static folder at a stable `https` address such as GitHub Pages, Netlify, Cloudflare Pages, or a trusted HTTPS server on your network.

## Install on phones

### Android
- Open the app in Chrome.
- Use `Add to Home screen` or `Install app` from the browser menu.

### iPhone
- Open the app in Safari.
- Tap the Share button, then choose `Add to Home Screen`.

## Offline behavior
- After the first successful load, the app shell is cached for offline reuse.
- Word progress still saves in browser storage on the device.
- When installed from a secure origin, launches use the cached app shell first and quietly refresh from the network when it is available.
