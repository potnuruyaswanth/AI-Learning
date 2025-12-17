import { z } from 'zod';

export const config = {
  name: 'HealthCheck',
  type: 'api',
  path: '/api/health',
  method: 'GET',
  description: 'Health check endpoint',
  emits: [],
  flows: ['system-flow'],
  responseSchema: {
    200: z.object({
      status: z.string(),
      timestamp: z.string(),
    }),
  },
};

export const handler = async (_, { logger }) => {
  logger.info('Health check requested');

  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
};
