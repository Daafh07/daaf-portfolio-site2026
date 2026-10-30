"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { sound } from "@/lib/sound/engine";
import { BlobButton } from "@/components/BlobButton";

// The links start with "/" so they also work from a page other than the homepage.
const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
];

// Height of the bar on desktop. The hero counts as "passed" once it has scrolled behind it.
const BAR = 72;

// The fixed menu. While the hero is on screen the menu stays out of sight (globals.css hides it on
// every page that has a hero); it fades in once the hero has scrolled behind the bar. Pages
// without a hero show it right away. This component only reports whether the hero is passed, with
// the attribute data-past-hero. On a phone only the wordmark and the Contact button are shown.
export function Nav() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    let observer: IntersectionObserver | undefined;
    let watching: Element | null = null;

    const connect = () => {
      const hero = document.getElementById("top");
      if (hero === watching) return;
      observer?.disconnect();
      watching = hero;
      if (!hero) {
        nav.removeAttribute("data-past-hero");
        return;
      }
      // Passed = no longer in sight AND above the screen (not "not reached yet", the hero is first anyway).
      observer = new IntersectionObserver(
        ([entry]) => {
          const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          if (passed && !nav.hasAttribute("data-past-hero")) sound.play("contentIn", 0.2);
          nav.toggleAttribute("data-past-hero", passed);
        },
        { rootMargin: `-${BAR}px 0px 0px 0px` },
      );
      observer.observe(hero);
    };

    connect();
    // The hero comes and goes when you move between pages, as the menu stays.
    const pages = new MutationObserver(connect);
    pages.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      pages.disconnect();
    };
  }, []);

  return (
    <header ref={ref} className="site-nav fixed inset-x-0 top-0 z-40 bg-bg/92">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1032px] items-center justify-between px-6 md:h-[72px]">
        <Link href="/#top" className="font-blur text-2xl leading-none text-fg">
          Daaf
        </Link>
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
          <BlobButton href="/#contact" className="w-[118px]">
            Contact
          </BlobButton>
        </div>
      </nav>
    </header>
  );
}
