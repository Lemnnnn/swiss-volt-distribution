"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowUpRight } from "lucide-react"

import { ReachGlobe } from "@/components/site/reach-globe"

gsap.registerPlugin(useGSAP)

const ROUTE = [
  { term: "Sources", detail: "China and South Korea", swatch: "bg-foreground/60" },
  { term: "Hub", detail: "Bucharest, Romania", swatch: "bg-volt ring-4 ring-volt/25" },
  { term: "Markets", detail: "Romania, Bulgaria, Hungary, Poland, Czechia, Slovakia", swatch: "bg-volt" },
]

function Hero({ ctaLabel }: { ctaLabel: string }) {
  const root = React.useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out", duration: 1.4 } })
          .from("[data-line] > span", { yPercent: 105, stagger: 0.09 })
          .from("[data-fade]", { autoAlpha: 0, y: 16, duration: 1, stagger: 0.07 }, "-=1.05")
      })
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      className="relative grid min-h-dvh content-center gap-6 overflow-hidden px-8 pt-24 pb-16 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-0"
    >
      <div className="relative z-[1]">
        <h1 className="font-wide text-[clamp(2.5rem,4.4vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.035em]">
          <span data-line className="block overflow-hidden pb-[0.06em]">
            <span className="block">Powering Europe&rsquo;s</span>
          </span>
          <span data-line className="block overflow-hidden pb-[0.06em]">
            <span className="block">
              energy <span className="text-volt">transition.</span>
            </span>
          </span>
        </h1>

        <p data-fade className="mt-7 max-w-md text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          We import renewable energy infrastructure from leading Asian manufacturers and distribute it to B2B partners
          across Europe.
        </p>

        <a
          data-fade
          href="#contact"
          className="group mt-9 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-45" />
        </a>

        <dl className="mt-14 grid max-w-xl gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
          {ROUTE.map((r) => (
            <div key={r.term} data-fade>
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden className={`size-1.5 rounded-full ${r.swatch}`} />
                {r.term}
              </dt>
              <dd className="mt-1.5 text-sm leading-snug text-foreground">{r.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Oversized globe anchored off the right edge; the mask keeps the route in view and dissolves the rest. */}
      <div className="globe-stage pointer-events-none relative -mx-8 h-[115vw] sm:-mx-10 lg:absolute lg:inset-0 lg:mx-0 lg:h-auto">
        <ReachGlobe frameClassName="absolute top-[2vw] left-[-2vw] size-[112vw] lg:top-[calc(50%-50vh)] lg:left-[calc(74vw-50vh)] lg:size-[100vh]" />
        <div aria-hidden className="globe-fade pointer-events-none absolute inset-0" />
      </div>
    </section>
  )
}

export { Hero }
