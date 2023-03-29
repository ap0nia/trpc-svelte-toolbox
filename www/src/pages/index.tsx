import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';

const HomeContent: React.FC = () => {
  return (
    <main className="container px-6 mx-auto space-y-28">
    hi
    </main>
  );
};

const HomeHead: React.FC = () => {
  return (
    <Head>
      <body className="homepage" />
      <script async src="https://platform.twitter.com/widgets.js" />
      <link
        rel="preload"
        href="https://assets.trpc.io/www/v10/v10-dark-landscape.png"
        as="image"
      />
      <link
        rel="preload"
        href="https://assets.trpc.io/www/v10/preview-dark.png"
        as="image"
      />
    </Head>
  );
};

const HomePage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="End-to-end typesafe APIs made easy. Automatic typesafety & autocompletion inferred from your API-paths, their input data, &amp; outputs 🧙‍♂️"
    >
      <HomeHead />
      <HomeContent />
    </Layout>
  );
};
export default HomePage;
