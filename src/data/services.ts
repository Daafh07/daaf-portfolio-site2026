// "How I can help": the five things I make (the dock) and the four steps of how I work (the
// accordion). The copy and the blob shapes come from Figma, section "V6 - Na eerste testronde".
import type { Inset } from "./types";

export type Service = {
  name: string;
  /** The word in two lines on desktop. */
  lines: [string, string];
  /** The one short word on a phone, where the name sits under the blob. */
  word: string;
  src: string;
  /** How far the blob lies inside its own picture. */
  inset: Inset;
  /** The type is smaller on the long word. */
  size: number;
};

export const SERVICES: Service[] = [
  { name: "Websites", lines: ["Web", "sites"], word: "Web", src: "/services/websites.svg", inset: [0.45, 0.49, 0.53, 0.63], size: 27 },
  { name: "Webapps", lines: ["Web", "apps"], word: "App", src: "/services/webapps.svg", inset: [1.44, 1.23, 1.12, 0.64], size: 27 },
  { name: "Mobile apps", lines: ["Mobile", "apps"], word: "iOS", src: "/services/mobile-apps.svg", inset: [1.33, 2.02, 0.52, 1.51], size: 27 },
  { name: "Webgames", lines: ["Web", "games"], word: "Play", src: "/services/webgames.svg", inset: [0.45, 0.49, 0.53, 0.63], size: 27 },
  { name: "AI automation", lines: ["AI", "automation"], word: "AI", src: "/services/ai-automation.svg", inset: [1.44, 1.23, 1.12, 0.64], size: 19 },
];

export type Step = {
  title: string;
  lead: string;
  body: string;
  /** Two columns of what you get. */
  gets: [string[], string[]];
  time: string;
};

export const STEPS: Step[] = [
  {
    title: "01.  Shape the idea",
    lead: "From a rough idea to a clear visual direction.",
    body: "We start with what you want people to feel and do, not with screens. I ask a lot of questions, look at what is already out there, and turn the answers into a direction you can see instead of imagine.",
    gets: [["Kickoff session", "Moodboard and direction"], ["Sitemap and page flow", "First look at the visual language"]],
    time: "Usually 1 to 2 weeks",
  },
  {
    title: "02. Design it",
    lead: "Screens, brand and a prototype you can click.",
    body: "The direction becomes something real. Every screen designed for desktop and mobile, the type, colour and components collected into a small system, and the tricky parts prototyped so we can feel them before they are built.",
    gets: [["Design for desktop and mobile", "A small design system"], ["Clickable prototype", "Two rounds of feedback"]],
    time: "Usually 2 to 4 weeks",
  },
  {
    title: "03. Build it",
    lead: "Websites and apps, written in code.",
    body: "I build what I design, so nothing gets lost along the way. A front end that stays fast on a phone and works with a keyboard, plus the back end when your site needs accounts, data or a link to something you already use.",
    gets: [["Front and back end", "Responsive from 390px up"], ["CMS for text and images", "Tested on real devices"]],
    time: "Usually 2 to 6 weeks",
  },
  {
    title: "04. Launch it",
    lead: "Live, measured and ready to grow.",
    body: "Launch day is a day, not the finish. Domain, speed, search basics and analytics are set up before we go live, you get a short guide written in plain language, and I stay around for the things that always come up in the first weeks.",
    gets: [["Domain and hosting", "Speed and SEO basics"], ["Analytics you understand", "Handover guide and aftercare"]],
    time: "Launch day plus a month of support",
  },
];
