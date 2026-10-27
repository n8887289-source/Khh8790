import { StarRating } from '../ui/StarRating';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Feedback';
import { initialsOf } from '../../lib/format';

/**
 * Sample testimonials. They are demonstration copy written for this build and
 * are labelled as such — they are not real, verified customer reviews.
 */
const TESTIMONIALS = [
  {
    name: 'Amara O.',
    role: 'Headphones owner, sample profile',
    rating: 5,
    quote:
      'Absolutely incredible sound quality. SONIQUE headphones have changed how I experience music.',
  },
  {
    name: 'Daniel R.',
    role: 'Earbuds owner, sample profile',
    rating: 5,
    quote:
      'The best earbuds I have ever owned. Crystal clear, comfortable, and the battery life is amazing.',
  },
  {
    name: 'Priya M.',
    role: 'Speaker owner, sample profile',
    rating: 5,
    quote: 'Superb build quality and rich, detailed sound. SONIQUE lives up to the hype.',
  },
];

export function Testimonials() {
  return (
    <section className="shell py-10 sm:py-14" aria-labelledby="testimonials-title">
      <SectionHeading
        eyebrow="Sample content"
        title="What Our Customers Say"
        titleId="testimonials-title"
      />

      <p className="mt-4 max-w-2xl text-[12.5px] text-mute">
        These testimonials are sample demonstration content created for this storefront. They are not
        verified customer reviews.
      </p>

      <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal as="li" key={testimonial.name} delay={index * 70}>
            <figure className="surface flex h-full flex-col p-5">
              <StarRating rating={testimonial.rating} size={13} />
              <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-paper/90">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-electric text-[12px] font-semibold text-white"
                >
                  {initialsOf(testimonial.name)}
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{testimonial.name}</span>
                  <span className="block text-[11.5px] text-mute">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
