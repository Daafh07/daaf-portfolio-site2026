import type { Inset } from "./types";

// "What I build with": the tools as outlined blobs. `width` is the blob's width in the design, in
// units of the type size (13.6px on a phone, 17px from md up, so it scales as one piece); `inset` is
// how far the outline lies inside its own picture. The shapes come from Figma.
export type Tool = { name: string; shape: string; width: number; inset: Inset };

const OUTLINE_HEIGHT = 36.8; // the blobs' height in the design, same unit as `width`
export const TOOL_HEIGHT = OUTLINE_HEIGHT / 13.6; // em

const tool = (name: string, shape: string, width: number, inset: Inset): Tool => ({ name, shape: `/tools/outline-${shape}.svg`, width: width / 13.6, inset });

export const TOOLS: Tool[] = [
  tool("Figma", "a", 88, [6.94, 0, 2.32, 0]),
  tool("React", "a", 88, [6.94, 0, 2.32, 0]),
  tool("Next.js", "b", 90.4, [7.02, 0, 2.32, 0]),
  tool("TypeScript", "c", 116, [7.46, 0, 1.66, 0]),
  tool("Tailwind", "d", 96, [7.19, 0, 2.31, 0]),
  tool("Framer Motion", "e", 136.8, [6.25, 0, 1.19, 0]),
  tool("Git", "a", 88, [6.94, 0, 2.32, 0]),
  tool("Vercel", "a", 88, [6.94, 0, 2.32, 0]),
  tool("VS Code", "f", 96.8, [7.21, 0, 2.31, 0]),
  tool("React Native", "g", 125.6, [6.85, 0, 1.41, 0]),
  tool("Expo", "a", 88, [6.94, 0, 2.32, 0]),
  tool("WebGL", "h", 89.6, [6.99, 0, 2.32, 0]),
  tool("Supabase", "i", 105.6, [7.46, 0, 2, 0]),
  tool("Notion", "a", 88, [6.94, 0, 2.32, 0]),
  tool("Prototyping", "j", 120.8, [7.14, 0, 1.53, 0]),
  tool("Design systems", "k", 142.4, [5.99, 0, 1.1, 0]),
];
