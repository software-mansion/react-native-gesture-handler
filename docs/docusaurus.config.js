const path = require('path');
const versions = require('./versions.json');

const allDocHomesPaths = [
  '/docs/',
  '/docs/next/',
  ...versions.slice(1).map(version => `/docs/${version}/`),
];

module.exports = {
  title: 'React Native Gesture Handler',
  tagline:
    'Declarative API exposing platform native touch and gesture system to React Native.',
  organizationName: 'software-mansion',
  projectName: 'react-native-gesture-handler',
  baseUrl: '/react-native-gesture-handler/',
  url: 'https://docs.swmansion.com',
  favicon: 'img/SWM_Fav_192x192.png',
  plugins: [
    [
      '@docusaurus/plugin-google-analytics',
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        createRedirects: function(path) {
          // redirect to /docs from /docs/getting-started,
          // as introduction has been made the home doc
          if (allDocHomesPaths.includes(path)) {
            return [`${path}/getting-started`];
          }
        },
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          homePageId: 'getting-started',
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/software-mansion/react-native-gesture-handler/tree/master/docs',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    disableDarkMode: true,
    prism: {
      theme: {
        plain: {
          color: '#ffffff',
          backgroundColor: '#001a72',
        },
        styles: [
          {
            types: ['comment'],
            style: {
              color: '#aaaaaa',
              fontStyle: 'italic',
            },
          },
          {
            types: ['string'],
            style: {
              color: '#ffffff',
            },
          },
          {
            types: ['punctuation'],
            style: {
              color: '#ffee86',
            },
          },
          {
            types: ['variable', 'constant', 'builtin', 'attr-name'],
            style: {
              color: '#a3b8ff',
            },
          },
          {
            types: ['number', 'operator'],
            style: {
              color: '#ffaaa8',
            },
          },
          {
            types: ['keyword'],
            style: {
              color: '#8ed3ef',
            },
          },
          {
            types: ['char'],
            style: {
              color: '#a3b8ff',
            },
          },
          {
            types: ['tag'],
            style: {
              color: '#ffaaa8',
            },
          },
          {
            types: ['function'],
            style: {
              color: '#a3b8ff',
            },
          },
        ],
      },
    },
    googleAnalytics: {
      trackingID: 'UA-41044622-6',
      anonymizeIP: true, // Should IPs be anonymized?
    },
    navbar: {
      title: 'React Native Gesture Handler',
      links: [
        {
          label: 'Docs',
          to: 'docs/getting-started', // "fake" link
          position: 'left',
          activeBaseRegex: `docs/(?!next)`,
          items: [
            {
              label: 'Master',
              to: 'docs/next/',
              activeBaseRegex: `docs/next`,
            },
            {
              label: versions[0],
              to: 'docs/',
              activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
            },
            ...versions.slice(1).map(version => ({
              label: version,
              to: `docs/${version}/`,
            })),
          ],
        },
        {
          href:
            'https://github.com/software-mansion/react-native-gesture-handler/',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
    },
  },
};
