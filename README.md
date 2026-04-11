# Sight Words Studio

A more expressive fork of the original sight words app with a coach board, richer session flow, and a more playful mobile-first design.

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
- For best PWA behavior, serve over `http://localhost` during development or `https` when hosted remotely.

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
