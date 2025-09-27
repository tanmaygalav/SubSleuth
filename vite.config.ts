import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      // This section tells the dev server to always use port 5173
      server: {
        port: 5173,
      }
    })