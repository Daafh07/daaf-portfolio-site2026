import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlobButton } from "@/components/BlobButton";
import { getProject, getProjects } from "@/data/getProjects";

// One page per project, built ahead of time. For now a placeholder: the real pages (see the
// "Project page" frames in Figma) come later and will read their content from here.
export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return { title: project ? `${project.name} | Daaf Heijnekamp` : "Project not found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[1032px] flex-col items-start px-6 pt-32 pb-24">
      <h1 className="font-blur text-[clamp(3rem,10vw,6rem)] leading-none" style={{ color: project.hoverLabelColor ?? project.color }}>
        {project.name}
      </h1>
      <p className="mt-6 max-w-[443px] text-[15px] font-bold text-sub">This project page is coming soon.</p>
      <BlobButton href="/#work" className="mt-10">
        All projects
      </BlobButton>
    </main>
  );
}
