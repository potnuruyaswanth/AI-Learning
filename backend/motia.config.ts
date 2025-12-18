import { defineConfig } from '@motiadev/core'
import endpointPlugin from '@motiadev/plugin-endpoint/plugin'
import logsPlugin from '@motiadev/plugin-logs/plugin'
import observabilityPlugin from '@motiadev/plugin-observability/plugin'
import statesPlugin from '@motiadev/plugin-states/plugin'
import bullmqPlugin from '@motiadev/plugin-bullmq/plugin'

// Get allowed origins from environment or use defaults
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  
  // Add Vercel URLs
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Add common Vercel preview URLs pattern
  origins.push('https://ai-assist-using-motia.vercel.app');
  origins.push('https://ai-learning-git-main-potnuruyaswanths-projects.vercel.app');
  
  return origins;
};

export default defineConfig({
  plugins: [observabilityPlugin, statesPlugin, endpointPlugin, logsPlugin, bullmqPlugin],
  server: {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },
})
