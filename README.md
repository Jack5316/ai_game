# ai_game · Thought Alchemy

Static browser game under [`thought-alchemy/`](./thought-alchemy/).

## Local preview

```bash
cd thought-alchemy && python3 -m http.server 8899
```

Open [http://127.0.0.1:8899/index.html](http://127.0.0.1:8899/index.html).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com/new), **Import** the repository.
3. Vercel reads [`vercel.json`](./vercel.json): the site is served from `thought-alchemy/` (no install or build step).
4. Deploy. Production URL will serve `/` → rules page and `/game.html` → the game.

If the dashboard ever asks for **Root Directory**, set it to `thought-alchemy` (the JSON config should make that unnecessary).
