import { Logo } from "@/components/site/logo"

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#model", label: "Distribution model" },
  { href: "#solutions", label: "Solutions" },
  { href: "#team", label: "Founder" },
  { href: "#contact", label: "Contact" },
]

function Nav({ ctaLabel }: { ctaLabel: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-ink/95 px-8 sm:px-10">
      <a href="#" aria-label="SwissVolt Distribution, back to top" className="text-[17px]">
        <Logo />
      </a>
      <nav aria-label="Primary" className="hidden gap-8 text-sm md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="opacity-70 transition-opacity duration-300 hover:opacity-100">
            {l.label}
          </a>
        ))}
      </nav>
      <a
        href="#contact"
        className="rounded-full border border-white/30 px-4 py-2 text-sm transition-colors duration-300 hover:bg-white hover:text-black"
      >
        {ctaLabel}
      </a>
    </header>
  )
}

export { Nav }
