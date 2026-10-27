import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { ArrowRightIcon, BatteryIcon, DropletIcon, MountainIcon } from '../../lib/icons';

const FEATURES = [
  { icon: DropletIcon, primary: 'IP67', secondary: 'Waterproof' },
  { icon: BatteryIcon, primary: '20 Hours', secondary: 'Playtime' },
  { icon: MountainIcon, primary: 'Built for', secondary: 'Adventure' },
];

export function SpeakerPromo() {
  return (
    <section className="shell py-6 sm:py-10" aria-labelledby="speaker-promo-title">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-line bg-navy">
          <div
            aria-hidden="true"
            className="glow-blue pointer-events-none absolute -right-20 -top-24 h-96 w-96 opacity-70"
          />
          <div className="relative grid gap-0 lg:grid-cols-[1.05fr_1fr]">
            <div className="order-2 p-6 sm:p-9 lg:order-1">
              <p className="eyebrow">Portable sound</p>
              <h2 id="speaker-promo-title" className="mt-4 text-[30px] leading-[1.05] sm:text-[42px]">
                Take Music
                <br />
                Further
              </h2>
              <p className="mt-4 text-[15px] text-mute">Rugged. Portable. Unstoppable.</p>
              <div className="mt-7">
                <Button to="/shop?category=speakers">
                  Shop Speakers
                  <ArrowRightIcon size={16} />
                </Button>
              </div>

              <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-6">
                {FEATURES.map((feature) => (
                  <div key={feature.primary}>
                    <feature.icon size={20} className="text-brand-soft" />
                    <dt className="mt-3 text-[14px] font-semibold leading-tight">{feature.primary}</dt>
                    <dd className="text-[12.5px] text-mute">{feature.secondary}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="order-1 lg:order-2">
              <img
                src="/images/editorial/speaker-promo.jpg"
                alt="Close-up of a SONIQUE portable speaker grille under blue rim lighting"
                className="h-[240px] w-full object-cover sm:h-[300px] lg:h-full lg:min-h-[420px]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
