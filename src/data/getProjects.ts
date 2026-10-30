import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { PROJECTS, type AnyProject } from "./projects";

type Row = { slug: string; name: string; data: Record<string, unknown> };

// The projects, from Supabase (table "projects", see supabase/projects.sql). If Supabase can't be
// reached or the table is empty, the list in ./projects.ts is used, so the site never shows nothing.
export async function getProjects(): Promise<AnyProject[]> {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase
    .from("projects")
    .select("slug, name, data")
    .order("sort_order")
    .overrideTypes<Row[]>();

  if (error || !data?.length) return PROJECTS;
  return data.map(({ slug, name, data }) => ({ slug, name, ...data }) as AnyProject);
}

export async function getProject(slug: string) {
  return (await getProjects()).find((project) => project.slug === slug);
}
