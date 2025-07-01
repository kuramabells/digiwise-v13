import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: 'crypto', replacement: 'crypto-browserify' },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'util', replacement: 'util' },
      { find: 'process', replacement: 'process/browser' },
      { find: 'buffer', replacement: 'buffer' },
      { find: 'http', replacement: 'stream-http' },
      { find: 'https', replacement: 'https-browserify' },
      { find: 'os', replacement: 'os-browserify/browser' },
      { find: 'zlib', replacement: 'browserify-zlib' },
      { find: 'path', replacement: 'path-browserify' }
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      strict: false
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    }
  },
  esbuild: {
    target: 'es2020',
    supported: {
      'top-level-await': true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: /node_modules/
    },
    minify: 'esbuild',
    chunkSizeWarningLimit: 3000,
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks: (id) => {
          if (!id) return 'vendor';
          if (id.includes('node_modules')) {
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            if (id.includes('@mui/')) {
              return 'mui';
            }
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      }
    }
  },
  clearScreen: true
});
