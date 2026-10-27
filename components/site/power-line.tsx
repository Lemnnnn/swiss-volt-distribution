"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

type Point = [number, number]

const SVG_NS = "http://www.w3.org/2000/svg"

// One conductor drawn over the whole page. It starts at [data-wire-start],
// runs down a rail, crosses every [data-wire-stop] scene at its wire height and
// ends at [data-wire-end]. The current advances with scroll: horizontal runs
// are crossed while their scene is on screen, so the pulse stays in view.
//
// Performance: the lit wire is split into one element per segment so a scroll
// frame only repaints the segment being filled, and the pulse head is an HTML
// layer moved with transforms (compositor only, no SVG repaint).
function PowerLine({ children }: { children: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const svg = el.querySelector<SVGSVGElement>("svg[data-powerline]")!
      const base = svg.querySelector<SVGPathElement>("[data-base]")!
      const glowGroup = svg.querySelector<SVGGElement>("[data-glow]")!
      const litGroup = svg.querySelector<SVGGElement>("[data-lit]")!
      const head = el.querySelector<HTMLElement>("[data-head]")!
      const trail = [...el.querySelectorAll<HTMLElement>("[data-trail]")]
      const start = el.querySelector<HTMLElement>("[data-wire-start]")!
      const end = el.querySelector<HTMLElement>("[data-wire-end]")!
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      let pts: Point[] = []
      let cum: number[] = []
      let times: number[] = []
      let total = 0
      let stops: { at: number; stage: Element | null; lit: boolean }[] = []
      let segments: {
        len: number
        lit: SVGPathElement
        glow: SVGPathElement
        shown: number
      }[] = []
      let powered = false

      const build = () => {
        const box = el.getBoundingClientRect()
        const W = el.clientWidth
        const H = el.scrollHeight
        const vh = window.innerHeight
        const top = box.top + window.scrollY
        const railX = W >= 1024 ? W / 2 : 14

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`)
        svg.style.height = `${H}px`

        const rel = (n: Element) => {
          const r = n.getBoundingClientRect()
          return {
            l: r.left - box.left,
            t: r.top - box.top,
            w: r.width,
            h: r.height,
          }
        }

        const raw: Point[] = []
        let run = 0
        const push = (x: number, y: number) => {
          const prev = raw.at(-1)
          if (prev) run += Math.abs(x - prev[0]) + Math.abs(y - prev[1])
          raw.push([x, y])
        }

        const s = rel(start)
        push(s.l + s.w / 2, s.t + s.h / 2)
        const nextStops: typeof stops = []

        const targets = [
          ...el.querySelectorAll<HTMLElement>(
            "[data-wire-stop], [data-wire-end]"
          ),
        ]
        for (const node of targets) {
          const section = node.closest("section") ?? node
          const gapY = rel(section).t + 56
          const r = rel(node)
          push(raw.at(-1)![0], gapY)

          if (node === end) {
            const y = r.t + r.h / 2
            push(railX, gapY)
            push(railX, y)
            push(r.l >= railX ? r.l : r.l + r.w, y)
            continue
          }

          // Full-width scenes would put the rail through their copy, so the
          // line drops down the page margin and enters from the left edge.
          // `data-wire-enter="end"` stops are entered from their right end by
          // the line already running down the right margin (desktop only).
          const wide = r.w > W * 0.7
          const fromEnd = node.dataset.wireEnter === "end" && W >= 1024
          const y = r.t + r.h * Number(node.dataset.wire)
          const leftIn =
            !fromEnd &&
            (wide || Math.abs(r.l - railX) <= Math.abs(r.l + r.w - railX))
          const [inX, outX, dir] = leftIn
            ? [r.l, r.l + r.w, 1]
            : [r.l + r.w, r.l, -1]
          const approachX = wide ? inX - 18 : fromEnd ? raw.at(-1)![0] : railX
          push(approachX, gapY)
          push(approachX, y)
          push(inX, y)
          nextStops.push({
            at: run,
            stage:
              node.querySelector(".stage") ?? node.closest("[data-wire-glow]"),
            lit: false,
          })
          push(outX, y)
          push(outX + dir * 18, y)
        }
        stops = nextStops

        // Drop zero-length and collinear points so every vertex is a corner.
        pts = []
        for (const p of raw) {
          const a = pts.at(-1)
          if (a && a[0] === p[0] && a[1] === p[1]) continue
          const b = pts.at(-2)
          if (
            a &&
            b &&
            ((b[0] === a[0] && a[0] === p[0]) ||
              (b[1] === a[1] && a[1] === p[1]))
          )
            pts.pop()
          pts.push(p)
        }

        cum = [0]
        for (let i = 1; i < pts.length; i++) {
          cum[i] =
            cum[i - 1] +
            Math.abs(pts[i][0] - pts[i - 1][0]) +
            Math.abs(pts[i][1] - pts[i - 1][1])
        }
        total = cum.at(-1)!

        // Scroll position at which the current reaches each vertex.
        const horizontal = (i: number) =>
          i >= 0 && i < pts.length - 1 && pts[i][1] === pts[i + 1][1]
        times = pts.map(([, y], i) => {
          const docY = y + top
          if (horizontal(i)) return docY - vh * 0.7
          if (horizontal(i - 1)) return docY - vh * 0.4
          return docY - vh * 0.55
        })
        // The current rests at its origin until the visitor starts scrolling.
        times[0] = Math.max(times[0], 0)
        for (let i = 1; i < times.length; i++) {
          times[i] = Math.max(
            times[i],
            times[i - 1] + (cum[i] - cum[i - 1]) * 0.25
          )
        }
        const maxScroll = document.documentElement.scrollHeight - vh
        const last = times.at(-1)!
        if (last > maxScroll) {
          const a = Math.max(times[0], maxScroll - vh * 1.5)
          times = times.map((t) =>
            t > a ? a + ((t - a) * (maxScroll - a)) / (last - a) : t
          )
        }

        base.setAttribute("d", "M" + pts.map((p) => p.join(" ")).join(" L"))

        glowGroup.replaceChildren()
        litGroup.replaceChildren()
        segments = []
        for (let i = 0; i < pts.length - 1; i++) {
          const len = cum[i + 1] - cum[i]
          const d = `M${pts[i].join(" ")} L${pts[i + 1].join(" ")}`
          const make = (group: SVGGElement) => {
            const p = document.createElementNS(SVG_NS, "path")
            p.setAttribute("d", d)
            p.style.strokeDasharray = `${len}`
            p.style.strokeDashoffset = `${len}`
            group.append(p)
            return p
          }
          segments.push({
            len,
            glow: make(glowGroup),
            lit: make(litGroup),
            shown: 0,
          })
        }
        for (const s of stops) s.lit = false
        powered = false
      }

      const pointAt = (len: number): Point => {
        const l = gsap.utils.clamp(0, total, len)
        let i = 1
        while (i < cum.length - 1 && cum[i] < l) i++
        const [x0, y0] = pts[i - 1]
        const [x1, y1] = pts[i]
        const f = (l - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
        return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]
      }

      const lengthAt = (scroll: number) => {
        if (scroll <= times[0]) return 0
        for (let i = 0; i < times.length - 1; i++) {
          if (scroll < times[i + 1]) {
            return (
              cum[i] +
              (cum[i + 1] - cum[i]) *
                ((scroll - times[i]) / (times[i + 1] - times[i] || 1))
            )
          }
        }
        return total
      }

      const place = (node: HTMLElement, [x, y]: Point) => {
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      const render = (len: number) => {
        // Only touch segments whose fill actually changed.
        segments.forEach((s, i) => {
          const shown = gsap.utils.clamp(0, s.len, len - cum[i])
          if (Math.abs(shown - s.shown) < 0.25) return
          s.shown = shown
          const offset = `${s.len - shown}`
          s.lit.style.strokeDashoffset = offset
          s.glow.style.strokeDashoffset = offset
        })

        place(head, pointAt(len))
        head.style.opacity = len < total ? "1" : "0"
        trail.forEach((t) =>
          place(t, pointAt(len - Number(t.dataset.trail) * 16))
        )

        for (const s of stops) {
          const lit = len >= s.at
          if (lit !== s.lit) {
            s.lit = lit
            s.stage?.classList.toggle("is-lit", lit)
          }
        }
        const isPowered = len >= total - 1
        if (isPowered !== powered) {
          powered = isPowered
          end.classList.toggle("is-powered", isPowered)
        }
      }

      let shown = 0
      const update = () => {
        shown = reduce ? total : lengthAt(window.scrollY)
        render(shown)
      }
      const rebuild = () => {
        build()
        update()
      }

      rebuild()
      const ro = new ResizeObserver(rebuild)
      ro.observe(el)
      document.fonts?.ready.then(rebuild)
      // Hero intro animations shift the start point; measure again once settled.
      const settle = window.setTimeout(rebuild, 1800)

      // The globe moves the start point while it animates or is dragged.
      // Re-measuring the page every frame would thrash layout, so batch it.
      let moved = 0
      const onMove = () => {
        window.clearTimeout(moved)
        moved = window.setTimeout(rebuild, 120)
      }
      window.addEventListener("powerline:rebuild", onMove)

      const tick = () => {
        const target = lengthAt(window.scrollY)
        if (Math.abs(target - shown) < 0.5) return
        shown += (target - shown) * 0.2
        render(shown)
      }
      if (!reduce) gsap.ticker.add(tick)

      return () => {
        ro.disconnect()
        window.clearTimeout(settle)
        window.clearTimeout(moved)
        window.removeEventListener("powerline:rebuild", onMove)
        gsap.ticker.remove(tick)
      }
    },
    { scope: root }
  )

  return (
    <div ref={root} className="energy relative overflow-x-clip">
      {children}
      <svg
        data-powerline
        className="pointer-events-none absolute inset-x-0 top-0 z-10 w-full"
        aria-hidden
      >
        <path
          data-base
          fill="none"
          stroke="oklch(1 0 0 / 14%)"
          strokeWidth="1.5"
          strokeDasharray="3 7"
        />
        <g
          data-glow
          fill="none"
          stroke="var(--volt)"
          strokeOpacity="0.15"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <g
          data-lit
          fill="none"
          stroke="var(--volt)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-10"
      >
        {[3, 2, 1].map((i) => (
          <span
            key={i}
            data-trail={i}
            className="absolute rounded-full bg-volt will-change-transform"
            style={{
              opacity: 0.75 - i * 0.18,
              width: 8 - i * 1.6,
              height: 8 - i * 1.6,
              margin: -(4 - i * 0.8),
            }}
          />
        ))}
        <span
          data-head
          className="absolute -top-[46px] -left-[46px] size-[92px] rounded-full opacity-0 will-change-transform"
          style={{
            background:
              "radial-gradient(circle, white 0 5px, color-mix(in oklch, var(--volt) 90%, transparent) 6px, color-mix(in oklch, var(--volt) 25%, transparent) 16px, transparent 46px)",
          }}
        />
      </div>
    </div>
  )
}

export { PowerLine }
