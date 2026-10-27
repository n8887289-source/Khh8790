import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { ArrowRightIcon } from '../../lib/icons';

export function BrandStory() {
  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="story-title">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal>
          <div className="relative h-full overflow-hidden rounded-2xl border border-line">
            <div
              aria-hidden="true"
              className="glow-violet pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 opacity-70"
            />
            <img
              src="/images/editorial/story-listening.jpg"
              alt="A person listening to music through SONIQUE headphones in low blue and violet light"
              className="h-full min-h-[320px] w-full object-cover lg:min-h-[560px]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
          </div>
        </Reveal>

        <Reveal delay={80} className="flex flex-col">
          <div className="surface flex flex-1 flex-col p-6 sm:p-9">
            <p className="eyebrow">More than sound</p>
            <h2 id="story-title" className="mt-4 text-[28px] sm:text-4xl">
              A Deeper Connection
            </h2>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-mute">
              Music moves us. It sharpens focus, fuels creativity, and brings us closer. At
              SONIQUE, we design audio technology for the moments that matter.
            </p>
            <div className="mt-7">
              <Button to="/story" variant="outline">
                Our Story
                <ArrowRightIcon size={16} />
              </Button>
            </div>
          </div>

          {/* Sustainability panel */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-line">
            <img
              src="/images/editorial/story-mountains.jpg"
              alt="Dark mountain ridge under a deep blue twilight sky"
              className="h-[240px] w-full object-cover sm:h-[260px]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-xl font-semibold sm:text-2xl">
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
