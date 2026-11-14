import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import lessons from './build/vite-plugin-lessons.ts'

export default defineConfig({
  plugins: [react(), lessons()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React and the router change less often than the site, so browsers keep them cached across releases.
            { name: 'vendor', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/ },
            { name: 'figures', test: /src[\/]figures[\/]/ },
          ],
        },
      },
    },
  },
  server: { port: 5199, strictPort: true },
  preview: { port: 5199 },
})
