import { defineConfig } from '@motiadev/core'
import endpointPlugin from '@motiadev/plugin-endpoint/plugin'
import logsPlugin from '@motiadev/plugin-logs/plugin'
import observabilityPlugin from '@motiadev/plugin-observability/plugin'
import statesPlugin from '@motiadev/plugin-states/plugin'
import bullmqPlugin from '@motiadev/plugin-bullmq/plugin'

export default defineConfig({
  plugins: [observabilityPlugin, statesPlugin, endpointPlugin, logsPlugin, bullmqPlugin],
  server: {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        // Add your Vercel URL here (replace with your actual URL)
        process.env.FRONTEND_URL || 'https://ai-assist-using-motia.vercel.app',
      ],
      credentials: true,
    },
  },
})
