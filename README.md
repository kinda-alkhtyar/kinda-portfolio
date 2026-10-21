# Kinda Alhidyar Portfolio

React and Vite portfolio with interactive 3D scenes, project case studies, and responsive pages.

## CV downloads

The site serves four PDFs from `public/cv/`. Replace these files with the final reviewed CVs while keeping these filenames:

- `Kinda-Alkhityar-CV-English.pdf`
- `Kinda-Alkhityar-CV-Deutsch.pdf`
- `Kinda-Alkhityar-CV-Turkce.pdf`
- `Kinda-Alkhityar-CV-Arabic.pdf`

Verified live website links are included for Aqarati Syria, Taaniqi with Iman, and Yumna Al-Muallem Portfolio. Case studies retain only confirmed technology details.

## Development

```sh
npm install
npm run dev
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

## Production

```sh
npm run build
npm run preview
```

The build checks TypeScript and generates the production site in `dist`.

## Source folders

- `src/components`: reusable components
- `src/sections`: portfolio page sections
- `src/styles`: future styles
- `src/assets`: images and other assets
- `src/data`: portfolio content
- `src/hooks`: custom React hooks
- `src/types`: shared TypeScript types

Empty folders contain `.gitkeep` placeholders so Git preserves the structure.
