/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'IMZODEV: Tu guía para dominar la IA y automatización',
  author: 'imzodev',
  headerTitle: 'IMZODEV',
  description:
    'Tu guía para dominar la IA y automatización. Descubre tutoriales innovadores, herramientas gratis y trucos exclusivos.',
  language: 'es-mx',
  theme: 'system', // system, dark or light
  siteUrl: 'https://imzodev.online',
  siteRepo: 'https://github.com',
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/imzodev_logo.jpg`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.jpg`,
  // mastodon: 'https://mastodon.social/@mastodonuser',
  email: 'imzodev@gmail.com',
  github: 'https://github.com/imzodev',
  x: 'https://twitter.com/imzodev',
  // twitter: 'https://twitter.com/Twitter',
  facebook: 'https://facebook.com/imzodev',
  youtube: 'https://youtube.com/@imzodev',
  linkedin: 'https://www.linkedin.com/in/imzodev',
  // threads: 'https://www.threads.net',
  // instagram: 'https://www.instagram.com/imzodev',
  // medium: 'https://medium.com',
  // bluesky: 'https://bsky.app/',
  locale: 'es-MX',
  // set to true if you want a navbar fixed to the top
  stickyNav: false,
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      // You may also need to overwrite the script if you're storing data in the US - ex:
      // src: 'https://us.umami.is/script.js'
      // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // If you are hosting your own Plausible.
    //   src: '', // e.g. https://plausible.my-domain.com/js/script.js
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  newsletter: {
    // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus, beehive
    // Please add your .env file and modify it according to your selection
    provider: 'buttondown',
  },
  // comments: {
  //   // To use an analytics provider, include it in the content security policy
  //   // in the `next.config.js` file. Choose a provider and configure the
  //   // corresponding environment variables.
  //   // https://vercel.com/docs/environment-variables
  //   provider: 'giscus', // supported providers: giscus, utterances, disqus
  //   giscusConfig: {
  //     // Visit the link below, and follow the steps in the 'configuration' section
  //     // https://giscus.app/
  //     repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  //     repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
  //     category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  //     categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  //     mapping: 'pathname', // supported options: pathname, url, title
  //     reactions: '1', // Emoji reactions: 1 = enable / 0 = disable
  //     // Periodically transmit discussion metadata to the parent window: 1 = enable / 0 = disable
  //     metadata: '0',
  //     // theme example: light, dark, dark_dimmed, dark_high_contrast
  //     // transparent_dark, preferred_color_scheme, custom
  //     theme: 'light',
  //     // theme when dark mode
  //     darkTheme: 'transparent_dark',
  //     // For custom theme, provide a URL to your CSS file
  //     // For instance: https://giscus.app/themes/custom_example.css
  //     themeURL: '',
  //     // Sets the language attribute in giscus's HTML configuration
  //     lang: 'en',
  //   },
  // },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`, // path to load documents to search
    },
    // Uncomment and configure for Algolia search
    // provider: 'algolia',
    // algoliaConfig: {
    //   // Algolia-provided application identifier
    //   appId: 'R2IYF7ETH7',
    //   // Public API key (safe for version control)
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
