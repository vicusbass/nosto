module.exports = {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
