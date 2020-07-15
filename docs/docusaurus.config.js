const versions = require('./versions.json');

module.exports = {
  title: 'React Native Gesture Handler',
  tagline:
    'Declarative API exposing platform native touch and gesture system to React Native.',
  url: 'https://docs.swmansion.com/react-native-gesture-handler/',
  baseUrl: '/react-native-gesture-handler/',
  favicon: 'img/SWM_Fav_192x192.png',
  organizationName: 'software-mansion', // Usually your GitHub org/user name.
  projectName: 'react-native-gesture-handler', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    googleAnalytics: {
      trackingID: 'UA-41044622-6',
      anonymizeIP: true, // Should IPs be anonymized?
    },
    navbar: {
      title: 'React Native Gesture Handler',
      links: [
        {
          label: 'Docs',
          to: 'docs/getting-started',
          position: 'left',
          activeBaseRegex: `docs/(?!next)`,
          items: [
            {
              label: versions[0],
              to: 'docs/',
              activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
            },
            {
              label: 'Master',
              to: 'docs/next/',
              activeBasePath: 'docs/next',
            },
            ...versions.slice(1).map(version => ({
              label: version,
              to: `docs/${version}/`,
            })),
          ],
        },
        {
          href:
            'https://github.com/software-mansion/react-native-gesture-handler',
          label: '',
          position: 'right',
        },
      ],
    },
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
      // darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    footer: {
      style: 'dark',
    },
  },
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
};
