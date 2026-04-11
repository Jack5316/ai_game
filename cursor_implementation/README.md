# ai_game · Thought Alchemy

Static browser game served from the repo root.

## Local preview

```bash
python3 -m http.server 8899
```

Open [http://127.0.0.1:8899/index.html](http://127.0.0.1:8899/index.html).

## Deploy on EdgeOne Pages

1. Push this repo to GitHub.
2. In the [EdgeOne Pages console](https://console.cloud.tencent.com/edgeone/pages), create a new project and connect the repository.
3. No build command, install step, or output directory config needed — the site is pure static HTML/CSS/JS served from the repo root.
4. Deploy. The production URL will serve `/` → rules page and `/game.html` → the game.
