import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stars } from '../components/ui';

const TESTIMONIALS = [
  {
    name: 'Daniel K.',
    initials: 'DK',
    quote:
      'Absolutely incredible sound quality. SONIQUE headphones have changed how I experience music.',
  },
  {
    name: 'Priya M.',
    initials: 'PM',
    quote:
      'The best earbuds I have ever owned. Crystal clear, comfortable, and the battery life is amazing.',
  },
  {
    name: 'Marcus L.',
    initials: 'ML',
    quote: 'Superb build quality and rich, detailed sound. SONIQUE lives up to the hype.',
  },
];

export function Testimonials() {
  const scroller = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.round(element.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="section">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-xs mb-3">Listeners</p>
            <h2 className="text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
              What Our Customers Say
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="icon-btn border-graphite"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="icon-btn border-graphite"
              aria-label="Next testimonials"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <ul
          ref={scroller}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {TESTIMONIALS.map((testimonial) => (
            <li
              key={testimonial.name}
              className="w-[85%] shrink-0 snap-start rounded-2xl border border-graphite bg-abyss/70 p-6 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
            >
              <Stars rating={5} size={15} />
              <blockquote className="mt-4 text-sm leading-relaxed text-ink/90">
                “{testimonial.quote}”
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-graphite pt-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-graphite bg-midnight text-xs font-medium text-ink">
                  {testimonial.initials}
                </span>
                <span>
                  <span className="block text-sm font-medium">{testimonial.name}</span>
                  <span className="block text-[11px] uppercase tracking-widest text-mist">
                    Sample testimonial
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-mist/80">
          Sample demonstration content — these testimonials are illustrative examples for this demo
          store, not verified customer reviews.
        </p>
      </div>
    </section>
  );
}
