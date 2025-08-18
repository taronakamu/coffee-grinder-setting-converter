# Median-µm Grinder Setting Converter (Frontend)

React + Vite + TypeScript + Tailwind SPA to convert grinder settings by matching median particle size (µm).

- Static files under `public/grinders/` are mock fixtures for local dev.
- Real data will be provided separately as `/grinders/*.json` with manifest `/grinders/index.json`.

## Development

Install deps and start dev server:

```sh
pnpm i
pnpm dev
```

Run tests:

```sh
pnpm test
```

## Build

```sh
pnpm build
pnpm preview
```

Deployed on GitHub Pages. Ensure `vite.config.ts` base matches repo name.
