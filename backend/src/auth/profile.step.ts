import { z } from 'zod';
import { getUsersCollection, ObjectId } from '../services/mongodb';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError } from '../errors/base.error';

export const config = {
  name: 'GetProfile',
  type: 'api',
  path: '/api/auth/profile',
  method: 'GET',
  description: 'Get current user profile',
  emits: [],
  flows: ['auth-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        user: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
          createdAt: z.string(),
        }),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;

  logger.info('Getting user profile', { userId: user.userId });

  const usersCollection = await getUsersCollection();
  const userData = await usersCollection.findOne({ _id: new ObjectId(user.userId) });

  if (!userData) {
    throw new NotFoundError('User not found');
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: {
          id: userData._id!.toString(),
          email: userData.email,
          name: userData.name,
          createdAt: userData.createdAt.toISOString(),
        },
      },
    },
  };
};
