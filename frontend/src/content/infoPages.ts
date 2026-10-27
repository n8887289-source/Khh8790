export type InfoSection = { heading: string; body: string[]; list?: string[] };

export type InfoPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  channels?: { label: string; value: string; href: string }[];
  cta?: { label: string; to: string };
  notice?: string;
};

const DEMO_NOTICE =
  'This page describes the demonstration store only. Policies, addresses and figures are illustrative sample content, not a real trading entity.';

export const INFO_PAGES: Record<string, InfoPageContent> = {
  explore: {
    eyebrow: 'Discover',
    title: 'Explore SONIQUE',
    intro:
      'Four product families, one design language. Start with the range that matches how you listen, then read the thinking behind it.',
    sections: [
      {
        heading: 'The range',
        body: ['Every product is tuned in the same room by the same team.'],
        list: ['Headphones for deep, uninterrupted listening', 'Earbuds for movement and travel', 'Speakers for rooms and open air', 'Amplifiers for the last watt of clarity'],
      },
      {
        heading: 'Read next',
        body: [
          'The brand story explains why we build for depth rather than volume, and the sustainability page covers how the hardware is designed to stay in use.',
        ],
      },
    ],
    cta: { label: 'Browse the catalog', to: '/shop' },
  },

  'our-story': {
    eyebrow: 'More than sound',
    title: 'Our Story',
    intro:
      'SONIQUE began with a simple frustration: most audio hardware asks you to choose between measurement and emotion. We refused.',
    sections: [
      {
        heading: 'Built in the dark',
        body: [
          'Our first prototypes were assembled at night in a small studio, tuned against a single reference record until the low end stopped flattering itself and simply told the truth.',
          'That habit never left. Every SONIQUE product is voiced against the same reference material, then re-checked on the machines our customers actually use.',
        ],
      },
      {
        heading: 'Design for the long term',
        body: [
          'Housings are machined rather than moulded where strength matters. Ear cushions, cables and batteries are replaceable so that a headphone can outlive a trend.',
        ],
      },
      {
        heading: 'A note on this store',
        body: [
          'This storefront is a demonstration build: the catalog, ratings and testimonials are sample content created to show the experience end to end.',
        ],
      },
    ],
    cta: { label: 'See the catalog', to: '/shop' },
    notice: DEMO_NOTICE,
  },

  sustainability: {
    eyebrow: 'Our impact',
    title: 'A Brighter Tomorrow',
    intro:
      'Better sound and lighter impact are not opposites. We design for a longer product life and a smaller footprint.',
    sections: [
      {
        heading: 'Designed to be repaired',
        body: [
          'Cushions, cables, batteries and case parts are user-replaceable on every current model. Service documentation ships with the product.',
        ],
      },
      {
        heading: 'Materials',
        body: [
          'Aluminium and steel replace glued plastics where structural loads are highest, which keeps a product out of landfill and inside a repair loop.',
          'Packaging is unbleached board with no plastic laminate.',
        ],
      },
      {
        heading: 'What we do not claim',
        body: [
          'This demonstration store makes no certified environmental claims and shows no third-party accreditations, because none have been audited for it.',
        ],
      },
    ],
    cta: { label: 'Explore the products', to: '/shop' },
    notice: DEMO_NOTICE,
  },

  press: {
    eyebrow: 'Press',
    title: 'Press & Media',
    intro:
      'Review units, imagery and background information for the SONIQUE range.',
    sections: [
      {
        heading: 'Review units',
        body: [
          'Review requests are handled by email. Tell us the outlet, the intended angle and the deadline, and we will confirm availability.',
        ],
      },
      {
        heading: 'Using our imagery',
        body: [
          'Product photography from this site may be reused with attribution. We do not supply our assets to outlets we cannot verify.',
        ],
      },
    ],
    channels: [
      {
        label: 'Press enquiries',
        value: 'press@sonique.example',
        href: 'mailto:press@sonique.example?subject=SONIQUE%20press%20enquiry',
      },
    ],
    notice: 'Sample demonstration content. No editorial coverage is implied or claimed.',
  },

  careers: {
    eyebrow: 'Careers',
    title: 'Build With Us',
    intro:
      'We are a small team of acoustics engineers, industrial designers and software people.',
    sections: [
      {
        heading: 'How we work',
        body: [
          'Long uninterrupted blocks for deep work, short review loops, and a hard rule that every product decision is written down before it is argued.',
        ],
      },
      {
        heading: 'Open roles',
        body: [
          'There are no live openings on this demonstration store. Applications sent to the address below are not processed.',
        ],
        list: ['Acoustic engineer — headphones', 'Industrial designer — consumer hardware', 'Frontend engineer — commerce'],
      },
    ],
    channels: [
      {
        label: 'Introduce yourself',
        value: 'careers@sonique.example',
        href: 'mailto:careers@sonique.example?subject=SONIQUE%20careers',
      },
    ],
    notice: DEMO_NOTICE,
  },

  affiliates: {
    eyebrow: 'Partners',
    title: 'Affiliates',
    intro: 'A straightforward programme for reviewers, publications and community builders.',
    sections: [
      {
        heading: 'How it works',
        body: [
          'Approved partners receive a tracking link and a flat share of completed orders. There is no fee to join and no minimum audience size.',
        ],
      },
      {
        heading: 'Status on this store',
        body: [
          'Affiliate tracking is not wired into this demonstration build, so applications cannot be processed here yet.',
        ],
      },
    ],
    channels: [
      {
        label: 'Programme enquiries',
        value: 'partners@sonique.example',
        href: 'mailto:partners@sonique.example?subject=SONIQUE%20affiliate%20programme',
      },
    ],
    notice: DEMO_NOTICE,
  },

  'gift-cards': {
    eyebrow: 'Gift cards',
    title: 'Gift Cards',
    intro: 'A balance that can be spent across the whole SONIQUE range.',
    sections: [
      {
        heading: 'How gift cards work here',
        body: [
          'Digital gift cards are issued as a code and never expire. They can be combined with a normal order balance.',
        ],
      },
      {
        heading: 'Not yet available in this demo',
        body: [
          'Code issuing and redemption are not implemented in this demonstration store, so no gift cards can be purchased or redeemed here. Nothing on this page will take a payment.',
        ],
      },
    ],
    cta: { label: 'Shop as normal', to: '/shop' },
    notice: DEMO_NOTICE,
  },

  'track-order': {
    eyebrow: 'Support',
    title: 'Track Order',
    intro:
      'Enter the order number and lookup token from your confirmation page. Both are on the confirmation screen and in the address of that page.',
    sections: [
      {
        heading: 'Where to find your details',
        body: [
          'Your confirmation URL looks like /order/SON-2026-1A2B3C?token=… . The order number is the SON-… part and the token is the long code after token=.',
        ],
      },
      {
        heading: 'Still stuck?',
        body: [
          'If you closed the confirmation page, we cannot look the order up from the number alone — that is deliberate, so one shopper cannot read another shopper’s address.',
        ],
      },
    ],
    cta: { label: 'Contact support', to: '/contact' },
  },

  returns: {
    eyebrow: 'Support',
    title: 'Returns & Exchanges',
    intro: 'Thirty days from delivery, on unopened items, for a full refund of the product price.',
    sections: [
      {
        heading: 'What is covered',
        body: [],
        list: [
          'Unopened products within 30 days of delivery',
          'Faulty products at any point inside the warranty period',
          'Exchanges for a different finish or model of equal value',
        ],
      },
      {
        heading: 'What is not covered',
        body: [],
        list: ['Cosmetic wear from normal use', 'Products with a removed serial label', 'Damage from liquid where the product is not rated for it'],
      },
      {
        heading: 'How to start a return',
        body: ['Reply to your order confirmation email with the order number and the reason for return.'],
      },
    ],
    channels: [
      {
        label: 'Returns desk',
        value: 'returns@sonique.example',
        href: 'mailto:returns@sonique.example?subject=Return%20request',
      },
    ],
    notice: DEMO_NOTICE,
  },

  warranty: {
    eyebrow: 'Support',
    title: 'Warranty',
    intro: 'Every current SONIQUE product carries a two-year warranty against manufacturing defects.',
    sections: [
      {
        heading: 'What the warranty covers',
        body: [],
        list: [
          'Driver failure that is not caused by impact or liquid',
          'Electronic faults in battery or noise-control circuitry',
          'Structural failures of the frame or yoke',
        ],
      },
      {
        heading: 'What it does not cover',
        body: [],
        list: ['Accidental damage', 'Normal battery ageing', 'Products bought from unauthorised sellers'],
      },
      {
        heading: 'Making a claim',
        body: ['Send the order number, a short description and a photo of the product.'],
      },
    ],
    channels: [
      {
        label: 'Warranty claims',
        value: 'warranty@sonique.example',
        href: 'mailto:warranty@sonique.example?subject=Warranty%20claim',
      },
    ],
    notice: DEMO_NOTICE,
  },

  'product-help': {
    eyebrow: 'Support',
    title: 'Product Help',
    intro: 'Setup, pairing and maintenance answers for headphones, earbuds, speakers and amplifiers.',
    sections: [
      {
        heading: 'Pairing',
        body: [
          'Hold the power control until the indicator pulses, then select the product in your device’s Bluetooth list. A product stores up to eight devices and reconnects to the last two.',
        ],
      },
      {
        heading: 'Noise control',
        body: [
          'Cycle noise control with a single press on the left cup. Adaptive mode adjusts to the room; maximum mode is tuned for aircraft cabins.',
        ],
      },
      {
        heading: 'Care',
        body: [
          'Wipe the housings with a dry microfibre cloth. Ear cushions are replaceable and can be removed without tools.',
        ],
      },
      {
        heading: 'Amplifier placement',
        body: [
          'Leave at least 50 mm of clearance above the chassis so the class-AB stage can dissipate heat.',
        ],
      },
    ],
    cta: { label: 'Contact support', to: '/contact' },
    notice: DEMO_NOTICE,
  },

  contact: {
    eyebrow: 'Support',
    title: 'Contact Us',
    intro:
      'Pick the desk that matches your question. These addresses are demonstration destinations and are not monitored.',
    sections: [
      {
        heading: 'Before you write',
        body: [
          'Have your order number ready — it is on the confirmation page and starts with SON-.',
        ],
      },
    ],
    channels: [
      { label: 'Order support', value: 'support@sonique.example', href: 'mailto:support@sonique.example?subject=Order%20support' },
      { label: 'Returns', value: 'returns@sonique.example', href: 'mailto:returns@sonique.example?subject=Return%20request' },
      { label: 'Warranty', value: 'warranty@sonique.example', href: 'mailto:warranty@sonique.example?subject=Warranty%20claim' },
      { label: 'Press', value: 'press@sonique.example', href: 'mailto:press@sonique.example?subject=Press%20enquiry' },
    ],
    cta: { label: 'Read the FAQs', to: '/faq' },
    notice: DEMO_NOTICE,
  },

  faq: {
    eyebrow: 'Help',
    title: 'Frequently Asked Questions',
    intro: 'The questions we are asked most often about ordering, shipping and the products.',
    sections: [
      {
        heading: 'What does shipping cost?',
        body: ['Orders of $99 and above ship free. Below that, shipping is a flat $12 per order.'],
      },
      {
        heading: 'Can I order without an account?',
        body: ['Yes. Browsing, the cart and the checkout all work as a guest. An account only stores saved items and your details for next time.'],
      },
      {
        heading: 'Is a payment taken in this store?',
        body: ['No. This is a demonstration store: checkout records an order and shows a confirmation, but no payment is processed and no card data is requested.'],
      },
      {
        heading: 'How do I track an order?',
        body: ['Use the order number and lookup token shown on your confirmation page.'],
      },
      {
        heading: 'Are the reviews real?',
        body: ['No. Ratings, review counts and testimonials on this store are sample demonstration content.'],
      },
    ],
    cta: { label: 'Track an order', to: '/track-order' },
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'What this demonstration store stores, and why.',
    sections: [
      {
        heading: 'What is stored',
        body: [],
        list: [
          'Your cart and saved items, kept in your own browser (localStorage)',
          'The email address you give the newsletter form, if you submit it',
          'Account email, display name and a salted password hash, if you create an account',
          'Order details you enter at checkout — name, contact details and shipping address',
        ],
      },
      {
        heading: 'What is never stored',
        body: ['No card numbers, no CVV codes and no payment credentials of any kind are requested or stored.'],
      },
      {
        heading: 'Your control',
        body: [
          'Clearing site data in your browser removes the local cart and saved items. Account and order records live in this store’s own database and need a support request to remove.',
        ],
      },
    ],
    cta: { label: 'Contact us', to: '/contact' },
    notice: DEMO_NOTICE,
  },

  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'The terms that apply to this demonstration storefront.',
    sections: [
      {
        heading: 'A demonstration store',
        body: [
          'This site exists to demonstrate a storefront. Products, prices, stock levels, ratings and testimonials are sample content and no commercial offer is being made.',
        ],
      },
      {
        heading: 'No payment processing',
        body: [
          'No payment instrument is collected and no funds are transferred. Orders recorded here are demonstration records.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: ['Do not attempt to disrupt the service or extract other shoppers’ order details.'],
      },
    ],
    notice: DEMO_NOTICE,
  },

  'cookie-preferences': {
    eyebrow: 'Legal',
    title: 'Cookie Preferences',
    intro: 'Exactly what this store keeps in your browser, and the one cookie it sets.',
    sections: [
      {
        heading: 'Strictly necessary',
        body: [
          'One cookie (sonique_session) is set only when you sign in, so the server can recognise your session. It is HttpOnly and expires after thirty days.',
        ],
      },
      {
        heading: 'Local storage, not cookies',
        body: [
          'Your cart and saved items are kept in your browser’s local storage, not in cookies, and are removed when you clear site data.',
        ],
      },
      {
        heading: 'No tracking or advertising',
        body: ['This store runs no analytics, advertising or third-party tracking scripts.'],
      },
    ],
    notice: DEMO_NOTICE,
  },
};
