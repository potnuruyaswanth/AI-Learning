import { z } from 'zod';
import { getFilesCollection, ObjectId } from '../services/mongodb';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const config = {
  name: 'ListFiles',
  type: 'api',
  path: '/api/files',
  method: 'GET',
  description: 'List all files uploaded by the current user',
  emits: [],
  flows: ['file-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        files: z.array(z.object({
          id: z.string(),
          originalName: z.string(),
          size: z.number(),
          createdAt: z.string(),
        })),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;

  logger.info('Listing files', { userId: user.userId });

  const filesCollection = await getFilesCollection();
  const files = await filesCollection
    .find({ userId: new ObjectId(user.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    status: 200,
    body: {
      success: true,
      data: {
        files: files.map(file => ({
          id: file._id!.toString(),
          originalName: file.originalName,
          size: file.size,
          createdAt: file.createdAt.toISOString(),
        })),
      },
    },
  };
};
