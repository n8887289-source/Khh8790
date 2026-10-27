import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { BrandStory } from '../components/home/BrandStory';
import { SpeakerPromo } from '../components/home/SpeakerPromo';
import { Testimonials } from '../components/home/Testimonials';
import { Newsletter } from '../components/home/Newsletter';

export function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandStory />
      <SpeakerPromo />
      <Testimonials />
      <Newsletter />
    </>
  );
}
