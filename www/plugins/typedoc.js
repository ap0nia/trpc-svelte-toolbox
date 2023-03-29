function generateTypedocDocusaurusPlugins(directories) {
  return directories.map((directory, idx) => [
    'docusaurus-plugin-typedoc',
    {
      id: directory,
      entryPoints: [`../packages/${directory}/src/index.ts`],
      tsconfig: `../packages/${directory}/tsconfig.json`,
      out: `./typedoc/${directory}`,
      readme: 'none',
      excludeInternal: true,
      excludePrivate: true,
      excludeProtected: true,
      sidebar: {
        categoryLabel: `@trpc/${directory}`,
        position: idx,
      },
      frontmatterGlobals: {
        pagination_prev: null,
        pagination_next: null,
        custom_edit_url: null,
      },
    },
  ]);
}

module.exports = { generateTypedocDocusaurusPlugins };
