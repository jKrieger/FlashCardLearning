import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    apple: {
      sizes: [180],
      padding: 0.3,
      resizeOptions: { background: '#14a085', fit: 'contain' }
    }
  },
  images: ['public/favicon.svg']
});
