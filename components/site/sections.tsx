import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/site/logo"
import {
  ConsumerArt,
  FactoryArt,
  GridArt,
  HubArt,
  TransitArt,
} from "@/components/site/stage-art"

const CTA_LABEL = "Become a partner"

const CONTACT = {
  email: "contact@swissvolt-distribution.com",
  phone: "+40 762 602 622",
  phoneHref: "tel:+40762602622",
  instagram: "https://www.instagram.com/valentin.burada",
}

// A section the power line passes through. "split" puts copy beside the scene;
// "wide" stacks copy over a full-width scene that the line enters from the edge.
function StageSection({
  id,
  title,
  art,
  layout,
  children,
}: {
  id?: string
  title: React.ReactNode
  art: React.ReactNode
  layout: "split-left" | "split-right" | "wide"
  children: React.ReactNode
}) {
  const copy = (
    <div
      className={cn(
        layout === "wide" ? "max-w-2xl" : "max-w-xl",
        layout === "split-left" && "lg:order-2"
      )}
    >
      <h2
        data-reveal
        className="font-wide text-3xl leading-[1.04] font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
      >
        {title}
      </h2>
      <div
        data-reveal
        className="mt-6 space-y-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
      >
        {children}
      </div>
    </div>
  )

  return (
    <section id={id} className="scroll-mt-20 px-8 py-28 sm:px-10 lg:py-44">
      {layout === "wide" ? (
        <>
          {copy}
          <div className="mt-16 lg:mt-24">{art}</div>
        </>
      ) : (
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {copy}
          {art}
        </div>
      )}
    </section>
  )
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 pt-2 text-base text-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-volt" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function About() {
  return (
    <StageSection
      id="about"
      layout="split-right"
      title="Direct partnerships with manufacturers in China and South Korea."
      art={<FactoryArt label="Manufacturing, China and South Korea" />}
    >
      <p>
        SwissVolt Distribution is a European import and distribution company
        specialising in renewable energy infrastructure for business-to-business
        clients.
      </p>
      <p>
        We work directly with manufacturers in China and South Korea, giving
        them reliable, scalable and long-term access to European markets. Our
        clients include EPC contractors, developers, industrial companies,
        logistics parks, real estate projects and institutional partners.
      </p>
    </StageSection>
  )
}

function MarketEntry() {
  return (
    <StageSection
      id="model"
      layout="wide"
      title="A structured route into Europe."
      art={<TransitArt label="Sea freight, Asia to the EU" />}
    >
      <p>
        We manage the import from our manufacturing partners end to end:
        logistics, customs clearance and documentation, on transparent
        commercial frameworks.
      </p>
      <Points
        items={[
          "Direct import and volume-based sourcing",
          "Product validation and technical alignment with EU standards",
        ]}
      />
    </StageSection>
  )
}

function Hub() {
  return (
    <StageSection
      layout="split-left"
      title="Bucharest, our hub for Central and Eastern Europe."
      art={<HubArt label="Warehousing and logistics, Bucharest" />}
    >
      <p>
        Our Bucharest headquarters is our corporate base, operational
        coordination centre and logistics hub, with direct access to European
        logistics corridors.
      </p>
      <p>
        Secure, organised warehousing with inventory management keeps stock
        ready to dispatch across the region.
      </p>
    </StageSection>
  )
}

// TODO(content): SwissVolt to confirm these figures before launch.
function Statement() {
  return (
    <section className="px-8 py-28 sm:px-10 lg:py-36">
      <p
        data-reveal
        className="font-wide max-w-6xl text-[clamp(1.75rem,4.2vw,4rem)] leading-[1.08] font-medium tracking-[-0.025em] text-balance"
      >
        In 2023 renewables generated{" "}
        <span className="text-volt tabular-nums">
          <span data-count="44">44</span>%
        </span>{" "}
        of the EU&rsquo;s electricity, and Europe added{" "}
        <span className="text-volt tabular-nums">
          <span data-count="56">56</span>&nbsp;GW
        </span>{" "}
        of new solar. The binding target for 2030 is{" "}
        <span className="text-volt tabular-nums">
          <span data-count="42.5">42.5</span>%
        </span>
        .
      </p>
      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Sources: Ember, European Electricity Review 2024. SolarPower Europe, EU
        Market Outlook for Solar Power 2023-2027. Directive (EU) 2023/2413 (RED
        III).
      </p>
    </section>
  )
}

function Network() {
  return (
    <StageSection
      layout="wide"
      title="One partner, many markets."
      art={<GridArt label="Regional distribution network" />}
    >
      <p>
        Our regional approach lets manufacturers reach multiple markets through
        a single distribution partner, with local expertise in compliance,
        market entry and sales channels.
      </p>
      <Points
        items={[
          "Romania, Bulgaria, Hungary, Poland, Czech Republic and Slovakia",
          "The wider Balkan and Central and Eastern European region",
        ]}
      />
    </StageSection>
  )
}

const PILLARS = [
  "Strategic location",
  "CEE market expertise",
  "Scalable distribution model",
  "Partnership-oriented",
  "Infrastructure, not retail",
]

function Role() {
  return (
    <section className="px-8 py-28 sm:px-10 lg:py-40">
      <h2
        data-reveal
        className="font-wide max-w-5xl text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance"
      >
        Not a reseller. A strategic{" "}
        <span className="text-volt">distribution partner.</span>
      </h2>
      <p
        data-reveal
        className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        We combine Asian manufacturing efficiency with European operational
        discipline, and build long-term distribution partnerships rather than
        one-off sales.
      </p>
      <ul data-reveal className="mt-12 flex max-w-5xl flex-wrap gap-3">
        {PILLARS.map((p) => (
          <li
            key={p}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-foreground"
          >
            {p}
          </li>
        ))}
      </ul>
    </section>
  )
}

const SOLUTIONS = [
  { name: "Photovoltaic solar panels", detail: "Commercial and utility-scale" },
  {
    name: "Energy storage systems (BESS)",
    detail: "Lithium-based battery storage",
  },
  {
    name: "EV charging infrastructure",
    detail: "Charging stations and smart mobility",
  },
  {
    name: "Hybrid and off-grid systems",
    detail: "Industrial and remote power",
  },
  { name: "Technical consulting", detail: "Project-based energy solutions" },
]

function Solutions() {
  return (
    <StageSection
      id="solutions"
      layout="split-right"
      title={
        <>
          Solar panels, energy storage{" "}
          <span className="text-muted-foreground">and more,</span> delivered to
          B2B partners.
        </>
      }
      art={<ConsumerArt label="Commercial and industrial sites" />}
    >
      <p>
        We focus exclusively on the import, distribution and commercial
        deployment of energy technologies.
      </p>
      <ul className="divide-y divide-line pt-2">
        {SOLUTIONS.map((s) => (
          <li
            key={s.name}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
          >
            <span className="text-lg font-medium tracking-tight text-foreground">
              {s.name}
            </span>
            <span className="text-sm text-muted-foreground">{s.detail}</span>
          </li>
        ))}
      </ul>
    </StageSection>
  )
}

function Team() {
  return (
    <section
      id="team"
      data-wire-glow
      className="team-glow scroll-mt-20 px-8 pt-24 sm:px-10 lg:pt-32"
    >
      <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div
            aria-hidden
            className="portrait-arch absolute inset-x-6 bottom-0 h-2/3 rounded-t-full bg-white/[0.035]"
          />
          <Image
            src="/images/valentin-burada.webp"
            alt="Portrait of Valentin Burada, founder of SwissVolt Distribution"
            width={576}
            height={640}
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="portrait-fade relative h-auto w-full"
          />
        </div>
        <div className="pb-24 lg:pb-32">
          <h2
            data-reveal
            className="font-wide text-3xl leading-[1.04] font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
          >
            Meet the founder.
          </h2>
          <p
            data-reveal
            className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            The person behind the brand, and the drive behind what we do.
          </p>
          {/* The power line runs along this rule (right to left) and lights the section. */}
          <div
            data-wire-stop
            data-wire="0"
            data-wire-enter="end"
            className="mt-12 h-px bg-line"
          />
          <div data-reveal className="pt-6">
            <p className="font-wide text-2xl font-semibold tracking-tight sm:text-3xl">
              Valentin Burada
            </p>
            <p className="team-role mt-1 text-muted-foreground">Founder</p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-foreground underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-volt"
            >
              {CONTACT.email}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 px-8 py-28 sm:px-10 sm:py-40">
      <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-24">
        <h2
          data-reveal
          className="font-wide text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-balance"
        >
          Become a distribution <span className="text-volt">partner.</span>
        </h2>
        <div className="flex flex-col items-start gap-7">
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
            Partner with us to expand your offering, strengthen client
            relationships and create new revenue streams.
          </p>
          <a
            data-wire-end
            href={`mailto:${CONTACT.email}`}
            className="cta-power group inline-flex items-center gap-3 rounded-full border px-7 py-4 text-sm font-semibold"
          >
            {CTA_LABEL}
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:rotate-45"
            />
          </a>
          <dl className="grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors duration-300 hover:text-volt"
                >
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="mt-1">
                <a
                  href={CONTACT.phoneHref}
                  className="transition-colors duration-300 hover:text-volt"
                >
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="px-8 text-sm text-muted-foreground sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Logo className="text-[15px] text-foreground" />
          <span>
            © {new Date().getFullYear()} SwissVolt Distribution. Bucharest,
            Romania
          </span>
        </div>
        <nav aria-label="Contact" className="flex flex-wrap gap-6">
          <a
            href={`mailto:${CONTACT.email}`}
            className="transition-colors duration-300 hover:text-foreground"
          >
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.phoneHref}
            className="transition-colors duration-300 hover:text-foreground"
          >
            {CONTACT.phone}
          </a>
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-300 hover:text-foreground"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  )
}

export {
  About,
  Contact,
  CTA_LABEL,
  Footer,
  Hub,
  MarketEntry,
  Network,
  Role,
  Solutions,
  Statement,
  Team,
}
