import process from 'process';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: process.env.NODE_ENV === 'production' ? {
      preset: ['default', {
        discardComments: { removeAll: true }, // Remove all comments
        normalizeWhitespace: true, // Minify whitespaces
        mergeLonghand: true, // Optimize longhand CSS properties
        discardUnused: true // Remove unused CSS
      }]
    } : false
  }
}
