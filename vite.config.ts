import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'localized-preview-routes',
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          const request = req as typeof req & { url?: string }
          const [pathname, search] = (request.url ?? '/').split('?', 2)
          const route = pathname.match(/^\/(en|de|tr)(?:\/(about|projects|contact|3d|projects\/[^/]+))?\/?$/)
            ?? pathname.match(/^\/(about|projects|contact|3d|projects\/[^/]+)\/?$/)
          if (route && !pathname.endsWith('/')) {
            request.url = `${pathname}/index.html${search ? `?${search}` : ''}`
          }
          next()
        })
      },
    },
  ],
})
