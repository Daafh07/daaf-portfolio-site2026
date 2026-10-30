import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import type { AnyProject } from "./types";

type Row = { slug: string; name: string; data: Record<string, unknown> };

// The projects, from Supabase (table "projects", see supabase/projects.sql), in the order of
// sort_order. Without them there is nothing to show, so a failure stops the build or the render
// with a clear message instead of publishing an empty page.
export async function getProjects(): Promise<AnyProject[]> {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase
    .from("projects")
    .select("slug, name, data")
    .order("sort_order")
    .overrideTypes<Row[]>();

  if (error) throw new Error(`Could not read the projects from Supabase: ${error.message}`);
  if (!data.length) throw new Error('No projects in Supabase: run supabase/projects.sql, and check that "published" is true.');
  return data.map(({ slug, name, data }) => ({ slug, name, ...data }) as AnyProject);
}

export async function getProject(slug: string) {
  return (await getProjects()).find((project) => project.slug === slug);
}
