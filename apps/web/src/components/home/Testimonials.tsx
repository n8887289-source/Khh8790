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
    role: 'Sound engineer, sample profile',
    rating: 5,
    quote:
      'The A1 Studio is the first headphone I trust for a final check. The low end stays honest no matter how loud I push it.',
  },
  {
    name: 'Daniel R.',
    role: 'Long-haul commuter, sample profile',
    rating: 5,
    quote:
      'Buds Pro disappeared into my routine. Two flights, one charge, and the cabin noise simply was not there.',
  },
  {
    name: 'Priya M.',
    role: 'Weekend hiker, sample profile',
    rating: 5,
    quote:
      'The Pulse came out in the rain, on the rocks, in the sand — and it still sounds like it did on day one.',
  },
];

export function Testimonials() {
  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="testimonials-title">
      <SectionHeading
        eyebrow="Sample content"
        title="What Our Customers Say"
        titleId="testimonials-title"
      />

      <p className="mt-4 max-w-2xl text-[12.5px] text-mute">
        These testimonials are sample demonstration content created for this storefront. They are not
        verified customer reviews.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal as="li" key={testimonial.name} delay={index * 70}>
            <figure className="surface flex h-full flex-col p-6">
              <StarRating rating={testimonial.rating} size={15} />
              <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-paper/90">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-electric text-[13px] font-semibold text-white"
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
