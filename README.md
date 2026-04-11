# ai_game · Thought Alchemy

Static browser game under [`thought-alchemy/`](./thought-alchemy/).

## Local preview

```bash
cd thought-alchemy && python3 -m http.server 8899
```

Open [http://127.0.0.1:8899/index.html](http://127.0.0.1:8899/index.html).

## Deploy on EdgeOne Pages

1. Push this repo to GitHub.
2. In the [EdgeOne Pages console](https://console.cloud.tencent.com/edgeone/pages), create a new project and connect the repository.
3. Set the **root directory** to `thought-alchemy`.
4. No build command or install step is needed — the site is pure static HTML/CSS/JS.
5. Deploy. The production URL will serve `/` → rules page and `/game.html` → the game.
