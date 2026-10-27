import { Button } from '../ui/Button';
import { WatchTheFilmButton } from '../PromoFilm';
import { ArrowRightIcon, CraftIcon, TruckIcon, WaveIcon } from '../../lib/icons';
import { Reveal } from '../ui/Reveal';

const BENEFITS = [
  { icon: WaveIcon, title: 'Studio-Grade Sound', copy: 'True to the original' },
  { icon: CraftIcon, title: 'Premium Craftsmanship', copy: 'Built to last' },
  { icon: TruckIcon, title: 'Free Shipping', copy: 'On orders over $99' },
];

/** Violet/blue light behind the product, matching the campaign grade. */
const AURA =
  'radial-gradient(circle, rgba(105,71,255,0.52) 0%, rgba(39,107,255,0.26) 44%, rgba(5,6,9,0) 70%)';

/** Feathers the product photograph into the page so no card edge is visible. */
const PRODUCT_MASK =
  'radial-gradient(closest-side, #000 64%, rgba(0,0,0,0.62) 84%, transparent 100%)';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line/70" aria-labelledby="hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(115%_95%_at_76%_26%,rgba(39,107,255,0.18),transparent_62%),radial-gradient(80%_70%_at_8%_0%,rgba(105,71,255,0.14),transparent_64%)]" />
      </div>

      <div className="shell relative">
        <div className="grid items-center gap-6 pt-6 sm:gap-8 sm:pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-4 lg:pt-10">
          {/* Copy */}
          <Reveal className="min-w-0">
            <p className="eyebrow">Sound lives deeper</p>
            <h1
              id="hero-title"
              className="mt-3 text-[32px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[46px] lg:text-[54px] xl:text-[62px]"
            >
              <span className="block">Hear Every</span>
              <span className="block text-brand-soft">Detail</span>
            </h1>
            <p className="mt-3 max-w-[30ch] text-[13.5px] font-medium leading-snug text-paper/90 sm:text-[15px]">
              Premium audio for a more meaningful you.
            </p>
            <p className="mt-2 max-w-[46ch] text-[12.5px] leading-relaxed text-mute sm:mt-3 sm:text-[13.5px]">
              From immersive headphones to powerful speakers, SONIQUE brings your world to life with
              extraordinary clarity.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
              <Button to="/shop" size="sm">
                Shop All Products
                <ArrowRightIcon size={14} />
              </Button>
              <WatchTheFilmButton className="px-4 py-2 text-[12px]" />
            </div>
          </Reveal>

          {/* Product */}
          <Reveal delay={80} className="relative min-w-0">
            <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: AURA }}
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/25"
              />
              <img
                src="/images/editorial/hero-headphones.jpg"
                alt="SONIQUE A1 over-ear headphones lit by electric blue and violet light"
                width="1200"
                height="800"
                className="relative w-full select-none object-cover"
                style={{ maskImage: PRODUCT_MASK, WebkitMaskImage: PRODUCT_MASK }}
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Editorial side note: a compact line under the product, a vertical
                rail beside it once there is room at xl. */}
            <div className="mt-3 flex items-center gap-3 xl:hidden">
              <p className="text-[11px] font-semibold leading-none">Sound Shapes A Brighter You</p>
              <span aria-hidden="true" className="h-3 w-px bg-white/25" />
              <p className="text-[9px] uppercase tracking-[0.22em] text-mute">Play a brighter life</p>
            </div>
            <div className="pointer-events-none absolute -right-1 top-1/2 hidden -translate-y-1/2 xl:block">
              <p className="text-[11px] font-semibold leading-[1.9]">
                Sound
                <br />
                Shapes
                <br />
                A Brighter
                <br />
                You
              </p>
              <div aria-hidden="true" className="my-3 h-px w-8 bg-white/25" />
              <p className="text-[8.5px] uppercase leading-relaxed tracking-[0.24em] text-mute">
                Play a brighter life
              </p>
            </div>
          </Reveal>
        </div>

        {/* Benefits */}
        <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-line py-4 sm:mt-6 sm:gap-6 sm:py-5">
          {BENEFITS.map((benefit, index) => (
            <li
              key={benefit.title}
              className={`flex items-start gap-2 sm:gap-3 ${index > 0 ? 'border-l border-line pl-2 sm:pl-5' : ''}`}
            >
              <benefit.icon size={16} className="mt-0.5 shrink-0 text-brand-soft" />
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold leading-tight sm:text-[12.5px]">
                  {benefit.title}
                </p>
                <p className="text-[10.5px] leading-tight text-mute sm:text-[11.5px]">
                  {benefit.copy}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
