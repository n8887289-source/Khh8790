export type ContentSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type ContentPage = {
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  variant?: 'article' | 'faq' | 'contact';
  sections: ContentSection[];
  cta?: { label: string; to: string };
};

/**
 * Editorial and support copy. Every page here is reachable from the header,
 * footer or a support link, so no navigation link leads nowhere.
 *
 * These pages deliberately describe what this storefront actually does — no
 * policy claims a capability the application does not have.
 */
export const CONTENT_PAGES: Record<string, ContentPage> = {
  explore: {
    path: '/explore',
    eyebrow: 'Explore',
    title: 'Explore SONIQUE',
    intro:
      'The full range, the thinking behind it, and the standards we hold ourselves to. Start anywhere.',
    sections: [
      {
        heading: 'The collection',
        body: [
          'Sixteen products across five categories, from open-back studio headphones to a floorstanding loudspeaker.',
        ],
        bullets: [
          'Headphones — immersive, refined, built for long sessions',
          'Earbuds — small size, massive sound',
          'Speakers — music for every moment',
          'Amplifiers — power meets precision',
          'Accessories — cases and cables that finish the set',
        ],
      },
      {
        heading: 'Sound lives deeper',
        body: [
          'Every product in the range is tuned against the same reference, so moving between them should feel like moving rooms in the same building rather than changing brands.',
        ],
      },
    ],
    cta: { label: 'Shop the collection', to: '/shop' },
  },

  story: {
    path: '/story',
    eyebrow: 'More than sound',
    title: 'Our Story',
    intro:
      'SONIQUE began with a simple frustration: good sound was being sold as a specification instead of an experience.',
    sections: [
      {
        heading: 'A deeper connection',
        body: [
          'Music moves us. It sharpens focus, fuels creativity, and brings us closer. At SONIQUE, we design audio technology for the moments that matter.',
          'That means tuning by ear as well as by instrument, testing in real rooms rather than only in anechoic chambers, and keeping every product serviceable for years of listening.',
        ],
      },
      {
        heading: 'How we work',
        bullets: [
          'Reference tuning across the whole range, so a playlist sounds like itself everywhere',
          'Materials chosen for a long life: machined aluminium, replaceable parts, no glued-shut batteries',
          'Firmware improvements released for products already in customers’ hands',
        ],
      },
      {
        heading: 'Where we are going',
        body: [
          'A brighter tomorrow means lower impact per hour of listening: more recycled aluminium, packaging without plastic, and repairable designs that outlast trends.',
        ],
      },
    ],
    cta: { label: 'Our Impact', to: '/sustainability' },
  },

  sustainability: {
    path: '/sustainability',
    eyebrow: 'Sustainable tech for a louder tomorrow',
    title: 'Join a Louder Tomorrow',
    intro: 'Better sound. A brighter, more connected world.',
    sections: [
      {
        heading: 'Design that lasts longer',
        bullets: [
          'Replaceable ear cushions, cables and batteries on every over-ear model',
          'Service guides published so repairs are possible outside warranty',
          'Firmware updates for products already in the field',
        ],
      },
      {
        heading: 'Materials',
        bullets: [
          'Recycled aluminium enclosures across the headphone range',
          'Plastic-free packaging, printed with soy inks',
          'Braided cables instead of coated PVC where possible',
        ],
      },
      {
        heading: 'What these pages are',
        body: [
          'This is a demonstration storefront. These commitments describe the brand identity built for it and are not audited certifications. Any real sustainability claim should be verified against documentation before it is published.',
        ],
      },
    ],
    cta: { label: 'Read our story', to: '/story' },
  },

  press: {
    path: '/press',
    eyebrow: 'Press',
    title: 'Press & Media',
    intro: 'Resources for journalists, reviewers and partners.',
    sections: [
      {
        heading: 'Review samples',
        body: [
          'Review units are arranged through the contact page. Tell us the outlet, the publication date and which product you would like.',
        ],
      },
      {
        heading: 'Press assets',
        body: [
          'Product imagery and logo files are not published for download yet. Request the asset pack through the contact page and it will be sent on once available.',
        ],
      },
    ],
    cta: { label: 'Contact the team', to: '/support/contact' },
  },

  careers: {
    path: '/careers',
    eyebrow: 'Careers',
    title: 'Work With Us',
    intro:
      'No positions are open at the moment. This page is the place they will be listed first.',
    sections: [
      {
        heading: 'What we hire for',
        bullets: [
          'Acoustic and DSP engineering',
          'Industrial design',
          'Customer support across time zones',
        ],
      },
      {
        heading: 'Speculative applications',
        body: [
          'Send a short note through the contact page about the work you do. Messages are stored with this store and read by the team operating it.',
        ],
      },
    ],
    cta: { label: 'Send an introduction', to: '/support/contact' },
  },

  affiliates: {
    path: '/affiliates',
    eyebrow: 'Affiliates',
    title: 'Affiliate Programme',
    intro: 'An affiliate programme is not live yet, and there is no tracking or referral system built into this store.',
    sections: [
      {
        heading: 'Interested?',
        body: [
          'Tell us about your audience through the contact page. When a programme launches, the people who register interest will be the first to hear.',
        ],
      },
      {
        heading: 'What is not available',
        body: [
          'There are no referral links, discount codes or commission reporting yet. Nothing on this storefront tracks affiliate activity.',
        ],
      },
    ],
    cta: { label: 'Register interest', to: '/support/contact' },
  },

  'gift-cards': {
    path: '/gift-cards',
    eyebrow: 'Gift cards',
    title: 'Gift Cards',
    intro:
      'Digital gift cards are not on sale yet — this store has no payment provider configured, so cards cannot be bought or redeemed online.',
    sections: [
      {
        heading: 'Coming soon',
        body: [
          'Gift cards will appear here once payments are connected. Until then, nothing on this site can charge a card.',
        ],
      },
      {
        heading: 'In the meantime',
        body: [
          'A product from the collection makes an easy gift, and free shipping applies to orders over $99.',
        ],
      },
    ],
    cta: { label: 'Browse the collection', to: '/shop' },
  },

  'support/track-order': {
    path: '/support/track-order',
    eyebrow: 'Support',
    title: 'Track Your Order',
    intro:
      'Order status is looked up from this store using your order number and the email address the order was placed with.',
    sections: [
      {
        heading: 'How to find your order',
        bullets: [
          'Your order number starts with SQ- and appears on the confirmation page',
          'Enter it with the email address used at checkout',
          'Both must match before the order details are shown',
        ],
      },
      {
        heading: 'Order statuses',
        body: [
          'Orders placed on this storefront are recorded as demo orders because no payment provider is connected. No shipment is dispatched for demo orders.',
        ],
      },
    ],
    cta: { label: 'Look up an order', to: '/account' },
  },

  'support/returns': {
    path: '/support/returns',
    eyebrow: 'Support',
    title: 'Returns & Exchanges',
    intro: 'Thirty days from delivery, for any reason, on products bought from this store.',
    sections: [
      {
        heading: 'How it works',
        bullets: [
          'Start a return within 30 days of delivery through the contact page',
          'Include the order number from your confirmation',
          'Products should be returned in a resaleable condition with accessories',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Refunds are issued to the original payment method. Because this demonstration store takes no payments, returns here are recorded but no money changes hands.',
        ],
      },
    ],
    cta: { label: 'Start a return', to: '/support/contact' },
  },

  'support/warranty': {
    path: '/support/warranty',
    eyebrow: 'Support',
    title: 'Warranty',
    intro: 'Every SONIQUE product carries a two year warranty against manufacturing defects.',
    sections: [
      {
        heading: 'What is covered',
        bullets: [
          'Driver failure that is not caused by accident or misuse',
          'Battery faults within normal charging behaviour',
          'Manufacturing defects in enclosures, hinges and connectors',
        ],
      },
      {
        heading: 'What is not covered',
        bullets: [
          'Accidental damage, liquid damage beyond the stated IP rating, or normal wear on ear cushions',
          'Products bought from an unauthorised seller',
        ],
      },
    ],
    cta: { label: 'Make a claim', to: '/support/contact' },
  },

  'support/product-help': {
    path: '/support/product-help',
    eyebrow: 'Support',
    title: 'Product Help',
    intro: 'Getting started, pairing and troubleshooting.',
    sections: [
      {
        heading: 'Pairing',
        bullets: [
          'Slide the power switch and hold for three seconds to enter pairing mode',
          'Choose SONIQUE in your device bluetooth list',
          'The A1 also accepts a wired 3.5mm connection with no power required',
        ],
      },
      {
        heading: 'Battery and charging',
        bullets: [
          'Use the supplied USB-C cable; a full charge takes about two hours',
          'Fast charging gives roughly five hours of playback from a ten minute charge',
        ],
      },
      {
        heading: 'Still stuck?',
        body: [
          'Send the product name and a short description of the problem through the contact page.',
        ],
      },
    ],
    cta: { label: 'Ask for help', to: '/support/contact' },
  },

  'support/contact': {
    path: '/support/contact',
    eyebrow: 'Support',
    title: 'Contact Us',
    intro: 'Send a message and it will be stored with this store for the team to read.',
    variant: 'contact',
    sections: [
      {
        heading: 'Before you write',
        bullets: [
          'For an order, include the SQ- order number',
          'For a product, include the model name',
          'For a return, use the Returns & Exchanges page first',
        ],
      },
      {
        heading: 'How replies work',
        body: [
          'No email provider is connected to this store, so submitting the form stores your message in its database rather than sending an email, and a reply may take longer than usual.',
        ],
      },
    ],
  },

  'support/faqs': {
    path: '/support/faqs',
    eyebrow: 'Support',
    title: 'Frequently Asked Questions',
    intro: 'The questions that come up most often about ordering from this store.',
    variant: 'faq',
    sections: [
      {
        heading: 'Do I need an account to shop?',
        body: [
          'No. Browsing, adding to the cart and saving favourites all work without signing in. There is no sign-in system configured at all yet.',
        ],
      },
      {
        heading: 'Will I be charged at checkout?',
        body: [
          'No. No payment provider is connected to this store, so checkout records a demo order and takes no money. Card details are never requested or stored.',
        ],
      },
      {
        heading: 'Where is my cart saved?',
        body: [
          'In this browser, so it survives a refresh. Prices are recalculated on the server when you place an order.',
        ],
      },
      {
        heading: 'How much is shipping?',
        body: ['Free on orders of $99 or more. Below that a flat $9.95 is added at checkout.'],
      },
      {
        heading: 'Are the reviews real?',
        body: [
          'No. Ratings, review counts, testimonials and the product line-up are sample content built for this demonstration storefront.',
        ],
      },
      {
        heading: 'How do I find my order?',
        body: ['Use the order lookup on the account page with your order number and email address.'],
      },
    ],
    cta: { label: 'Look up an order', to: '/account' },
  },

  privacy: {
    path: '/privacy',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'What this storefront stores, and where it is kept.',
    sections: [
      {
        heading: 'What is stored on your device',
        bullets: [
          'Your cart, kept in browser local storage so it survives a refresh',
          'Your favourites list, kept in browser local storage on the same device',
          'Nothing else: no analytics, no advertising identifiers, no third-party tracking scripts',
        ],
      },
      {
        heading: 'What is stored in our database',
        bullets: [
          'When you place an order: your name, email, optional phone number, delivery address, order lines and totals',
          'When you subscribe: your email address',
          'When you contact us: your name, email, chosen topic and message',
        ],
      },
      {
        heading: 'Payments',
        body: [
          'This store has no payment provider connected. Payment card details are never requested and never stored.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'Clearing your browser storage removes your cart and favourites. To have an order, subscription or message removed, contact us with the details so it can be deleted from the database.',
        ],
      },
    ],
    cta: { label: 'Contact us', to: '/support/contact' },
  },

  terms: {
    path: '/terms',
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'The basis on which this storefront is provided.',
    sections: [
      {
        heading: 'A demonstration store',
        body: [
          'This site is a demonstration e-commerce storefront. Product names, descriptions, prices, ratings and testimonials are sample content and do not describe real products available for sale.',
        ],
      },
      {
        heading: 'Orders',
        body: [
          'Placing an order records it in this store’s database with the status of a demo order. No payment is taken, no goods are dispatched, and no contract of sale is formed.',
        ],
      },
      {
        heading: 'Acceptable use',
        bullets: [
          'Do not attempt to disrupt the service or access data that is not yours',
          'Do not submit unlawful or abusive content through contact forms',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'The storefront is provided as-is for demonstration purposes, without warranties of any kind.',
        ],
      },
    ],
  },

  cookies: {
    path: '/cookies',
    eyebrow: 'Legal',
    title: 'Cookie Preferences',
    intro: 'This storefront sets no tracking cookies, so there is nothing to consent to.',
    sections: [
      {
        heading: 'What is used',
        bullets: [
          'No analytics cookies and no advertising cookies',
          'Your cart and favourites use browser local storage, not cookies, and are never sent to a third party',
        ],
      },
      {
        heading: 'If that changes',
        body: [
          'Should a provider that requires cookies be connected later, a consent control would appear here before any such cookie is set.',
        ],
      },
    ],
    cta: { label: 'Read the privacy policy', to: '/privacy' },
  },
};
