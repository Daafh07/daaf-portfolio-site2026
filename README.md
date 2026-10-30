# Daaf Heijnekamp, portfolio

Personal portfolio of Daaf Heijnekamp, creative developer and designer. The design lives in Figma
("Showcase Portfolio S3", section "V6 - Na eerste testronde"), which is the source of truth for
layout, copy and spacing.

Next.js 16 (App Router, TypeScript), Tailwind CSS v4 and Motion. Deployed on Vercel. The projects
come from Supabase.

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
  app/                    Routes (home, /projects/[slug]), root layout (fonts, intro gate script), global CSS and tokens
  components/
    hero/                 The hero: wordmark and the six floating icons (positions in stickers.ts)
    intro/                The intro, see below
    introduction/         The section after the hero: photo fan (with its reveal and hover, all in fanMotion.ts) and the introduction text
    projects/             "Selected Projects": the grid, a hand-fitted tile (ProjectTile) and the standard tile for new projects (GenericTile)
    services/             "How I can help": the dock of five blobs with the panel of the one picked, and the four steps that open while you scroll
    statement/            The statement: the screen stays still while it types itself out, with pink dots on turning circles behind it (StatementParticles: the dots behave like Bencho's Particles) and a wave that blows them away
    experience/           "Work experience": the timeline, whose line draws itself as you scroll (the copy is in data/experience.ts)
    outside/              "Outside the browser": the bento of five tiles
    contact/              "Let's build something" (data/contact.ts has the email and the two links) and the closing wordmark
    Footer.tsx            The footer on every page: pages, the projects (from Supabase), elsewhere, colophon
    tools/                "What I build with": the tools as loose outlined blobs that the pointer pushes and a click throws out (data/tools.ts)
    motion/               Reveal (lifts content in when it scrolls into view) and ParallaxGrid (the columns of the project grid drift while you scroll)
    GlassCursor.tsx       Liquid glass cursor, on every page: big lens on the hero, mini ball elsewhere, grows to fit buttons, links and icons
    Nav.tsx               Fixed menu: out of sight while the hero is on screen, fades in once it has scrolled behind the bar (always visible on pages without a hero)
    BlobButton.tsx        Blob-shaped button
    SoundToggle.tsx       Sound on/off
  data/                   types.ts: the shape of a project; getProjects.ts: reads them from Supabase; layout.ts: where a tile sits, from its number in the list; services.ts: the copy of "How I can help"; experience.ts and tools.ts: the timeline and the tool wall
  lib/
    glass/                WebGL lens (lens.ts), the painter that redraws what lies under it (scene.ts) and the magnet/snap logic (magnet.ts)
    sound/                Web Audio engine, the sound designs (no audio files; one-shot sounds, and a continuous "swirl" layer that follows how fast something moves) and the vibration that goes with them
  fonts/                  Blur Bold
public/
  hero/                   Icons around the wordmark
  ui/                     Shared UI artwork
  projects/<slug>/        Artwork of one tile: blob, logo, hover preview, badge, arrow
  services/               The five blobs of the dock
  tools/                  The eleven outlined blob shapes of the tool wall
  outside/                Photo and icons of the bento
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
- The glass lens redraws the page under it by hand (`src/lib/glass/scene.ts`), so a new kind of
  element (a background image, a border, a shadow) has to be taught to it. To check the painter
  against the real page, add the attribute `data-glass-raw` to `<html>` in the devtools: the lens
  then shows what was painted, without bending it.
- Supabase: copy `.env.example` to `.env.local` and fill in the project URL and the publishable key
  (never the service_role key); on Vercel set the same two variables. Run `supabase/projects.sql`
  once in the SQL editor to create the table, its read-only rule and the starting projects. Without
  these the site stops with a message saying what is missing.
