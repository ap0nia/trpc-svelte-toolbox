// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { parseEnv } = require('./src/utils/env');
const { generateTypedocDocusaurusPlugins } = require('./docusaurus.typedoc.js');
const env = parseEnv(process.env);

const poweredByVercel = `
  <div style="padding-top: 24px;">
    <a
      href="https://vercel.com/?utm_source=trpc&utm_campaign=oss"
      target="_blank"
      rel="noreferrer"
    >
      <img
        src="/img/powered-by-vercel.svg"
        alt="Powered by Vercel"
        style="height: 40px;display:inline-block;box-shadow: 0px 0px 32px rgba(255, 255, 255, 0.2);"
      />
    </a>
  </div>
`.trim();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'tRPC',
  tagline: 'Move Fast and Break Nothing.\nEnd-to-end typesafe APIs made easy.',
  url: 'https://trpc.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'trpc',
  projectName: 'trpc',

  themeConfig: {
    disableSwitch: false,
    respectPrefersColorScheme: true,
    image: `${env.OG_URL}/api/landing?cache-buster=${new Date().getDate()}`,
    prism: {
      theme: require('prism-react-renderer/themes/vsDark'),
    },
    navbar: {
      title: 'tRPC',
      logo: {
        alt: 'tRPC logo',
        src: 'img/logo.svg',
      }, 
      items: [
        {
          to: 'docs/svelte/setup',
          label: 'Docs',
          activeBaseRegex: 'docs(/?)$',
        },
        {
          to: 'docs/sveltekit/introduction',
          label: 'Using SvelteKit',
        },
        {
          href: 'https://github.com/trpc/trpc',
          position: 'right',
          className: 'header-social-link header-github-link',
          'aria-label': 'GitHub',
        },
        {
          href: 'https://twitter.com/trpcio',
          position: 'right',
          className: 'header-social-link header-twitter-link',
          'aria-label': 'Twitter',
        },
        {
          href: 'https://trpc.io/discord',
          position: 'right',
          className: 'header-social-link header-discord-link',
          'aria-label': 'Discord',
        },
      ],
    },
    footer: {
       links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Docs',
              to: 'docs/svelte/introduction',
            },
            {
              label: 'Usage with SvelteKit',
              to: 'docs/sveltekit/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/trpc/trpc/tree/main',
              className: 'flex items-center',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/alexdotjs',
              className: 'flex items-center',
            },
            {
              label: 'Discord',
              href: 'https://trpc.io/discord',
              className: 'flex items-center',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/trpc/trpc/tree/main',
              className: 'flex items-center',
            },
            {
              label: '❤️ Sponsor tRPC',
              href: 'https://trpc.io/sponsor',
              className: 'flex items-center',
            },
          ],
        },
      ],
      copyright: poweredByVercel,
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          lastVersion: 'current',
          versions: {
            current: {
              label: '10.x',
              badge: true,
              className: 'v10',
              banner: 'none',
            },
          },
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/trpc/trpc/tree/main/www/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/trpc/trpc/tree/main/www/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
    [
     'docusaurus-preset-shiki-twoslash',
     {
       themes: ['../../../../../../www/min-light-with-diff', 'github-dark'],
     },
    ],
  ],

  plugins: [
    ...generateTypedocDocusaurusPlugins([
      'trpc-svelte-query',
      'trpc-sveltekit'
    ]),
    async function myPlugin() {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          if (process.env.NODE_ENV === 'production') {
            postcssOptions.plugins.push(require('cssnano'));
          }
          return postcssOptions;
        },
      };
    },
  ],

  clientModules: [
    require.resolve('./docusaurus.preferredTheme.js'),
  ],
  customFields: { env },
};

module.exports = config;
