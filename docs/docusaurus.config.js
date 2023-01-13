/** @type {import('@docusaurus/types').DocusaurusConfig} */

const prismConfig = {
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
};
/*
In swizzled components look for "SWM -" string to see our modifications
*/

module.exports = {
  title: 'React Native Gesture Handler',
  tagline: 'Declarative API exposing platform native touch and gesture system to React Native.',
  url: 'https://docs.swmansion.com',
  baseUrl: '/react-native-gesture-handler/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/SWM_Fav_192x192.png',
  organizationName: 'software-mansion',
  customFields: {
    shortTitle: 'Gesture Handler',
  },
  projectName: 'react-native-gesture-handler',
  themeConfig: {
    algolia: {
      appId: 'BKGDKVWG6F',
      apiKey: '742696612cb124b06465cf68bce6ec92',
      indexName: 'react-native-gesture-handler',
      // contextualSearch: true, // doesn't work for some reason
    },
    colorMode: {
      disableSwitch: true,
    },
    navbar: {
      title: 'React Native Gesture Handler',
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          className: 'github-navbar-logo',
          href: 'https://github.com/software-mansion/react-native-gesture-handler/',
          label: 'Github',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Software Mansion',
        src: 'img/swmLogo.svg',
        href: 'https://swmansion.com/',
      },
    },
    prism: {
      theme: prismConfig,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: undefined, // hide edit button
          versions: {
            '2.4.0': {
              label: '2.4.0 – 2.5.0',
            },
            '2.6.0': {
              label: '2.6.0 – 2.9.0',
            },
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: {
          trackingID: 'UA-41044622-6',
          anonymizeIP: true, // Should IPs be anonymized?
        },
      },
    ],
  ],
};
