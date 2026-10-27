import { ArrowRight, Diamond, Play, Truck, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  { icon: Waves, title: 'Studio-Grade Sound', detail: 'True to the original' },
  { icon: Diamond, title: 'Premium Craftsmanship', detail: 'Built to last' },
  { icon: Truck, title: 'Free Shipping', detail: 'On orders over $99' },
];

export function Hero({ onWatchFilm }: { onWatchFilm: () => void }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-graphite">
      <img
        src="/img/hero.jpg"
        alt="SONIQUE over-ear headphones on dark volcanic rock, lit by violet and electric blue light"
        className="absolute inset-0 h-full w-full object-cover object-[70%_45%]"
        decoding="async"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-void/25 lg:via-void/70" />
      <span className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-void/50" />
      <span className="pointer-events-none absolute -right-24 top-1/4 h-[30rem] w-[30rem] animate-aurora rounded-full bg-violet/25 blur-[120px]" />
      <span className="pointer-events-none absolute -left-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-sonic/20 blur-[130px]" />

      <div className="shell relative grid items-center gap-14 pt-16 pb-12 lg:grid-cols-[1.06fr_0.94fr] lg:pt-24 lg:pb-16">
        <div className="max-w-2xl">
          <p className="label-xs animate-fade-in">Sound lives deeper</p>
          <h1 className="mt-5 text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Hear Every <span className="text-gradient">Detail</span>
          </h1>
          <p className="mt-6 text-lg text-ink sm:text-xl">Premium audio for a more meaningful you.</p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
            From immersive headphones to powerful speakers, SONIQUE brings your world to life with
            extraordinary clarity.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/shop" className="btn-primary">
              Shop All Products
              <ArrowRight size={16} />
            </Link>
            <button type="button" onClick={onWatchFilm} className="btn-outline">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Play size={12} className="translate-x-[1px]" />
              </span>
              Watch the Film
            </button>
          </div>

          <div className="mt-10 flex items-center gap-5 lg:hidden">
            <span className="h-14 w-px bg-graphite" aria-hidden="true" />
            <div>
              <p className="text-base font-medium leading-tight text-ink">
                Sound Shapes
                <br />
                A Brighter You
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest2 text-mist">
                Play a brighter life
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden h-full items-center justify-end lg:flex">
          <div className="flex items-stretch gap-6">
            <span className="w-px bg-gradient-to-b from-transparent via-graphite to-transparent" />
            <div className="flex items-center">
              <p className="[writing-mode:vertical-rl] rotate-180 text-2xl font-light uppercase tracking-[0.32em] text-ink/90">
                Sound&nbsp;&nbsp;Shapes&nbsp;&nbsp;A&nbsp;&nbsp;Brighter&nbsp;&nbsp;You
              </p>
            </div>
            <p className="[writing-mode:vertical-rl] rotate-180 self-end pb-6 text-[11px] uppercase tracking-widest2 text-mist">
              Play a brighter life
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-graphite/80 bg-void/45 backdrop-blur-[2px]">
        <ul className="shell grid grid-cols-1 divide-y divide-graphite/80 py-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex items-center gap-4 py-4 sm:px-6 sm:first:pl-0">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-graphite bg-abyss/80">
                <benefit.icon size={17} className="text-violet-soft" />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-ink">{benefit.title}</span>
                <span className="block text-xs text-mist">{benefit.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
