import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { ArrowRightIcon } from '../../lib/icons';

export function BrandStory() {
  return (
    <section className="shell py-10 sm:py-14" aria-labelledby="story-title">
      <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-5">
        <Reveal>
          <div className="relative h-full overflow-hidden rounded-2xl border border-line">
            <div
              aria-hidden="true"
              className="glow-violet pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 opacity-70"
            />
            <img
              src="/images/editorial/story-listening.jpg"
              alt="A person listening to music through SONIQUE headphones in low blue and violet light"
              className="h-full min-h-[260px] w-full object-cover brightness-[0.82] saturate-[0.9] lg:min-h-[440px]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/10" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-electric/10 via-transparent to-brand/20"
            />
          </div>
        </Reveal>

        <Reveal delay={80} className="flex flex-col">
          <div className="surface flex flex-1 flex-col p-5 sm:p-7">
            <p className="eyebrow">More than sound</p>
            <h2 id="story-title" className="mt-3 text-[24px] sm:text-[30px]">
              A Deeper Connection
            </h2>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-mute">
              Music moves us. It sharpens focus, fuels creativity, and brings us closer. At
              SONIQUE, we design audio technology for the moments that matter.
            </p>
            <div className="mt-6">
              <Button to="/story" variant="outline">
                Our Story
                <ArrowRightIcon size={16} />
              </Button>
            </div>
          </div>

          {/* Sustainability panel */}
          <div className="relative mt-3.5 overflow-hidden rounded-2xl border border-line">
            <img
              src="/images/editorial/story-mountains.jpg"
              alt="Dark mountain ridge under a deep blue twilight sky"
              className="h-[200px] w-full object-cover sm:h-[220px]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h3 className="text-lg font-semibold sm:text-xl">
                Better Sound.
                <br />
                A Brighter Tomorrow.
              </h3>
              <p className="mt-3 text-[10.5px] uppercase tracking-[0.2em] text-mute">
                Sustainable tech for a louder tomorrow
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
