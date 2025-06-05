import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import remixConfig from "./remix.config";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";
import viteCompression from 'vite-plugin-compression';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  server: { 
    hmr: process.env.NODE_ENV === 'development', 
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true
  },
  plugins: [
    tsconfigPaths(),
    remix({
      ...remixConfig,
      presets: [vercelPreset],
    }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    ...(
      process.env.ANALYZE === 'true' ?
        [visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        })] : []
    ),
  ],
  ssr: {
    noExternal: ["remix-i18next", "remix-i18next", "i18next-http-backend", "i18next-browser-languagedetector", "remix-i18next", "i18next-fs-backend", "i18next-*"],
    external: [
      "@aws-sdk/client-s3", // AWS SDK is large and should be externalized
      "bcryptjs",             // Heavy native modules
    ]
  },
  resolve: {
    alias: {
      ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js",
    },
  },
  esbuild: {
    pure: ['console.log'],
    legalComments: 'none',
    minifySyntax: true,
    minifyIdentifiers: true,
    minifyWhitespace: true,
    treeShaking: true,
  },
  build: {
    minify: 'esbuild',
    cssMinify: 'esbuild',
    target: "esnext",
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false, // Remove unused imports effectively
        preset: "smallest"
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        sourcemapExcludeSources: false,
      }
    },
  },
  optimizeDeps: {
    exclude: ["@aws-sdk/client-s3"],
    include: [
      "react",
      "react-dom",
      'next-themes',
      '@remix-run/react', // Core Remix
      '@radix-ui/react-*', // Radix components
      'reactflow',         // Heavy UI
      'framer-motion',     // Animation
      '@aws-sdk/client-s3' // AWS SDK
    ],
  },
});