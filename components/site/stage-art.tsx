// Line-art scenes the power line runs through. Each scene is cropped from one
// shared coordinate space; `wire` is the y where the conductor crosses it.
//
// Shapes are drawn on scroll in document order (see Reveals), so each scene
// lists ground and structure first and the `fine` detail after it.

const GROUND = 760

type ArtProps = { label: string }

function Art({
  box,
  wire,
  ground,
  label,
  children,
}: {
  box: [number, number, number, number]
  wire: number
  ground?: [number, number]
} & ArtProps & { children: React.ReactNode }) {
  const [x, y, w, h] = box
  const [g0, g1] = ground ?? [x, x + w]
  return (
    <figure>
      <svg
        data-wire-stop
        data-wire={(wire - y) / h}
        viewBox={box.join(" ")}
        style={{ aspectRatio: `${w} / ${h}` }}
        className="block h-auto w-full overflow-visible"
        aria-hidden
      >
        <g className="stage" data-build>
          <path d={`M${g0} ${GROUND} H${g1}`} opacity="0.7" />
          {children}
        </g>
      </svg>
      <figcaption className="mt-4 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </figcaption>
    </figure>
  )
}

function waves(y: number, from: number, to: number) {
  let d = `M${from} ${y}`
  for (let x = from; x < to; x += 60) d += " q15 -9 30 0 t30 0"
  return d
}

// Evenly spaced lines inside a box, vertical by default.
function hatch(x: number, y: number, w: number, h: number, step: number, horizontal = false) {
  let d = ""
  if (horizontal) for (let v = y + step; v < y + h - 1; v += step) d += `M${x} ${v} H${x + w} `
  else for (let v = x + step; v < x + w - 1; v += step) d += `M${v} ${y} V${y + h} `
  return d
}

// Diagonal web between two parallel horizontal chords.
function truss(x0: number, x1: number, top: number, bottom: number, step: number) {
  let d = `M${x0} ${bottom}`
  for (let x = x0, up = true; x < x1; x += step, up = !up) d += ` L${Math.min(x + step, x1)} ${up ? top : bottom}`
  return d
}

// A strip of solar modules lying along a roof slope through (ax, ay)-(bx, by).
function roofPanels(ax: number, ay: number, bx: number, by: number, from: number, count: number, size: number, gap: number) {
  const slope = (by - ay) / (bx - ax)
  const at = (x: number) => ay + (x - ax) * slope
  return Array.from({ length: count }, (_, i) => {
    const x0 = from + i * (size + gap)
    const x1 = x0 + size
    return `M${x0} ${at(x0) - 3} L${x1} ${at(x1) - 3} V${at(x1) - 11} L${x0} ${at(x0) - 11} Z`
  })
}

function Container({ x, y, w = 56, h = 34, lit }: { x: number; y: number; w?: number; h?: number; lit?: boolean }) {
  return (
    <>
      <rect className={lit ? "panel-fill" : undefined} x={x} y={y} width={w} height={h} />
      <path className="fine" d={hatch(x, y + 4, w, h - 8, w / 4)} />
    </>
  )
}

function Wheel({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} />
      <circle className="fine" cx={x} cy={y} r={r * 0.35} />
    </>
  )
}

// Aviation and status lights: dark until the scene is powered, then they blink.
function Beacon({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return <circle className="beacon" cx={x} cy={y} r="3.5" style={{ animationDelay: `${delay}s` }} />
}

function Paving({ from, to }: { from: number; to: number }) {
  let d = ""
  for (let x = from; x < to - 20; x += 46) d += `M${x} 772 h22 `
  return <path className="fine" d={d} opacity="0.5" />
}

function FactoryArt(props: ArtProps) {
  const bays = [300, 380, 460, 540, 620, 700]
  const windows = [330, 400, 470, 610, 680]
  return (
    <Art box={[260, 440, 600, 340]} wire={640} {...props}>
      <path d="M300 760 V560 L380 500 V560 L460 500 V560 L540 500 V560 L620 500 V560 L700 500 V560 L780 500 V760" />
      <path d="M316 548 V462 H336 V533" />
      {bays.map((x) => (
        <path key={x} className="panel-fill" d={`M${x + 8} 552 L${x + 72} 506 V520 L${x + 8} 560 Z`} />
      ))}
      {windows.map((x) => (
        <rect key={x} x={x} y="590" width="44" height="28" />
      ))}
      <rect x="520" y="690" width="70" height="70" />
      <path d="M506 682 H604 L596 674 H514 Z" />
      <rect x="462" y="712" width="26" height="48" />

      <path d="M636 760 V752 H746 V760" />
      <rect className="panel-fill" x="640" y="716" width="102" height="36" />
      <rect className="panel-fill" x="652" y="684" width="72" height="32" />

      <path d="M800 756 V672 M808 756 V672 M800 690 H808" />
      <path d="M800 748 H784 V744 H800" />
      <path d="M812 740 V722 H838 L846 714 V740 Z" />
      <path d="M816 722 V692 H840 V714" />
      <Wheel x={822} y={750} r={10} />
      <Wheel x={846} y={752} r={8} />

      <g className="fine">
        <path d="M316 476 H336 M316 490 H336" />
        {bays.map((x) => (
          <path
            key={x}
            d={[0.25, 0.5, 0.75].map((t) => `M${x + 8 + 64 * t} ${552 - 46 * t} V${560 - 40 * t}`).join(" ")}
          />
        ))}
        <path d="M300 566 H780" />
        {windows.map((x) => (
          <path key={x} d={`M${x + 22} 590 V618 M${x} 604 H${x + 44} M${x - 3} 622 H${x + 47}`} />
        ))}
        <path d={hatch(520, 690, 70, 70, 9, true)} />
        <path d="M482 736 h-4 M300 744 H462 M488 744 H520 M590 744 H636 M772 566 V760" />
        <rect x="330" y="650" width="110" height="22" />
        <path d="M352 655 L346 662 H352 L348 668 M366 661 H424" />
        <path d="M640 734 H742 M674 716 V752 M708 716 V752 M670 760 V752 M706 760 V752" />
        <path d="M652 700 H724 M688 684 V716" />
        <path d="M824 722 V710 H834 M846 724 H852 V740 H846" />
        <path d="M816 692 L840 714" />
      </g>
      <Paving from={270} to={860} />

      <g className="smoke">
        <circle cx="326" cy="452" r="6" />
        <circle cx="332" cy="452" r="8" />
        <circle cx="322" cy="452" r="7" />
      </g>
      <Beacon x={326} y={458} />
    </Art>
  )
}

function TransitArt(props: ArtProps) {
  const boomTruss = truss(980, 1296, 446, 460, 22)
  return (
    <Art box={[960, 400, 1160, 420]} wire={680} ground={[960, 1300]} {...props}>
      <defs>
        <clipPath id="sea-clip">
          <rect x="1300" y="760" width="820" height="60" />
        </clipPath>
      </defs>
      <path d="M1300 760 V800" />

      <path d="M1004 760 V604 H1016 V760 M1104 760 V604 H1116 V760" />
      <rect x="996" y="590" width="128" height="14" />
      <path d="M1010 590 L1050 412 L1110 590" />
      <path d="M978 446 H1300 V460 H978 Z" />
      <path d="M1050 412 L1300 446 M1050 412 L1190 446 M1050 412 L980 446" />
      <rect className="panel-fill" x="984" y="460" width="52" height="24" />
      <rect x="1226" y="460" width="30" height="10" />
      <path d="M1234 470 V556 M1248 470 V556 M1216 556 H1266" />
      <Container x={1212} y={560} w={58} h={30} lit />

      <path d="M1320 680 H2080 L2030 780 H1380 Z" />
      <path d="M1360 712 H2050" />
      {[0, 1, 2].map((row) =>
        Array.from({ length: [8, 7, 5][row] }, (_, i) => (
          <Container
            key={`${row}-${i}`}
            x={1400 + (i + (row === 2 ? 1 : 0)) * 62}
            y={[642, 606, 570][row]}
            lit={(i + row) % 3 === 0}
          />
        ))
      )}
      <rect x="1930" y="548" width="90" height="132" />
      <rect className="panel-fill" x="1936" y="556" width="78" height="14" />
      <path d="M1912 548 H2038 M1975 548 V502 M1956 514 H1994" />
      <path d="M2030 680 V606 L2036 592 H2062 L2066 606 V680" />
      <rect className="panel-fill" x="2031" y="612" width="34" height="10" />
      <path d="M1898 636 H1928 L1922 648 H1904 Z M1906 636 V624 H1928" />

      <Container x={1140} y={726} w={60} h={34} />
      <Container x={1206} y={726} w={60} h={34} lit />
      <Container x={1172} y={692} w={60} h={34} />

      <g className="fine">
        <path d={boomTruss} />
        <path d="M1016 604 L1104 680 M1104 604 L1016 680 M1016 680 H1104" />
        <path d="M1024 590 L1050 450 L1098 590 M1030 520 H1074" />
        <path d="M984 472 H1036 M1240 470 h-8" />
        <circle cx="1002" cy="756" r="4" />
        <circle cx="1018" cy="756" r="4" />
        <circle cx="1102" cy="756" r="4" />
        <circle cx="1118" cy="756" r="4" />
        <path d="M1150 760 V750 H1160 V760 M1276 760 V750 H1286 V760" />
        <path d="M1281 752 Q1300 764 1340 690" />
        <path d="M1370 762 H2040 M1340 680 V648 M1330 660 H1350" />
        <circle cx="1356" cy="698" r="5" />
        <path d={hatch(1936, 556, 78, 14, 13)} />
        <path d="M1930 600 H2020 M1930 640 H2020" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={1950 + i * 17} cy="620" r="3" />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={1960 + i * 20} cy="698" r="3" />
        ))}
        <path d="M1962 520 H1988 M1975 520 V514" />
        <path d="M2036 592 V586 H2062 V592" />
        <path d={hatch(1324, 672, 60, 8, 10)} />
        <path d={hatch(2024, 672, 52, 8, 10)} />
        <path d="M1480 486 q6 -6 12 0 q6 -6 12 0 M1530 462 q5 -5 10 0 q5 -5 10 0 M1640 500 q6 -6 12 0 q6 -6 12 0" />
      </g>

      <g clipPath="url(#sea-clip)">
        <path className="sea" d={waves(778, 1300, 2180)} />
        <path className="sea sea-slow" d={waves(806, 1300, 2180)} opacity="0.5" />
      </g>
      <Paving from={970} to={1300} />
      <Beacon x={1050} y={406} />
      <Beacon x={1975} y={496} delay={0.8} />
    </Art>
  )
}

function HubArt(props: ArtProps) {
  const docks = [2540, 2660, 2780, 3040, 3160]
  const roofY = (x: number) => (x < 2920 ? 560 - (x - 2480) * (90 / 440) : 470 + (x - 2920) * (90 / 440))
  return (
    <Art box={[2440, 440, 1180, 340]} wire={620} {...props}>
      <path d="M2480 760 V560 L2920 470 L3360 560 V760" />
      <path d="M2480 584 L2920 494 L3360 584" />
      {[
        ...roofPanels(2480, roofY(2480), 2920, roofY(2920), 2540, 5, 54, 8),
        ...roofPanels(2920, roofY(2920), 3360, roofY(3360), 3000, 5, 54, 8),
      ].map((d) => (
        <path key={d} className="panel-fill" d={d} />
      ))}
      <rect className="panel-fill" x="2830" y="520" width="180" height="36" />
      {docks.map((x) => (
        <g key={x}>
          <path d={`M${x - 6} 760 V670 H${x + 96} V760`} />
          <rect x={x} y="676" width="90" height="84" />
        </g>
      ))}
      <path d="M2884 668 H3036" />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="panel-fill" x={2900 + i * 44} y="716" width="38" height="38" />
      ))}
      <rect x="2922" y="676" width="38" height="38" />

      <rect x="3390" y="682" width="130" height="58" />
      <path d="M3520 700 H3552 L3572 722 V740 H3520" />
      <Wheel x={3420} y={748} r={12} />
      <Wheel x={3492} y={748} r={12} />
      <Wheel x={3548} y={748} r={12} />
      <path d="M3376 760 V640 H3392" />

      <g className="fine">
        <path d={hatch(2830, 520, 180, 36, 7, true)} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={2530 + i * 72} y="594" width="50" height="12" />
        ))}
        {docks.map((x) => (
          <g key={x}>
            <path d={hatch(x, 676, 90, 84, 9, true)} />
            <path d={`M${x + 2} 744 v14 h8 v-14 Z M${x + 80} 744 v14 h8 v-14 Z`} />
            <circle cx={x + 45} cy="660" r="3" />
          </g>
        ))}
        <path d="M2941 676 V714 M2922 735 H3020" />
        <path d="M2490 584 V760 M3350 584 V760" />
        <path d={hatch(3390, 682, 130, 58, 16)} />
        <path d="M3390 740 H3520 M3410 740 V754 M3540 704 H3550 L3564 720 H3540 Z M3554 700 V692 M3524 700 V680 M3566 740 H3576" />
        <path d="M3384 640 v6 h-8" />
        <path d="M2640 760 V748 M2770 760 V748 M3150 760 V748" />
      </g>
      <Paving from={2450} to={3610} />
      <Beacon x={3390} y={648} />
    </Art>
  )
}

function Pylon({ x }: { x: number }) {
  const top = 380
  const rungs = [470, 560, 650]
  const half = (y: number) => 12 + ((y - top) / (GROUND - top)) * 43
  const insulators = [
    [x - 70, top + 20],
    [x + 70, top + 20],
    [x - 55, top + 60],
    [x + 55, top + 60],
  ]
  return (
    <g>
      <path d={`M${x - 55} ${GROUND} L${x - 12} ${top + 10} M${x + 55} ${GROUND} L${x + 12} ${top + 10}`} />
      <path d={`M${x - 75} ${top + 20} H${x + 75} M${x - 60} ${top + 60} H${x + 60}`} />
      <path d={`M${x - 12} ${top + 10} L${x} ${top - 20} L${x + 12} ${top + 10}`} />
      {rungs.map((y, i) => {
        const next = rungs[i + 1] ?? GROUND
        return (
          <path
            key={y}
            d={`M${x - half(y)} ${y} H${x + half(y)} M${x - half(y)} ${y} L${x + half(next)} ${next} M${x + half(y)} ${y} L${x - half(next)} ${next}`}
          />
        )
      })}
      {insulators.map(([ix, iy]) => (
        <path key={ix} d={`M${ix} ${iy} v22`} />
      ))}
      <g className="fine">
        <path
          d={`M${x - 75} ${top + 20} L${x - 13} ${top + 40} M${x + 75} ${top + 20} L${x + 13} ${top + 40} M${x - 60} ${top + 60} L${x - 21} ${top + 82} M${x + 60} ${top + 60} L${x + 21} ${top + 82}`}
        />
        <path
          d={`M${x - 50} ${top + 20} L${x - 38} ${top + 27} L${x - 26} ${top + 20} M${x + 50} ${top + 20} L${x + 38} ${top + 27} L${x + 26} ${top + 20}`}
        />
        <path
          d={insulators.map(([ix, iy]) => [6, 11, 16].map((d) => `M${ix - 4} ${iy + d} h8`).join(" ")).join(" ")}
        />
        <path d={`M${x - 12} ${top + 10} L${x + 6} ${top - 8} M${x + 12} ${top + 10} L${x - 6} ${top - 8}`} />
        <path d={`M${x - 63} ${GROUND} v-6 h16 v6 M${x + 47} ${GROUND} v-6 h16 v6`} />
      </g>
      <Beacon x={x} y={top - 26} delay={(x % 7) * 0.2} />
    </g>
  )
}

function GridArt(props: ArtProps) {
  return (
    <Art box={[3560, 330, 1340, 450]} wire={400} {...props}>
      {[3700, 4050, 4400].map((x) => (
        <Pylon key={x} x={x} />
      ))}
      <path d="M3560 436 Q3600 430 3630 422 Q3805 480 3980 422 Q4155 480 4330 422" />
      <path d="M3560 410 Q3680 452 3770 422 Q3945 480 4120 422 Q4295 480 4470 422" />
      <path d="M4470 422 Q4540 460 4560 560" />

      <path d="M4500 760 V700 H4840 V760" />
      <path d="M4560 760 V560 H4820 V760" />
      <rect className="panel-fill" x="4600" y="600" width="90" height="100" />
      <rect x="4720" y="620" width="80" height="80" />
      <path d="M4620 600 V568 M4645 600 V568 M4670 600 V568 M4740 620 V568 M4780 620 V568" />
      <rect x="4580" y="618" width="20" height="70" />
      <path d="M4612 600 V588 H4652 V600" />
      <path d="M4510 760 V520" />
      <rect x="4848" y="712" width="44" height="48" />

      <g className="fine">
        <path d="M3560 474 Q3600 470 3645 462 Q3820 515 3995 462 Q4170 515 4345 462" />
        <path d="M3560 452 Q3680 492 3755 462 Q3930 515 4105 462 Q4280 515 4455 462" />
        <path d="M3560 372 Q3630 384 3700 360 Q3875 392 4050 360 Q4225 392 4400 360" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${4520 + i * 28} 760 V700`} opacity="0.6" />
        ))}
        <path d={Array.from({ length: 24 }, (_, i) => `M${4500 + i * 14} 700 l7 -6 l7 6`).join(" ")} />
        <path d={truss(4560, 4820, 560, 574, 20)} />
        <path d={Array.from({ length: 9 }, (_, i) => `M4560 ${594 + i * 20} h-8 M4820 ${594 + i * 20} h8`).join(" ")} />
        <path d={hatch(4580, 618, 20, 70, 4)} />
        <path
          d={[4620, 4645, 4670, 4740, 4780].map((x) => `M${x - 4} 576 h8 M${x - 4} 584 h8 M${x - 4} 592 h8`).join(" ")}
        />
        <path d="M4720 660 H4800 M4760 620 V700 M4752 640 v8 M4768 640 v8" />
        <path d="M4600 650 H4690 M4610 700 V714 M4680 700 V714" />
        <path d="M4510 520 l-4 12 h8 Z" />
        <path d="M4530 720 l8 14 h-16 Z" />
        <path d="M4844 712 L4870 700 L4896 712 M4856 730 h10 v12 h-10 Z" />
        <path d="M3860 760 l4 -8 l4 8 M3880 760 l3 -6 l3 6 M4210 760 l4 -8 l4 8 M4234 760 l3 -6 l3 6" />
      </g>
    </Art>
  )
}

function ConsumerArt(props: ArtProps) {
  const houseL = roofPanels(5620, 600, 5760, 560, 5636, 3, 34, 6)
  const houseR = roofPanels(5760, 560, 5900, 600, 5774, 3, 34, 6)
  return (
    <Art box={[4880, 380, 1300, 400]} wire={640} {...props}>
      <rect x="4920" y="420" width="240" height="340" />
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (
          <rect key={`${r}-${c}`} x={4944 + c * 54} y={446 + r * 48} width="30" height="24" opacity="0.7" />
        ))
      )}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} className="panel-fill" d={`M${4934 + i * 56} 416 L${4974 + i * 56} 400 V408 L${4934 + i * 56} 420 Z`} />
      ))}
      <path d="M4990 722 H5090" />
      <rect x="5010" y="724" width="60" height="36" />

      <rect x="5220" y="560" width="340" height="200" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} className="panel-fill" d={`M${5234 + i * 64} 556 L${5286 + i * 64} 536 V546 L${5234 + i * 64} 560 Z`} />
      ))}
      <rect x="5260" y="680" width="120" height="80" />
      <path d="M5420 600 H5530 V650 H5420 Z" />
      <rect x="5420" y="676" width="110" height="44" />

      <rect x="5578" y="712" width="16" height="48" />

      <path d="M5620 760 V600 L5760 560 L5900 600 V760" />
      {[...houseL, ...houseR].map((d) => (
        <path key={d} className="panel-fill" d={d} />
      ))}
      <rect x="5700" y="680" width="120" height="80" />
      <rect x="5640" y="664" width="40" height="26" />
      <rect x="5840" y="664" width="40" height="26" />

      <rect className="panel-fill" x="5960" y="680" width="180" height="80" />
      <path d="M5990 680 V760 M6020 680 V760 M6050 680 V760 M6080 680 V760 M6110 680 V760" opacity="0.6" />
      <text x="5960" y="664">BESS</text>
      <rect x="5916" y="700" width="22" height="60" />

      <path d="M5190 760 V652 Q5190 642 5204 642" />
      <path d="M6162 760 V734" />
      <circle cx="6162" cy="716" r="16" />

      <g className="fine">
        <path d="M4914 420 H5166 M5150 400 V384" />
        <path
          d={Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => `M${4959 + c * 54} ${446 + r * 48} v24`).join(" ")
          ).join(" ")}
        />
        <path d={Array.from({ length: 6 }, (_, r) => `M4920 ${482 + r * 48} H5160`).join(" ")} opacity="0.5" />
        <path d={[0, 1, 2, 3].map((i) => `M${4940 + i * 56} 420 V414 M${4966 + i * 56} 420 V404`).join(" ")} />
        <path d="M5040 724 V760 M5010 736 H5070" />
        <path d={[0, 1, 2, 3, 4].map((i) => `M${5244 + i * 64} 560 V552 M${5276 + i * 64} 560 V540`).join(" ")} />
        <path d="M5300 680 V760 M5340 680 V760 M5260 700 H5380" />
        <path d="M5478 608 L5462 628 H5476 L5468 644 L5490 620 H5476 Z" />
        <path d="M5456 676 V720 M5493 676 V720 M5214 560 H5566" />
        <path d="M5582 720 H5590 M5586 730 V738 M5594 724 Q5612 730 5604 760" />
        <path d={hatch(5700, 680, 120, 80, 10, true)} />
        <path d="M5660 664 V690 M5860 664 V690" />
        <rect x="5636" y="704" width="22" height="30" />
        <path d="M5647 712 l-3 6 h6 l-3 6" />
        <path d="M5954 680 H6146" />
        <path d={hatch(6118, 700, 16, 20, 5, true)} />
        <circle cx="5927" cy="718" r="7" />
        <path d="M5920 740 H5934 M5920 748 H5934" />
        <path d="M5200 642 h8 v4 h-8" />
        <path d="M5240 772 H6040" strokeDasharray="6 8" opacity="0.6" />
        <path d="M6152 708 l10 8 l10 -8 M6162 716 V730" />
      </g>
      <Beacon x={6128} y={690} />
      <Beacon x={5586} y={724} delay={0.5} />
    </Art>
  )
}

export { ConsumerArt, FactoryArt, GridArt, HubArt, TransitArt }
