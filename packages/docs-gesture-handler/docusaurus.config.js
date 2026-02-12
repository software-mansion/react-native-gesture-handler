/*
In swizzled components look for "SWM -" string to see our modifications
*/

const lightCodeTheme = require('./src/theme/CodeBlock/highlighting-light.js');
const darkCodeTheme = require('./src/theme/CodeBlock/highlighting-dark.js');
// @ts-check
const webpack = require('webpack');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Native Gesture Handler',
  favicon: 'img/favicon.ico',

  url: 'https://docs.swmansion.com',

  baseUrl: '/react-native-gesture-handler/',

  organizationName: 'software-mansion',
  projectName: 'react-native-gesture-handler',
  customFields: {
    shortTitle: 'Gesture Handler',
  },

  scripts: [
    {
      src: '/react-native-gesture-handler/js/snack-helpers.js',
      async: true,
    },
  ],

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
          editUrl:
            'https://github.com/software-mansion/react-native-gesture-handler/edit/main/docs',
          lastVersion: 'current', // <- this makes 2.x docs as default
          versions: {
            current: {
              label: '3.x',
            },
          },
        },
        theme: {
          customCss: require.resolve('./src/css/index.css'),
        },
        googleAnalytics: {
          trackingID: 'UA-41044622-6',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-image.png',
      metadata: [
        { name: 'og:image:width', content: '1200' },
        { name: 'og:image:height', content: '630' },
      ],
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'React Native Gesture Handler',
        hideOnScroll: true,
        logo: {
          alt: 'React Native Gesture Handler',
          src: 'img/logo-hero.svg',
        },
        items: [
          {
            to: 'docs/',
            activeBasePath: 'docs',
            label: 'Docs',
            position: 'right',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
          },
          {
            href: 'https://github.com/software-mansion/react-native-gesture-handler',
            position: 'right',
            className: 'header-github',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      // React Native Paradise banner
      announcementBar: {
        id: 'react-native-paradise-2025',
        content: ' ',
        backgroundColor: '#fff5f7',
        textColor: '#001a72',
      },
      footer: {
        style: 'light',
        links: [],
        copyright:
          'All trademarks and copyrights belong to their respective owners.',
      },
      prism: {
        additionalLanguages: ['bash'],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'BKGDKVWG6F',
        apiKey: '742696612cb124b06465cf68bce6ec92',
        indexName: 'react-native-gesture-handler',
      },
    }),
  plugins: [
    ...[
      process.env.NODE_ENV === 'production' && '@docusaurus/plugin-debug',
      process.env.NODE_ENV === 'production' && [
        '@docusaurus/plugin-google-tag-manager',
        {
          containerId: 'GTM-PHF2NKVT',
        },
      ],
    ].filter(Boolean),
    async function reanimatedDocusaurusPlugin(context, options) {
      return {
        name: 'react-native-reanimated/docusaurus-plugin',
        configureWebpack(config, isServer, utils) {
          const processMock = !isServer ? { process: { env: {} } } : {};

          const raf = require('raf');
          raf.polyfill();

          return {
            mergeStrategy: {
              'resolve.extensions': 'prepend',
            },
            plugins: [
              new webpack.DefinePlugin({
                ...processMock,
                __DEV__: 'false',
              }),
            ],
            module: {
              rules: [
                {
                  test: /\.txt$/,
                  type: 'asset/source',
                },
                {
                  test: /\.tsx?$/,
                  use: 'babel-loader',
                },
              ],
            },
            resolve: {
              alias: { 'react-native$': 'react-native-web' },
              extensions: ['.web.js', '...'],
            },
          };
        },
      };
    },
  ],
};

module.exports = config;
