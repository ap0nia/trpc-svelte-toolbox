const { generateTypedocDocusaurusPlugins } = require('./plugins/typedoc');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'tRPC',
  tagline: 'Aponia is cool!',
  url: 'https://trpc-svelte-toolbox.vercel.app',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  projectName: 'trpc-svelte-toolbox',

  themeConfig: {
    disableSwitch: false,
    respectPrefersColorScheme: true,
    prism: {
      darkTheme: require('prism-react-renderer/themes/nightOwl'),
      theme: require('prism-react-renderer/themes/github'),
    },
    navbar: {
      title: 'tRPC + svelte',
      logo: { src: 'img/logo.png' }, 
      items: [
        {
          to: 'docs/svelte/setup',
          label: 'Svelte',
          activeBaseRegex: 'docs(/?)$',
        },
        {
          to: 'docs/sveltekit/introduction',
          label: 'SvelteKit',
        },
        {
         href: 'https://github.com/bevm0/trpc-svelte-toolbox.git',
          position: 'right',
          className: 'header-github-link',
          html: 'GitHub',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
       links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Usage with Svelte',
              to: 'docs/svelte/introduction',
            },
            {
              label: 'Usage with SvelteKit',
              to: 'docs/sveltekit/introduction',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/bevm0/trpc-svelte-toolbox.git',
              className: 'flex items-center',
            },
          ],
        },
      ],
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
    [
     'docusaurus-preset-shiki-twoslash',
     {
       themes: ["min-light", "nord"],
     },
    ]
  ],

  plugins: [
    ...generateTypedocDocusaurusPlugins([
      'trpc-svelte-query',
      'trpc-sveltekit'
    ]),
  ],
};

module.exports = config;
