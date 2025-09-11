module.exports = {
  ci: {
    collect: {
      staticDistDir: './_site',
      numberOfRuns: 3,
      url: [
        'http://localhost/index.html',
        'http://localhost/en/index.html',
        'http://localhost/2024-12-31/2024-end-words.html',
      ],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['warn', {minScore: 0.9}],
        'categories:pwa': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
