const siteConfig = {
  title: 'React Native Gesture Handler',
  tagline:
    'Declarative API exposing platform native touch and gesture system to React Native.',
  url: 'https://kmagiera.github.io',
  baseUrl: '/react-native-gesture-handler/',

  // Used for publishing and more
  projectName: 'react-native-gesture-handler',
  organizationName: 'kmagiera',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started', label: 'Docs' },
    { page: 'help', label: 'Help' },
    {
      href: 'https://github.com/kmagiera/react-native-gesture-handler',
      label: 'GitHub',
    },
    { search: true },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/ghlogo.svg',
  footerIcon: 'img/ghlogo.svg',
  favicon: 'img/favicon.png',

  /* colors for website */
  colors: {
    primaryColor: '#3F464F',
    secondaryColor: '#626D78',
  },

  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: 'Copyright © ' + new Date().getFullYear() + ' Software Mansion',

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'rainbow',
  },

  algolia: {
    apiKey: 'fc5e7cc8717893ac4fab5c1541116e02',
    indexName: 'react_native_gesture_handler',
  },

  // Add custom scripts here that would be placed in <script> tags
  scripts: ['https://buttons.github.io/buttons.js'],

  /* On page navigation for the current documentation page */
  onPageNav: 'separate',

  /* Open Graph and Twitter card images */
  ogImage: 'img/ghlogo.png',
  twitterImage: 'img/ghlogo.png',

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/kmagiera/react-native-gesture-handler',
  editUrl: 'https://github.com/kmagiera/react-native-gesture-handler/edit/master/docs/',
};

module.exports = siteConfig;
