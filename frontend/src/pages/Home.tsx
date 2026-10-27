import { useState } from 'react';
import { FilmModal } from '../components/FilmModal';
import { BrandStory } from '../sections/BrandStory';
import { CategoryGrid } from '../sections/CategoryGrid';
import { FeaturedProducts } from '../sections/FeaturedProducts';
import { Hero } from '../sections/Hero';
import { Newsletter } from '../sections/Newsletter';
import { SpeakerPromo } from '../sections/SpeakerPromo';
import { Testimonials } from '../sections/Testimonials';

export default function Home() {
  const [filmOpen, setFilmOpen] = useState(false);

  return (
    <>
      <Hero onWatchFilm={() => setFilmOpen(true)} />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandStory />
      <SpeakerPromo />
      <Testimonials />
      <Newsletter />
      <FilmModal open={filmOpen} onClose={() => setFilmOpen(false)} />
    </>
  );
}
