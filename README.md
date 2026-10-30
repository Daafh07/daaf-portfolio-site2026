# Daaf Heijnekamp, portfolio

Personal portfolio of Daaf Heijnekamp, creative developer and designer. The design lives in Figma
("Showcase Portfolio S3", section "V6 - Na eerste testronde"), which is the source of truth for
layout, copy and spacing.

Next.js 16 (App Router, TypeScript), Tailwind CSS v4 and Motion. Deployed on Vercel. Supabase is
planned for the contact form and anything dynamic, but is not connected yet.

> This Next.js version has breaking changes. Read [AGENTS.md](AGENTS.md) and the guides in
> `node_modules/next/dist/docs/` before writing Next-specific code.

## Getting started

```bash
npm install
npm run dev        # http://localhost:4000
```

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Development server                    |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | TypeScript, no emit                   |

## Structure

```
src/
  app/                    Routes, root layout (fonts, intro gate script), global CSS and tokens
  components/
    hero/                 The hero: wordmark and the six floating icons (positions in stickers.ts)
    intro/                The intro, see below
    GlassCursor.tsx       Liquid glass lens that follows the cursor and attaches to icons and controls
    Nav.tsx               Fixed menu (built, not on the page yet)
    BlobButton.tsx        Blob-shaped button
    SoundToggle.tsx       Sound on/off
  lib/
    glass/                WebGL lens (lens.ts) and the magnet/snap logic (magnet.ts)
    sound/                Web Audio engine, the sound designs (no audio files) and the vibration that goes with them
  fonts/                  Blur Bold
public/
  hero/                   Icons around the wordmark
  ui/                     Shared UI artwork
```

## The intro

On the homepage, once per session (and again on reload), unless the visitor prefers reduced motion:
a slingshot mini game (shoot the D at the white canvas), then the letters rise, fly to the big
wordmark, the icons pop in, the curtain opens and everything lands on the real hero.

- `intro/introGate.ts` is a tiny inline script that decides before first paint whether the intro plays.
- `intro/IntroSequence.tsx` is the director: it moves through the phases.
- `intro/measureIntro.ts` measures where the real hero elements are, so the animation lands on them exactly.
- `intro/slingshot/` is the mini game (physics in `slingshotPhysics.ts`).
- **All timings and physics live in `intro/introConfig.ts`**, with a comment per value. Start there to tweak.

## Design tokens

Background `#080808`, foreground `#fafafa`, secondary `#cecece`. Headings and wordmark in Blur Bold,
body in Poppins 400/500/700.

## Notes

- `src/fonts/Blur-Bold.ttf` is a commercial typeface (Neville Brody, FontShop) and is included in this
  repository because the site needs it to build. Check that your license covers web use and redistribution.
- Environment variables go in `.env.local` (ignored by git). None are needed yet.
