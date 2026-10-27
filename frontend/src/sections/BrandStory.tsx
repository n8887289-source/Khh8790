import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../components/ui';

export function BrandStory() {
  return (
    <section className="section">
      <div className="shell">
        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal className="relative">
            <div className="relative h-full min-h-[20rem] overflow-hidden rounded-2xl border border-graphite lg:min-h-[34rem]">
              <img
                src="/img/story.jpg"
                alt="A listener wearing SONIQUE headphones in a dark room with violet light"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
              <span className="pointer-events-none absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-violet/25 blur-[90px]" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col justify-center rounded-2xl border border-graphite bg-abyss/60 p-8 lg:p-12">
              <p className="label-xs">More than sound</p>
              <h2 className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-[2.9rem] leading-tight">
                A Deeper Connection
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-mist sm:text-base">
                Music moves us. It sharpens focus, fuels creativity, and brings us closer. At
                SONIQUE, we design audio technology for the moments that matter.
              </p>
              <div className="mt-8">
                <Link to="/our-story" className="btn-primary">
                  Our Story
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-graphite lg:mt-8">
            <img
              src="/img/story-mountain.jpg"
              alt="A dark mountain ridge under a night sky"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-void via-void/70 to-void/20" />
            <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <h3 className="text-2xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
                  Better Sound.
                  <br />
                  A Brighter Tomorrow.
                </h3>
                <p className="label-xs mt-5">Sustainable tech for a louder tomorrow</p>
              </div>
              <div className="lg:justify-self-end">
                <Link to="/sustainability" className="btn-outline">
                  Our Impact
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
