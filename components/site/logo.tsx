import { cn } from "@/lib/utils"

// Vector redraw of the SwissVolt Distribution logo (swissvolt-distribution.com):
// a two-line lowercase wordmark with an outlined lightning bolt to its right.
// The original is a raster on a gradient tile, which doesn't sit on a dark page.
function Bolt({ className }: { className?: string }) {
  return (
    <svg viewBox="110 10 290 490" fill="none" aria-hidden className={className}>
      <path
        d="M205 280 H124 L230 20 H386 L268 208 M248 232 H336 L130 486 L190 302"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex flex-col text-[1.0625em] leading-[0.86] font-bold tracking-[-0.035em] lowercase">
        <span>swissvolt</span>
        <span>distribution</span>
      </span>
      <Bolt className="h-[1.85em] w-auto text-volt" />
    </span>
  )
}

export { Bolt, Logo }
