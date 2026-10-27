# VarunOS Web Edition

A desktop-inspired web UI built with HTML, CSS, and vanilla JavaScript. Designed as a beginner-friendly portfolio project for GitHub Pages.

## Features
- Desktop icons, Start menu, app search, taskbar, draggable app windows
- About app, Notes with browser-local persistence, sample File Explorer, simulated Terminal, Settings, Calculator
- Dark/light appearance and accent options
- Responsive layout for desktop and mobile
- No build step, package installation, API keys, or paid services required

## Important limitations
This is a **web desktop simulation**, not a real operating system. The File Explorer uses sample entries and cannot browse your computer's files. The Terminal supports a small set of demo commands and does not execute OS commands. Notes/settings are saved in the current browser using `localStorage`; they do not automatically sync between browsers or devices.

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. For a local development server, open the folder in VS Code and use a static server extension, or run `python -m http.server 8000` in the project directory and visit `http://localhost:8000`.

## Publish with GitHub Pages
1. Create a GitHub repository named `varunos-web`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for the deployment to finish. The Pages section will show the published URL.

## Project structure
```text
VarunOS-Web/
├── index.html
├── style.css
├── script.js
└── README.md
```

## License
MIT — see `LICENSE`.
