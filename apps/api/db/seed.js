// Seeds the SONIQUE demo catalogue. Idempotent: re-running only refreshes
// catalogue content, and never touches orders or newsletter subscribers.
//
// Everything in here is demonstration store content: the products, ratings and
// review counts are sample data, not real-world products or real reviews.

import { pool } from '../src/db.js';

const categories = [
  {
    slug: 'headphones',
    name: 'Headphones',
    tagline: 'Immersive. Refined. Yours.',
    image: '/images/categories/headphones.jpg',
    sort_order: 1,
  },
  {
    slug: 'earbuds',
    name: 'Earbuds',
    tagline: 'Small Size. Massive Sound.',
    image: '/images/categories/earbuds.jpg',
    sort_order: 2,
  },
  {
    slug: 'speakers',
    name: 'Speakers',
    tagline: 'Music for Every Moment.',
    image: '/images/categories/speakers.jpg',
    sort_order: 3,
  },
  {
    slug: 'amplifiers',
    name: 'Amplifiers',
    tagline: 'Power Meets Precision.',
    image: '/images/categories/amplifiers.jpg',
    sort_order: 4,
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'Complete the Set.',
    image: '/images/categories/accessories.jpg',
    sort_order: 5,
  },
];

const products = [
  {
    slug: 'sonique-a1',
    name: 'SONIQUE A1',
    category_slug: 'headphones',
    tagline: 'Wireless Headphones',
    description:
      'Our signature over-ear headphone, tuned for depth and detail in equal measure. Adaptive noise cancelling reads the room around you, while 40mm beryllium-coated drivers keep every layer of the mix alive.',
    price: 299,
    badge: 'Bestseller',
    rating: 4.9,
    review_count: 128,
    in_stock: true,
    colors: ['Midnight Black', 'Arctic White', 'Deep Violet'],
    specs: [
      { label: 'Drivers', value: '40mm beryllium-coated dynamic' },
      { label: 'Battery life', value: '38 hours (ANC on)' },
      { label: 'Noise cancelling', value: 'Adaptive hybrid ANC' },
      { label: 'Connectivity', value: 'Bluetooth 5.3, USB-C, 3.5mm' },
      { label: 'Weight', value: '278 g' },
      { label: 'Codecs', value: 'LDAC, aptX Adaptive, AAC, SBC' },
    ],
    images: ['/images/products/a1-1.jpg', '/images/products/a1-2.jpg'],
    tabs: ['bestseller', 'premium'],
    sort_order: 1,
  },
  {
    slug: 'sonique-buds-pro',
    name: 'SONIQUE Buds Pro',
    category_slug: 'earbuds',
    tagline: 'True Wireless Earbuds',
    description:
      'Three microphones, a custom 11mm driver and a case that disappears in your pocket. Buds Pro brings the studio to the street without asking you to compromise on anything.',
    price: 179,
    badge: 'New',
    rating: 4.8,
    review_count: 96,
    in_stock: true,
    colors: ['Midnight Black', 'Frost'],
    specs: [
      { label: 'Drivers', value: '11mm custom dynamic' },
      { label: 'Battery life', value: '9 h buds + 27 h case' },
      { label: 'Noise cancelling', value: 'Hybrid ANC with transparency' },
      { label: 'Connectivity', value: 'Bluetooth 5.3, multipoint' },
      { label: 'Water resistance', value: 'IPX4' },
      { label: 'Charging', value: 'USB-C and wireless' },
    ],
    images: ['/images/products/buds-pro-1.jpg', '/images/products/buds-pro-2.jpg'],
    tabs: ['new', 'bestseller'],
    sort_order: 2,
  },
  {
    slug: 'sonique-pulse',
    name: 'SONIQUE Pulse',
    category_slug: 'speakers',
    tagline: 'Portable Bluetooth Speaker',
    description:
      'A rugged 360° speaker built for open air. Twin passive radiators add weight to the low end, and the silicone shell shrugs off rain, sand and the occasional drop.',
    price: 149,
    rating: 4.7,
    review_count: 74,
    in_stock: true,
    colors: ['Graphite', 'Ocean Blue'],
    specs: [
      { label: 'Output', value: '2 x 20W stereo drivers' },
      { label: 'Battery life', value: '20 hours playtime' },
      { label: 'Water resistance', value: 'IP67 dust and waterproof' },
      { label: 'Connectivity', value: 'Bluetooth 5.2, stereo pairing' },
      { label: 'Weight', value: '680 g' },
      { label: 'Charging', value: 'USB-C fast charge' },
    ],
    images: ['/images/products/pulse-1.jpg', '/images/products/pulse-2.jpg'],
    tabs: ['bestseller'],
    sort_order: 3,
  },
  {
    slug: 'sonique-amp-1',
    name: 'SONIQUE AMP-1',
    category_slug: 'amplifiers',
    tagline: 'Integrated Amplifier',
    description:
      'A 120W-per-channel integrated amplifier with a machined aluminium chassis and a fully discrete output stage. Quiet where it should be silent, enormous where it should roar.',
    price: 499,
    rating: 4.9,
    review_count: 41,
    in_stock: true,
    colors: ['Black Anodised'],
    specs: [
      { label: 'Power', value: '120W per channel into 8Ω' },
      { label: 'Inputs', value: '2 x optical, 2 x coaxial, phono, 3 x line' },
      { label: 'DAC', value: '32-bit / 384kHz' },
      { label: 'Chassis', value: 'Machined aluminium, vibration damped' },
      { label: 'Dimensions', value: '430 x 96 x 330 mm' },
      { label: 'Weight', value: '9.4 kg' },
    ],
    images: ['/images/products/amp-1-1.jpg', '/images/products/amp-1-2.jpg'],
    tabs: ['premium'],
    sort_order: 4,
  },
  {
    slug: 'sonique-a1-studio',
    name: 'SONIQUE A1 Studio',
    category_slug: 'headphones',
    tagline: 'Noise Cancelling Headphones',
    description:
      'Built for long sessions. Reference-flat tuning, memory foam ear cushions and the deepest noise cancelling we make.',
    price: 349,
    badge: 'Limited',
    rating: 4.9,
    review_count: 63,
    in_stock: true,
    colors: ['Midnight Black', 'Studio Grey'],
    specs: [
      { label: 'Drivers', value: '42mm planar magnetic' },
      { label: 'Battery life', value: '45 hours (ANC on)' },
      { label: 'Noise cancelling', value: 'Reference ANC, 6 microphones' },
      { label: 'Connectivity', value: 'Bluetooth 5.3, USB-C audio, 3.5mm' },
      { label: 'Weight', value: '312 g' },
      { label: 'Included', value: 'Hard travel case, two cables' },
    ],
    images: ['/images/products/a1-studio-1.jpg', '/images/products/a1-studio-2.jpg'],
    tabs: ['premium'],
    sort_order: 5,
  },
  {
    slug: 'sonique-buds-air',
    name: 'SONIQUE Buds Air',
    category_slug: 'earbuds',
    tagline: 'True Wireless Earbuds',
    description:
      'Half the weight of the Buds Pro, with the same clarity. Open-fit design that keeps you aware of the world while you listen to it.',
    price: 129,
    badge: 'New',
    rating: 4.7,
    review_count: 112,
    in_stock: true,
    colors: ['Midnight Black', 'Arctic White'],
    specs: [
      { label: 'Drivers', value: '10mm dynamic' },
      { label: 'Battery life', value: '8 h buds + 24 h case' },
      { label: 'Noise cancelling', value: 'Passive isolation, transparency mode' },
      { label: 'Connectivity', value: 'Bluetooth 5.3' },
      { label: 'Water resistance', value: 'IPX4' },
      { label: 'Weight', value: '4.1 g per bud' },
    ],
    images: ['/images/products/buds-air-1.jpg', '/images/products/buds-air-2.jpg'],
    tabs: ['new'],
    sort_order: 6,
  },
  {
    slug: 'sonique-a2',
    name: 'SONIQUE A2',
    category_slug: 'headphones',
    tagline: 'Open-Back Studio Headphones',
    description:
      'An open-back design for mixing and mastering. Airy, uncoloured and honest — the headphone we use to check our own work.',
    price: 429,
    rating: 4.8,
    review_count: 38,
    in_stock: true,
    colors: ['Midnight Black'],
    specs: [
      { label: 'Drivers', value: '50mm open-back dynamic' },
      { label: 'Impedance', value: '38Ω' },
      { label: 'Frequency response', value: '5Hz – 40kHz' },
      { label: 'Connectivity', value: 'Detachable 3.5mm, 6.35mm adapter' },
      { label: 'Weight', value: '298 g' },
      { label: 'Included', value: 'Coiled and straight cables' },
    ],
    images: ['/images/products/a2-1.jpg', '/images/products/a2-2.jpg'],
    tabs: ['premium'],
    sort_order: 7,
  },
  {
    slug: 'sonique-a1-lite',
    name: 'SONIQUE A1 Lite',
    category_slug: 'headphones',
    tagline: 'On-Ear Wireless Headphones',
    description:
      'The A1 sound in a lighter, travel-ready frame. Forty hours of playback and a fold-flat hinge that fits any bag.',
    price: 199,
    rating: 4.6,
    review_count: 87,
    in_stock: true,
    colors: ['Midnight Black', 'Sand'],
    specs: [
      { label: 'Drivers', value: '36mm dynamic' },
      { label: 'Battery life', value: '40 hours' },
      { label: 'Noise cancelling', value: 'Active noise cancelling' },
      { label: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm' },
      { label: 'Weight', value: '214 g' },
      { label: 'Folding', value: 'Flat-fold hinge' },
    ],
    images: ['/images/products/a1-lite-1.jpg', '/images/products/a1-lite-2.jpg'],
    tabs: ['bestseller'],
    sort_order: 8,
  },
  {
    slug: 'sonique-buds-studio',
    name: 'SONIQUE Buds Studio',
    category_slug: 'earbuds',
    tagline: 'Noise Cancelling Earbuds',
    description:
      'Reference-tuned earbuds with the deepest isolation in the range. For flights, open-plan offices and everything in between.',
    price: 229,
    badge: 'Bestseller',
    rating: 4.8,
    review_count: 101,
    in_stock: true,
    colors: ['Midnight Black', 'Deep Violet'],
    specs: [
      { label: 'Drivers', value: '12mm dual-chamber dynamic' },
      { label: 'Battery life', value: '10 h buds + 30 h case' },
      { label: 'Noise cancelling', value: 'Adaptive ANC, 4 microphones' },
      { label: 'Connectivity', value: 'Bluetooth 5.3, multipoint' },
      { label: 'Water resistance', value: 'IPX4' },
      { label: 'Included', value: 'Three ear tip sizes, USB-C cable' },
    ],
    images: ['/images/products/buds-studio-1.jpg', '/images/products/buds-studio-2.jpg'],
    tabs: ['bestseller', 'premium'],
    sort_order: 9,
  },
  {
    slug: 'sonique-buds-lite',
    name: 'SONIQUE Buds Lite',
    category_slug: 'earbuds',
    tagline: 'Everyday Wireless Earbuds',
    description:
      'Everything you need for the commute and nothing you do not. Clear calls, comfortable fit, a week of battery.',
    price: 99,
    rating: 4.5,
    review_count: 143,
    in_stock: true,
    colors: ['Midnight Black', 'Arctic White'],
    specs: [
      { label: 'Drivers', value: '9mm dynamic' },
      { label: 'Battery life', value: '7 h buds + 21 h case' },
      { label: 'Connectivity', value: 'Bluetooth 5.2' },
      { label: 'Water resistance', value: 'IPX4' },
      { label: 'Calls', value: 'Dual-microphone with wind noise reduction' },
      { label: 'Weight', value: '4.6 g per bud' },
    ],
    images: ['/images/products/buds-lite-1.jpg', '/images/products/buds-lite-2.jpg'],
    tabs: ['bestseller'],
    sort_order: 10,
  },
  {
    slug: 'sonique-pulse-mini',
    name: 'SONIQUE Pulse Mini',
    category_slug: 'speakers',
    tagline: 'Compact Bluetooth Speaker',
    description:
      'Pocket-sized, surprisingly loud, and shaped to sit on a windowsill without wobbling. Twelve hours on a single charge.',
    price: 99,
    rating: 4.6,
    review_count: 58,
    in_stock: true,
    colors: ['Graphite', 'Sand'],
    specs: [
      { label: 'Output', value: '1 x 15W full range' },
      { label: 'Battery life', value: '12 hours playtime' },
      { label: 'Water resistance', value: 'IP65' },
      { label: 'Connectivity', value: 'Bluetooth 5.2' },
      { label: 'Weight', value: '340 g' },
      { label: 'Charging', value: 'USB-C' },
    ],
    images: ['/images/products/pulse-mini-1.jpg', '/images/products/pulse-mini-2.jpg'],
    tabs: ['new'],
    sort_order: 11,
  },
  {
    slug: 'sonique-stage-5',
    name: 'SONIQUE Stage 5',
    category_slug: 'speakers',
    tagline: 'Floorstanding Loudspeaker',
    description:
      'A three-way floorstander with a rear-ported cabinet and real low-frequency authority. Sold as a matched pair.',
    price: 899,
    badge: 'Premium',
    rating: 4.9,
    review_count: 22,
    in_stock: true,
    colors: ['Midnight Black', 'Walnut'],
    specs: [
      { label: 'Configuration', value: 'Three-way floorstanding, matched pair' },
      { label: 'Drivers', value: '2 x 165mm bass, 130mm mid, 25mm tweeter' },
      { label: 'Sensitivity', value: '89 dB' },
      { label: 'Frequency response', value: '32Hz – 30kHz' },
      { label: 'Dimensions', value: '1050 x 210 x 320 mm each' },
      { label: 'Weight', value: '24 kg each' },
    ],
    images: ['/images/products/stage-5-1.jpg', '/images/products/stage-5-2.jpg'],
    tabs: ['premium'],
    sort_order: 12,
  },
  {
    slug: 'sonique-amp-2',
    name: 'SONIQUE AMP-2',
    category_slug: 'amplifiers',
    tagline: 'Tube Preamplifier',
    description:
      'A hand-wired valve preamplifier with a separate power supply, stepped attenuator and point-to-point signal path.',
    price: 749,
    badge: 'Limited',
    rating: 4.8,
    review_count: 19,
    in_stock: true,
    colors: ['Black Anodised', 'Brushed Silver'],
    specs: [
      { label: 'Valves', value: '4 x 12AU7, hand-matched' },
      { label: 'Inputs', value: '2 x line, 1 x phono' },
      { label: 'Outputs', value: 'RCA and XLR' },
      { label: 'Power supply', value: 'External, dual-mono' },
      { label: 'Dimensions', value: '320 x 110 x 280 mm' },
      { label: 'Weight', value: '7.1 kg' },
    ],
    images: ['/images/products/amp-2-1.jpg', '/images/products/amp-2-2.jpg'],
    tabs: ['premium'],
    sort_order: 13,
  },
  {
    slug: 'sonique-dac-x',
    name: 'SONIQUE DAC-X',
    category_slug: 'amplifiers',
    tagline: 'Reference Desktop DAC',
    description:
      'A desktop digital-to-analogue converter with a discrete output stage and a headphone amplifier that drives almost anything.',
    price: 399,
    badge: 'New',
    rating: 4.7,
    review_count: 33,
    in_stock: true,
    colors: ['Black Anodised'],
    specs: [
      { label: 'Resolution', value: '32-bit / 768kHz PCM, DSD512' },
      { label: 'Inputs', value: 'USB-C, optical, coaxial' },
      { label: 'Outputs', value: 'Balanced XLR, RCA, 4.4mm headphone' },
      { label: 'Output power', value: '1.4W into 32Ω' },
      { label: 'Dimensions', value: '200 x 55 x 160 mm' },
      { label: 'Weight', value: '1.6 kg' },
    ],
    images: ['/images/products/dac-x-1.jpg', '/images/products/dac-x-2.jpg'],
    tabs: ['new', 'premium'],
    sort_order: 14,
  },
  {
    slug: 'sonique-travel-case',
    name: 'SONIQUE Travel Case',
    category_slug: 'accessories',
    tagline: 'Hard Shell Headphone Case',
    description:
      'A moulded, crush-resistant case lined with microfibre, sized for every over-ear headphone we make.',
    price: 49,
    rating: 4.6,
    review_count: 210,
    in_stock: true,
    colors: ['Midnight Black'],
    specs: [
      { label: 'Material', value: 'Moulded EVA shell, microfibre lining' },
      { label: 'Fits', value: 'SONIQUE A1, A1 Studio, A1 Lite, A2' },
      { label: 'Internal pocket', value: 'Cables and adapters' },
      { label: 'Closure', value: 'Double zip with carabiner' },
      { label: 'Dimensions', value: '220 x 190 x 90 mm' },
      { label: 'Weight', value: '290 g' },
    ],
    images: ['/images/products/travel-case-1.jpg', '/images/products/travel-case-2.jpg'],
    tabs: [],
    sort_order: 15,
  },
  {
    slug: 'sonique-cable-pro',
    name: 'SONIQUE Cable Pro',
    category_slug: 'accessories',
    tagline: 'Braided Audio Cable',
    description:
      'An oxygen-free copper cable in a soft braided jacket, terminated in a right-angled 3.5mm plug and a locking connector.',
    price: 39,
    rating: 4.5,
    review_count: 165,
    in_stock: false,
    colors: ['Black', 'Violet'],
    specs: [
      { label: 'Conductor', value: 'Oxygen-free copper, 4-core' },
      { label: 'Length', value: '1.2 m' },
      { label: 'Termination', value: '3.5mm right-angle, locking 2.5mm' },
      { label: 'Jacket', value: 'Braided nylon' },
      { label: 'Compatibility', value: 'SONIQUE A1, A1 Studio, A2' },
      { label: 'Weight', value: '32 g' },
    ],
    images: ['/images/products/cable-pro-1.jpg', '/images/products/cable-pro-2.jpg'],
    tabs: [],
    sort_order: 16,
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (slug, name, tagline, image, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name,
               tagline = EXCLUDED.tagline,
               image = EXCLUDED.image,
               sort_order = EXCLUDED.sort_order`,
        [category.slug, category.name, category.tagline, category.image, category.sort_order],
      );
    }

    for (const product of products) {
      await client.query(
        `INSERT INTO products (
           slug, name, category_slug, tagline, description, price, compare_at_price, badge,
           rating, review_count, in_stock, colors, specs, images, tabs, sort_order
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name,
               category_slug = EXCLUDED.category_slug,
               tagline = EXCLUDED.tagline,
               description = EXCLUDED.description,
               price = EXCLUDED.price,
               compare_at_price = EXCLUDED.compare_at_price,
               badge = EXCLUDED.badge,
               rating = EXCLUDED.rating,
               review_count = EXCLUDED.review_count,
               in_stock = EXCLUDED.in_stock,
               colors = EXCLUDED.colors,
               specs = EXCLUDED.specs,
               images = EXCLUDED.images,
               tabs = EXCLUDED.tabs,
               sort_order = EXCLUDED.sort_order`,
        [
          product.slug,
          product.name,
          product.category_slug,
          product.tagline,
          product.description,
          product.price,
          product.compare_at_price ?? null,
          product.badge ?? null,
          product.rating,
          product.review_count,
          product.in_stock,
          product.colors ?? [],
          JSON.stringify(product.specs ?? []),
          product.images ?? [],
          product.tabs ?? [],
          product.sort_order,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`[seed] ${categories.length} categories and ${products.length} products ready`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[seed] failed:', error.message);
  process.exit(1);
});
