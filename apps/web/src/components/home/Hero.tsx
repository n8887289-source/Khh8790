import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { WatchTheFilmButton } from '../PromoFilm';
import { ArrowRightIcon, CraftIcon, TruckIcon, WaveIcon } from '../../lib/icons';
import { Reveal } from '../ui/Reveal';

const BENEFITS = [
  { icon: WaveIcon, title: 'Studio-Grade Sound', copy: 'True to the original' },
  { icon: CraftIcon, title: 'Premium Craftsmanship', copy: 'Built to last' },
  { icon: TruckIcon, title: 'Free Shipping', copy: 'On orders over $99' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Lighting: electric blue and violet glows behind the product. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-blue absolute -right-24 -top-24 h-[26rem] w-[26rem] opacity-70 blur-[10px] sm:h-[34rem] sm:w-[34rem]" />
        <div className="glow-violet absolute -left-32 top-40 h-[22rem] w-[22rem] opacity-60 blur-[10px] sm:h-[30rem] sm:w-[30rem]" />
        <div className="glow-blue absolute bottom-0 left-1/3 h-[18rem] w-[18rem] opacity-40 blur-[10px]" />
      </div>

      <div className="shell relative pt-10 pb-10 lg:pt-14 lg:pb-14">
        <div className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">Sound lives deeper</p>
              <h1
                id="hero-title"
                className="mt-5 text-[40px] leading-[1.02] font-semibold sm:text-[54px] lg:text-[62px] xl:text-[68px]"
              >
                Hear Every <span className="text-brand-soft">Detail</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg font-medium text-paper/90 sm:text-xl">
                Premium audio for a more meaningful you.
              </p>
              <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-mute">
                From immersive headphones to powerful speakers, SONIQUE brings your world to life
                with extraordinary clarity.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button to="/shop" size="lg">
                  Shop All Products
                  <ArrowRightIcon size={16} />
                </Button>
                <WatchTheFilmButton className="py-3.5" />
              </div>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-7 xl:col-span-6 xl:col-start-6">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="glow-blue absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-80"
                />
                <img
                  src="/images/editorial/hero-headphones.jpg"
                  alt="SONIQUE A1 over-ear headphones on a dark surface, lit by electric blue and violet light"
                  className="relative w-full rounded-2xl border border-line object-cover shadow-[0_40px_120px_-40px_rgba(39,107,255,0.55)]"
                  width="1200"
                  height="800"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </Reveal>
          </div>

          {/* Right-hand editorial panel — reference layout keeps it beside the product. */}
          <div className="mt-8 hidden xl:absolute xl:right-0 xl:top-1/2 xl:mt-0 xl:block xl:w-[120px] xl:-translate-y-1/2">
            <div className="border-l border-line pl-5">
              <p className="text-[13px] font-semibold leading-[1.7] text-paper">
                Sound
                <br />
                Shapes
                <br />
                A Brighter
                <br />
                You
              </p>
              <div className="my-5 h-px w-10 bg-white/25" />
              <p className="text-[9.5px] uppercase leading-relaxed tracking-[0.2em] text-mute">
                Play a brighter life
              </p>
            </div>
          </div>
        </div>

        {/* Compact version of the side panel for smaller screens. */}
        <div className="mt-8 flex items-center gap-5 border-t border-line pt-6 xl:hidden">
          <p className="text-[15px] font-semibold leading-snug">
            Sound Shapes A Brighter You
          </p>
          <div className="h-8 w-px bg-white/20" aria-hidden="true" />
          <p className="text-[9.5px] uppercase tracking-[0.2em] text-mute">Play a brighter life</p>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid gap-0 border-t border-line sm:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex items-start gap-3 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0 ${
                index > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''
              }`}
            >
              <benefit.icon size={20} className="mt-0.5 shrink-0 text-brand-soft" />
              <div>
                <p className="text-[13.5px] font-semibold">{benefit.title}</p>
                <p className="text-[12.5px] text-mute">{benefit.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-mute/70">
          <Link to="/shop" className="link-underline">
            Browse the full collection
          </Link>{' '}
          — 16 products across headphones, earbuds, speakers, amplifiers and accessories.
        </p>
      </div>
    </section>
  );
}
