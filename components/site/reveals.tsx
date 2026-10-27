"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Draws a line-art scene stroke by stroke, in document order, the first time it
// scrolls in. Panels fill and labels appear once their outlines are down.
function build(stage: SVGGElement) {
  const svg = stage.ownerSVGElement!
  const shapes = gsap.utils
    .toArray<SVGGeometryElement>(stage.querySelectorAll("path, rect, circle:not(.beacon)"))
    .filter((s) => !s.closest("defs"))
  const fills = stage.querySelectorAll(".panel-fill")
  const labels = stage.querySelectorAll("text")

  // Strokes don't scale with the viewBox, so a dash may be measured in user
  // units or in screen pixels depending on the browser; cover both.
  const scale = Math.max(1, svg.getBoundingClientRect().width / svg.viewBox.baseVal.width)
  const lengths = shapes.map((s) => s.getTotalLength() * scale + 4)
  shapes.forEach((s, i) => gsap.set(s, { strokeDasharray: `${lengths[i]} ${lengths[i]}`, strokeDashoffset: lengths[i] }))
  if (fills.length) gsap.set(fills, { fillOpacity: 0 })
  if (labels.length) gsap.set(labels, { autoAlpha: 0 })

  const spread = 2.2 / shapes.length
  const tl = gsap.timeline({
    scrollTrigger: { trigger: svg, start: "top 82%", once: true },
    onComplete: () => gsap.set([...shapes, ...fills], { clearProps: "strokeDasharray,strokeDashoffset,fillOpacity" }),
  })
  shapes.forEach((s, i) => {
    const duration = gsap.utils.clamp(0.35, 1.1, lengths[i] / scale / 700)
    tl.to(s, { strokeDashoffset: 0, duration, ease: "power2.inOut" }, i * spread)
  })
  if (fills.length) tl.to(fills, { fillOpacity: 1, duration: 0.6, stagger: 0.04, ease: "power1.out" }, "-=0.6")
  if (labels.length) tl.to(labels, { autoAlpha: 1, duration: 0.5 }, "-=0.5")
}

// Fades up every [data-reveal] element as it enters, builds every [data-build]
// scene, and counts up every [data-count] number once. Mounted once per page.
function Reveals() {
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set("[data-reveal]", { autoAlpha: 0, y: 32 })
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 }),
      })

      gsap.utils.toArray<SVGGElement>("[data-build]").forEach(build)

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count)
        const decimals = (el.dataset.count!.split(".")[1] ?? "").length
        const state = { v: 0 }
        gsap.to(state, {
          v: end,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = state.v.toFixed(decimals)
          },
        })
      })
    })
  })

  return null
}

export { Reveals }
