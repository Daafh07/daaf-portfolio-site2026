import { SoundToggle } from "@/components/SoundToggle";
import { BlobButton } from "@/components/BlobButton";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-bg/92">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1032px] items-center justify-between px-6 md:h-[72px]"
      >
        <a href="#top" className="font-blur text-2xl leading-none text-fg">
          Daaf
        </a>
        <div className="flex items-center gap-[30px]">
          <ul className="hidden items-center gap-[30px] md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-bold text-sub transition-colors duration-150 hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <SoundToggle dark />
          <BlobButton href="#contact" className="w-[118px]">
            Contact
          </BlobButton>
        </div>
      </nav>
    </header>
  );
}
