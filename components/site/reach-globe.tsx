"use client"

import * as React from "react"
import type { GeometryCollection, Topology } from "topojson-specification"

// Markets listed on swissvolt-distribution.com (plus "Balkan & CEE regions").
// ISO 3166-1 numeric codes, as used by world-atlas.
const MARKETS = ["642", "100", "348", "616", "203", "703"] // RO BG HU PL CZ SK
const SOURCES = ["156", "410"] // CN KR

const HUB = { lat: 44.43, lng: 26.1 }
const ORIGINS = [
  { lat: 31.23, lng: 121.47 }, // Shanghai
  { lat: 22.54, lng: 114.06 }, // Shenzhen
  { lat: 35.18, lng: 129.08 }, // Busan
]
// Pinned names, each joined to its point by a leader. The European markets are
// only a few px apart, so they are stacked into a numbered list beside the hub,
// in north-to-south order. The sources hang at a fixed offset from their own
// point (`end` right-aligns the label). On wide screens both move out into the
// empty middle of the globe; see layoutTags.
type Tag = {
  lat: number
  lng: number
  text: string
  kind: "source" | "hub" | "market" | "heading"
  note?: string
  offset?: { wide: [number, number]; narrow: [number, number] }
  end?: boolean
}
const TAGS: Tag[] = [
  {
    lat: 34,
    lng: 103,
    text: "China",
    note: "Manufacturing",
    kind: "source",
    offset: { wide: [-30, -250], narrow: [-70, 70] },
  },
  {
    lat: 36.4,
    lng: 127.9,
    text: "South Korea",
    note: "Manufacturing",
    kind: "source",
    offset: { wide: [10, -300], narrow: [-14, 44] },
    end: true,
  },
  { lat: HUB.lat, lng: HUB.lng, text: "Markets · Central & Eastern Europe", kind: "heading" },
  { lat: 49.8, lng: 15.5, text: "Czechia", kind: "market" },
  { lat: 52, lng: 19.4, text: "Poland", kind: "market" },
  { lat: 48.7, lng: 19.7, text: "Slovakia", kind: "market" },
  { lat: 47.1, lng: 19.5, text: "Hungary", kind: "market" },
  { lat: 45.9, lng: 24.9, text: "Romania", kind: "market" },
  { lat: HUB.lat, lng: HUB.lng, text: "Bucharest", note: "Hub", kind: "hub" },
  { lat: 42.7, lng: 25.3, text: "Bulgaria", kind: "market" },
]
const COLUMN = TAGS.filter((t) => !t.offset)
const HUB_ROW = COLUMN.findIndex((t) => t.kind === "hub")
// px from the hub to the list, and between rows
const LIST = { wide: { x: 150, gap: 34 }, narrow: { x: 60, gap: 26 } }

const CAPITALS = [
  { lat: 42.7, lng: 23.32 },
  { lat: 47.5, lng: 19.04 },
  { lat: 52.23, lng: 21.01 },
  { lat: 50.08, lng: 14.42 },
  { lat: 48.15, lng: 17.11 },
]

// North Korea's outline in world-atlas 110m makes h3 throw, which aborts the
// whole dot layer (checked against every shape in the dataset).
const BROKEN_SHAPES = ["408"]

const HOME_VIEW = { lat: 60, lng: 90, altitude: 1.6 }
const VOLT = "#e9f01a"

type Arc = { startLat: number; startLng: number; endLat: number; endLng: number; inbound: boolean }
type Country = { id: string; properties: { name: string } }

const ARCS: Arc[] = [
  ...ORIGINS.map((o) => ({ startLat: o.lat, startLng: o.lng, endLat: HUB.lat, endLng: HUB.lng, inbound: true })),
  ...CAPITALS.map((c) => ({ startLat: HUB.lat, startLng: HUB.lng, endLat: c.lat, endLng: c.lng, inbound: false })),
]

// Tells the page-wide power line that its start point (the hub) has moved.
const rebuildPowerLine = () => window.dispatchEvent(new Event("powerline:rebuild"))

// `frameClassName` positions the full (mostly off-screen) globe. Only the part
// of that frame inside the hero is rendered: the canvas covers just the visible
// window and the camera's view offset crops the projection to match.
function ReachGlobe({ frameClassName }: { frameClassName: string }) {
  const stage = React.useRef<HTMLDivElement>(null)
  const frameBox = React.useRef<HTMLDivElement>(null)
  const view = React.useRef<HTMLDivElement>(null)
  const host = React.useRef<HTMLDivElement>(null)
  const hub = React.useRef<HTMLSpanElement>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const el = host.current!
    const marker = hub.current!
    const viewEl = view.current!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const [{ default: Globe }, { MeshPhongMaterial, Color }, { feature }, topology] = await Promise.all([
        import("globe.gl"),
        import("three"),
        import("topojson-client"),
        import("world-atlas/countries-110m.json").then((m) => m.default),
      ])
      if (disposed) return

      const world = topology as unknown as Topology<{ countries: GeometryCollection }>
      const countries = (
        feature(world, world.objects.countries) as unknown as { features: Country[] }
      ).features.filter((c) => !BROKEN_SHAPES.includes(c.id))

      const role = (d: object) => {
        const id = (d as Country).id
        return MARKETS.includes(id) ? "market" : SOURCES.includes(id) ? "source" : null
      }

      const callouts = new Map<Tag, { path: SVGPathElement; label: HTMLSpanElement }>()
      const point = (tag: Tag, dx: number, dy: number) => {
        const c = callouts.get(tag)
        if (!c) return
        c.path.setAttribute("d", `M0 0 L${dx + (tag.end ? 10 : -10)} ${dy} H${dx}`)
        c.label.style.left = `${dx}px`
        c.label.style.top = `${dy}px`
      }

      const globe = new Globe(el, {
        rendererConfig: { antialias: true, alpha: true, powerPreference: "high-performance" },
        animateIn: !reduce,
      })
        .backgroundColor("rgba(0,0,0,0)")
        .globeMaterial(new MeshPhongMaterial({ color: new Color("#0b0e12"), shininess: 0 }))
        .showAtmosphere(true)
        .atmosphereColor("#8b95a1")
        .atmosphereAltitude(0.06)
        .hexPolygonsData(countries)
        // Highlighted countries get a finer grid so small ones (South Korea,
        // Slovakia) read as shapes, not a handful of dots.
        .hexPolygonResolution((d) => (role(d) ? 4 : 3))
        .hexPolygonMargin((d) => (role(d) ? 0.35 : 0.5))
        .hexPolygonAltitude((d) => (role(d) ? 0.006 : 0.001))
        .hexPolygonUseDots(true)
        .hexPolygonColor((d) =>
          role(d) === "market" ? VOLT : role(d) === "source" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.08)"
        )
        .hexPolygonLabel((d) => {
          const r = role(d)
          if (!r) return ""
          return `<div class="globe-label"><span>${r === "market" ? "Market" : "Manufacturing"}</span>${(d as Country).properties.name}</div>`
        })
        .arcsData(ARCS)
        .arcColor((d: object) =>
          (d as Arc).inbound ? ["rgba(255,255,255,0.12)", VOLT] : [VOLT, "rgba(233,240,26,0.25)"]
        )
        .arcAltitudeAutoScale(0.35)
        .arcStroke((d: object) => ((d as Arc).inbound ? 0.42 : 0.26))
        .arcDashLength(reduce ? 1 : 0.55)
        .arcDashGap(reduce ? 0 : 0.9)
        .arcDashInitialGap(() => Math.random() * 1.5)
        .arcDashAnimateTime(reduce ? 0 : 3200)
        .ringsData([HUB, ...ORIGINS])
        .ringColor((d: object) =>
          d === HUB ? (t: number) => `rgba(233,240,26,${1 - t})` : (t: number) => `rgba(255,255,255,${0.8 * (1 - t)})`
        )
        .ringMaxRadius((d: object) => (d === HUB ? 4 : 2.6))
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(reduce ? 0 : 1600)
        .htmlElementsData(TAGS)
        .htmlAltitude(0.01)
        .htmlElement((d: object) => {
          // globe.gl owns the anchor's transform, so the leader and label hang off it.
          const tag = d as Tag
          const node = document.createElement("div")
          node.className = `globe-tag ${tag.kind}`
          const leader = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
          leader.append(path)
          const label = document.createElement("span")
          const markets = TAGS.filter((t) => t.kind === "market")
          if (tag.kind === "market" || tag.kind === "hub") {
            // The hub sits in Romania, so it hangs off the row above instead of taking a number.
            const index = document.createElement("i")
            index.textContent = tag.kind === "hub" ? "↳" : String(markets.indexOf(tag) + 1).padStart(2, "0")
            label.append(index)
          }
          label.append(tag.text)
          if (tag.note) {
            const note = document.createElement("em")
            note.textContent = tag.note
            label.append(note)
          }
          if (tag.end) label.style.translate = "-100% -50%"
          node.append(leader, label)
          callouts.set(tag, { path, label })
          return node
        })
        .pointOfView(HOME_VIEW)

      // Keep the hub marker (the power line's origin) pinned to Bucharest.
      let frame = 0
      const placeHub = () => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          const { x, y } = globe.getScreenCoords(HUB.lat, HUB.lng, 0.005)
          marker.style.left = `${x}px`
          marker.style.top = `${y}px`
          layoutTags(x, y)
          rebuildPowerLine()
        })
      }

      // Lay out every label relative to the hub; called whenever the globe moves.
      const layoutTags = (hx: number, hy: number) => {
        const wide = viewEl.clientWidth >= 640
        const list = wide ? LIST.wide : LIST.narrow
        // Wide spacing is tuned for a 900px globe; tighten it when the globe is smaller.
        const scale = wide ? Math.min(1, frameBox.current!.clientHeight / 900) : 1
        for (const tag of TAGS) {
          if (tag.offset) {
            const [dx, dy] = wide ? tag.offset.wide : tag.offset.narrow
            point(tag, dx * scale, dy * scale)
            continue
          }
          const { x, y } = globe.getScreenCoords(tag.lat, tag.lng, 0.01)
          const row = COLUMN.indexOf(tag) - HUB_ROW
          point(tag, hx + list.x * scale - x, hy + row * Math.max(26, list.gap * scale) - y)
        }
      }

      // Follow the hub for a while (globe intro, camera easing home).
      let tracking = 0
      const trackHub = (ms: number) => {
        const until = performance.now() + ms
        cancelAnimationFrame(tracking)
        const step = () => {
          placeHub()
          if (performance.now() < until) tracking = requestAnimationFrame(step)
        }
        step()
      }

      const controls = globe.controls()
      controls.enableZoom = false
      controls.enablePan = false
      controls.rotateSpeed = 0.6

      // After a drag, ease back to the view that frames the whole route.
      let homing = 0
      const onStart = () => window.clearTimeout(homing)
      const onEnd = () => {
        homing = window.setTimeout(() => {
          globe.pointOfView(HOME_VIEW, reduce ? 0 : 1600)
          trackHub(1800)
        }, 2200)
      }
      controls.addEventListener("start", onStart)
      controls.addEventListener("change", placeHub)
      controls.addEventListener("end", onEnd)

      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

      // Size the canvas to the visible slice of the frame and crop the camera.
      // globe.gl resets the camera aspect on its own (deferred) resize, so the
      // crop is enforced inside the projection update itself.
      const camera = globe.camera() as import("three").PerspectiveCamera
      let crop: { fw: number; fh: number; x: number; y: number; w: number; h: number } | null = null
      const project = camera.updateProjectionMatrix.bind(camera)
      camera.updateProjectionMatrix = () => {
        if (crop) {
          camera.aspect = crop.fw / crop.fh
          camera.view = {
            enabled: true,
            fullWidth: crop.fw,
            fullHeight: crop.fh,
            offsetX: crop.x,
            offsetY: crop.y,
            width: crop.w,
            height: crop.h,
          }
        }
        project()
      }

      const layout = () => {
        const clip = stage.current!.closest("section") ?? stage.current!
        const origin = stage.current!.getBoundingClientRect()
        const c = clip.getBoundingClientRect()
        const f = frameBox.current!.getBoundingClientRect()
        const x0 = Math.max(f.left, c.left, 0)
        const y0 = Math.max(f.top, c.top)
        const x1 = Math.min(f.right, c.right, window.innerWidth)
        const y1 = Math.min(f.bottom, c.bottom)
        const w = Math.max(1, Math.round(x1 - x0))
        const h = Math.max(1, Math.round(y1 - y0))
        Object.assign(viewEl.style, {
          left: `${x0 - origin.left}px`,
          top: `${y0 - origin.top}px`,
          width: `${w}px`,
          height: `${h}px`,
        })
        crop = { fw: f.width, fh: f.height, x: x0 - f.left, y: y0 - f.top, w, h }
        globe.width(w).height(h)
        camera.updateProjectionMatrix()
        placeHub()
      }
      layout()
      const ro = new ResizeObserver(layout)
      ro.observe(stage.current!.closest("section") ?? stage.current!)

      // Stop rendering while the hero is off screen.
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) globe.resumeAnimation()
        else globe.pauseAnimation()
      })
      io.observe(viewEl)

      trackHub(2500)
      setReady(true)
      cleanup = () => {
        cancelAnimationFrame(frame)
        cancelAnimationFrame(tracking)
        window.clearTimeout(homing)
        controls.removeEventListener("start", onStart)
        controls.removeEventListener("change", placeHub)
        controls.removeEventListener("end", onEnd)
        ro.disconnect()
        io.disconnect()
        globe._destructor()
        el.replaceChildren()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div ref={stage} className="absolute inset-0">
      <div ref={frameBox} aria-hidden className={`invisible ${frameClassName}`} />
      <div ref={view} className="absolute">
        <div
          ref={host}
          role="img"
          aria-label="Globe showing our manufacturing sources in China and South Korea, our hub in Bucharest and our markets in Central and Eastern Europe"
          className="pointer-events-none absolute inset-0 cursor-grab active:cursor-grabbing lg:pointer-events-auto"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
        />
        {/* Origin of the page-wide power line; positioned on Bucharest once the globe loads. */}
        <span
          ref={hub}
          data-wire-start
          aria-hidden
          className="pointer-events-none absolute block size-0"
          style={{ left: "34%", top: "40%" }}
        />
      </div>
    </div>
  )
}

export { ReachGlobe }
