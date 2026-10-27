import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import {
  geoBounds,
  geoContains,
  geoOrthographic,
  type ExtendedFeature,
} from "d3-geo"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import world from "world-atlas/countries-110m.json"

type Feature = ExtendedFeature

// Link preview card (Open Graph / Twitter). Echoes the hero: a dotted globe,
// the sourcing route from China and South Korea into Bucharest, and the line
// that carries on down the page.

export const alt = "SwissVolt Distribution: powering Europe's energy transition"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const INK = "#06090c"
const VOLT = "#e9f01a"
const TEXT = "#ecebe4"
const MUTED = "#8d939b"

const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file))

// Same countries as the hero globe (ISO 3166-1 numeric, world-atlas ids).
const MARKETS = ["642", "100", "348", "616", "203", "703"]
const SOURCES = ["156", "410"]

// Orthographic view facing Central Asia, so Europe sits left and Asia right.
const R = 360
const projection = geoOrthographic()
  .rotate([-80, -38])
  .scale(R)
  .translate([905, 360])
  .clipAngle(90)
const [cx, cy] = projection.translate()

type Dot = { x: number; y: number; r: number; color: string; opacity: number }

// Dot-matrix globe: a screen-space grid sampled against real country shapes.
function globe(countries: Feature[]) {
  const boxes = countries.map((c) => ({ c, b: geoBounds(c) }))
  const inBox = (
    [lng, lat]: [number, number],
    [[w, s], [e, n]]: [[number, number], [number, number]]
  ) =>
    lat >= s &&
    lat <= n &&
    (w <= e ? lng >= w && lng <= e : lng >= w || lng <= e)
  const out: Dot[] = []
  const step = 11
  for (let y = cy - R; y <= cy + R; y += step) {
    for (let x = cx - R; x <= cx + R; x += step) {
      const d = Math.hypot(x - cx, y - cy) / R
      if (d > 0.995) continue
      const p = projection.invert!([x, y]) as [number, number]
      const hit = boxes.find(({ c, b }) => inBox(p, b) && geoContains(c, p))?.c
      if (!hit) continue
      const depth = Math.sqrt(1 - d * d)
      const id = String(hit.id)
      const role = MARKETS.includes(id)
        ? VOLT
        : SOURCES.includes(id)
          ? TEXT
          : null
      out.push({
        x,
        y,
        r: 1 + depth * 1.4,
        color: role ?? "#ffffff",
        opacity: role ? 0.6 + depth * 0.4 : 0.07 + depth * 0.13,
      })
    }
  }
  return out
}

const at = (lng: number, lat: number) => {
  const [x, y] = projection([lng, lat])!
  return { x: Math.round(x), y: Math.round(y) }
}
const HUB = at(26.1, 44.43)
const SHANGHAI = at(121.47, 31.23)
const BUSAN = at(129.08, 35.18)
const CHINA = at(103, 34)

function Bolt({ height, color }: { height: number; color: string }) {
  return (
    <svg
      width={(height * 290) / 490}
      height={height}
      viewBox="110 10 290 490"
      fill="none"
    >
      <path
        d="M205 280 H124 L230 20 H386 L268 208 M248 232 H336 L130 486 L190 302"
        stroke={color}
        strokeWidth="22"
        strokeLinecap="square"
      />
    </svg>
  )
}

export default async function Image() {
  const [bold, heavy, mono] = await Promise.all([
    font("archivo-latin-700-normal.woff"),
    font("archivo-latin-800-normal.woff"),
    font("jetbrains-mono-latin-500-normal.woff"),
  ])
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>
  const countries = (
    feature(topo, topo.objects.countries) as unknown as { features: Feature[] }
  ).features
  const dots = globe(countries)
  const wireY = 392

  const tags = [
    { x: CHINA.x - 20, y: CHINA.y + 34, text: "CHINA" },
    { x: BUSAN.x - 128, y: BUSAN.y - 168, text: "SOUTH KOREA" },
    { x: HUB.x + 18, y: HUB.y - 44, text: "BUCHAREST HUB", color: VOLT },
  ]

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        background: INK,
        color: TEXT,
        fontFamily: "Archivo",
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" stopColor={VOLT} stopOpacity="0.6" />
            <stop offset="100%" stopColor={VOLT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sphere" cx="0.5" cy="0.5" r="0.5">
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.025" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="url(#sphere)" />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.color}
            fillOpacity={d.opacity}
          />
        ))}
        <path
          d={`M${SHANGHAI.x} ${SHANGHAI.y} Q ${(SHANGHAI.x + HUB.x) / 2} ${Math.min(SHANGHAI.y, HUB.y) - 120} ${HUB.x} ${HUB.y}`}
          stroke={VOLT}
          strokeOpacity="0.85"
          strokeWidth="2"
          fill="none"
        />
        <path
          d={`M${BUSAN.x} ${BUSAN.y} Q ${(BUSAN.x + HUB.x) / 2} ${Math.min(BUSAN.y, HUB.y) - 170} ${HUB.x} ${HUB.y}`}
          stroke={VOLT}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          fill="none"
        />
        {/* The power line leaves the hub and runs on into the copy, as on the site. */}
        <path
          d={`M${HUB.x} ${HUB.y} V${wireY} H72`}
          stroke={VOLT}
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="72" cy={wireY} r="4" fill={VOLT} />
        <circle cx={HUB.x} cy={HUB.y} r="52" fill="url(#glow)" />
        <circle cx={HUB.x} cy={HUB.y} r="6" fill="#ffffff" />
        <circle cx={SHANGHAI.x} cy={SHANGHAI.y} r="4.5" fill="#ffffff" />
        <circle cx={BUSAN.x} cy={BUSAN.y} r="4.5" fill="#ffffff" />
        <path
          d={`M${BUSAN.x} ${BUSAN.y} V${BUSAN.y - 136}`}
          stroke="#ffffff"
          strokeOpacity="0.45"
        />
      </svg>

      {tags.map((t) => (
        <div
          key={t.text}
          style={{
            position: "absolute",
            left: t.x,
            top: t.y,
            display: "flex",
            padding: "6px 10px",
            borderRadius: 4,
            background: "rgba(6, 9, 12, 0.88)",
            color: t.color ?? TEXT,
            fontFamily: "JetBrains Mono",
            fontSize: 15,
            letterSpacing: 2,
          }}
        >
          {t.text}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: -1,
          }}
        >
          <span>swissvolt</span>
          <span>distribution</span>
        </div>
        <Bolt height={54} color={VOLT} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          top: wireY + 26,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -2.5,
          }}
        >
          <span>Powering Europe’s</span>
          <div style={{ display: "flex" }}>
            <span>energy</span>
            <span style={{ color: VOLT, marginLeft: 20 }}>transition.</span>
          </div>
        </div>
        <span
          style={{
            marginTop: 22,
            fontFamily: "JetBrains Mono",
            fontSize: 16,
            letterSpacing: 1.5,
            color: MUTED,
          }}
        >
          ASIAN MANUFACTURING · DISTRIBUTED ACROSS CENTRAL & EASTERN EUROPE
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Archivo", data: bold, weight: 700, style: "normal" },
        { name: "Archivo", data: heavy, weight: 800, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
      ],
    }
  )
}
