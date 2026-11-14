import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'figures', test: /src[\/]figures[\/]/ },
          ],
        },
      },
    },
  },
  server: { port: 5199, strictPort: true },
  preview: { port: 5199 },
})
