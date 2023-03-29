import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const description = 'Aponia is epic!';

export default function HomePage() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title} - ${siteConfig.tagline}`} description={description}>
      <main className="mx-auto my-40 p-4">
        <a href="/docs/svelte/introduction" style={{
          background: '#317fb9',
          color: 'white',
          fontWeight: 600,
          width: '15rem',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginInline: 'auto',
          marginBlock: '12rem',
        }}>
          Go to tRPC + Svelte Docs
        </a>
      </main>
    </Layout>
  );
};
