import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@dashboards': path.resolve(__dirname, './src/dashboards'),
    },
  },

  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'supabase':      ['@supabase/supabase-js'],
          'query':         ['@tanstack/react-query'],
          'maps':          ['@vis.gl/react-google-maps', '@googlemaps/js-api-loader'],
          'firebase':      ['firebase'],
          'state':         ['zustand'],
        },
      },
    },
  },

  server: {
    port: 3000,
    host: true,         // expose on network (for mobile device testing)
    strictPort: true,
  },

  preview: {
    port: 4173,
    host: true,
  },
})
