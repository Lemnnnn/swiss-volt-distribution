import { Hero } from "@/components/site/hero"
import { Nav } from "@/components/site/nav"
import { PowerLine } from "@/components/site/power-line"
import { Reveals } from "@/components/site/reveals"
import {
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
} from "@/components/site/sections"

export default function Page() {
  return (
    <>
      <Nav ctaLabel={CTA_LABEL} />
      <main>
        <PowerLine>
          <Hero ctaLabel={CTA_LABEL} />
          <About />
          <MarketEntry />
          <Hub />
          <Statement />
          <Network />
          <Role />
          <Solutions />
          <Team />
          <Contact />
        </PowerLine>
      </main>
      <Footer />
      <Reveals />
    </>
  )
}
