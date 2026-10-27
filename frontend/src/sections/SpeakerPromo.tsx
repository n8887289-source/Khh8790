import { Link } from 'react-router-dom';
import { ArrowRight, BatteryFull, Droplets, Mountain } from 'lucide-react';
import { Reveal } from '../components/ui';

const FEATURES = [
  { icon: Droplets, title: 'IP67', detail: 'Waterproof' },
  { icon: BatteryFull, title: '20 Hours', detail: 'Playtime' },
  { icon: Mountain, title: 'Built for', detail: 'Adventure' },
];

export function SpeakerPromo() {
  return (
    <section className="relative isolate overflow-hidden border-y border-graphite">
      <img
        src="/img/promo-speaker.jpg"
        alt="Portable SONIQUE speaker with blue rim lighting on a dark textured surface"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[62%_50%]"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-void/25" />
      <span className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-void/40" />
      <span className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sonic/20 blur-[110px]" />

      <div className="shell relative grid gap-10 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:py-28">
        <Reveal>
          <p className="label-xs">Sonique Pulse</p>
          <h2 className="mt-5 text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Take Music
            <br />
            Further
          </h2>
          <p className="mt-5 text-base text-mist">Rugged. Portable. Unstoppable.</p>
          <div className="mt-8">
            <Link to="/shop?category=speakers" className="btn-outline">
              Shop Speakers
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ul className="grid grid-cols-3 gap-3 border-t border-graphite pt-6 lg:border-t-0 lg:pt-0">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="text-left">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-graphite bg-void/60">
                  <feature.icon size={17} className="text-sonic-soft" />
                </span>
                <p className="mt-3 text-sm font-medium text-ink">{feature.title}</p>
                <p className="text-xs text-mist">{feature.detail}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
