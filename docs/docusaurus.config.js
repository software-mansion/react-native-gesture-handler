const path = require('path');
const versions = require('./versions.json');
console.log(versions);

const allDocHomesPaths = [
  '/docs/next/',
  '/docs/',
  ...versions.slice(1).map(version => `/docs/${version}/`),
];

const baseUrl = process.env.BASE_URL || '/';

module.exports = {
  title: 'React Native Gesture Handler',
  tagline:
    'Declarative API exposing platform native touch and gesture system to React Native.',
  organizationName: 'software-mansion',
  projectName: 'react-native-gesture-handler',
  baseUrl,
  url: 'https://docs.swmansion.com',
  favicon: 'img/SWM_Fav_192x192.png',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        debug: false,
        docs: {
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
    colorMode: { disableSwitch: true },
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
      items: [
        // {
        //   label: 'Docs',
        //   to: 'docs/getting-started', // "fake" link
        //   position: 'right',
        //   activeBaseRegex: `docs/(?!next)`,
        //   items: [
        //     {
        //       label: 'Master',
        //       to: 'docs/',
        //       activeBaseRegex: `docs/next`,
        //     },
        //     {
        //       label: versions[0],
        //       to: 'docs/stable',
        //       activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
        //     },
        //     ...versions.slice(1).map(version => ({
        //       label: version,
        //       to: `docs/${version}/`,
        //     })),
        //   ],
        // },
        {
          href:
            'https://github.com/software-mansion/react-native-gesture-handler',
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
