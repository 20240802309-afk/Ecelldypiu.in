import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { config as dotenvConfig } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env file so process.env is available for serverless functions
dotenvConfig({ path: path.resolve(__dirname, '.env') })

// Plugin to serve Vercel serverless functions locally during development
function vercelApiPlugin() {
  return {
    name: 'vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()

        // Extract the function name from the URL
        const functionName = req.url.replace('/api/', '').split('?')[0]
        const functionPath = path.resolve(__dirname, 'api', `${functionName}.js`)

        try {
          // Dynamically import the serverless function
          // Convert to file:// URL (required on Windows) and add timestamp to bust cache
          const functionUrl = pathToFileURL(functionPath).href + `?t=${Date.now()}`
          const mod = await import(functionUrl)
          const handler = mod.default

          if (!handler) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: `No handler found for /api/${functionName}` }))
            return
          }

          // Collect body data
          let body = ''
          await new Promise((resolve) => {
            req.on('data', (chunk) => { body += chunk })
            req.on('end', resolve)
          })

          // Create a mock Vercel-style request
          const mockReq = {
            method: req.method,
            headers: req.headers,
            body: body ? JSON.parse(body) : undefined,
            query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams),
            url: req.url,
          }

          // Create a mock Vercel-style response
          const mockRes = {
            statusCode: 200,
            headers: {},
            setHeader(key, value) {
              this.headers[key] = value
              res.setHeader(key, value)
            },
            status(code) {
              this.statusCode = code
              return this
            },
            json(data) {
              res.statusCode = this.statusCode
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            },
            send(data) {
              res.statusCode = this.statusCode
              res.end(data)
            },
            end(data) {
              res.statusCode = this.statusCode
              res.end(data)
            },
          }

          await handler(mockReq, mockRes)
        } catch (err) {
          console.error(`[API Error] /api/${functionName}:`, err.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put react dependencies into their own chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            // Put firebase into its own chunk
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Put other libraries into a general vendor chunk
            return 'vendor';
          }
        },
      },
    },
    // Optional: increase the warning limit slightly if the chunks are still a bit large
    chunkSizeWarningLimit: 1000,
  },
})
