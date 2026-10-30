import Link from "next/link";
import { CONTACT } from "@/data/contact";
import { getProjects } from "@/data/getProjects";

// The footer, on every page: four columns (the pages, the projects, where else to find me, and how
// this site is made) and a line under it. The pages are the ones of the menu plus Contact; the
// projects come from the same list as the tiles. On a phone the columns wrap two by two.
const PAGES = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];
const COLOPHON = ["Designed in Figma", "Built in code", "Hosted on Vercel"];

const LINK = "transition-colors duration-150 hover:text-fg";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[145px] flex-col gap-[14px] md:w-auto md:flex-1">
      <p className="font-bold text-fg">{title}</p>
      {children}
    </div>
  );
}

export async function Footer() {
  const projects = await getProjects();
  const elsewhere = [
    { label: "LinkedIn", href: CONTACT.linkedin },
    { label: "Instagram", href: CONTACT.instagram },
  ];

  return (
    <footer className="mx-auto w-full max-w-[1032px] px-6 pb-20">
      <div className="flex flex-wrap gap-x-6 gap-y-8 border-t border-[#363636] py-10 text-[14px] font-medium text-[#8c8c8c] md:flex-nowrap md:gap-x-10">
        <Column title="Pages">
          {PAGES.map((page) => (
            <Link key={page.href} href={page.href} className={LINK}>
              {page.label}
            </Link>
          ))}
        </Column>
        <Column title="Projects">
          {projects.map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className={LINK}>
              {project.name}
            </Link>
          ))}
        </Column>
        <Column title="Elsewhere">
          {elsewhere.map(({ label, href }) =>
            href ? (
              <a key={label} href={href} target="_blank" rel="noreferrer" className={LINK}>
                {label}
              </a>
            ) : (
              <span key={label}>{label}</span>
            ),
          )}
        </Column>
        <Column title="Colophon">
          {COLOPHON.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </Column>
      </div>
      <div className="flex justify-center pt-7 text-[13px] font-medium text-[#8c8c8c] md:justify-between">
        <p>© 2026 Daaf</p>
        <a href={`mailto:${CONTACT.email}`} className={`hidden md:block ${LINK}`}>
          {CONTACT.email}
        </a>
      </div>
    </footer>
  );
}
