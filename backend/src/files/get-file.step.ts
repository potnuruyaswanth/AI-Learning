import { z } from 'zod';
import { getFilesCollection, ObjectId } from '../services/mongodb';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'GetFile',
  type: 'api',
  path: '/api/files/:id',
  method: 'GET',
  description: 'Get a specific file by ID',
  emits: [],
  flows: ['file-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        file: z.object({
          id: z.string(),
          originalName: z.string(),
          content: z.string(),
          size: z.number(),
          createdAt: z.string(),
        }),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { id } = req.pathParams || req.params || {};

  logger.info('Getting file', { userId: user.userId, fileId: id });

  let fileId: ObjectId;
  try {
    fileId = new ObjectId(id);
  } catch {
    throw new NotFoundError('Invalid file ID');
  }

  const filesCollection = await getFilesCollection();
  const file = await filesCollection.findOne({ _id: fileId });

  if (!file) {
    throw new NotFoundError('File not found');
  }

  // Check ownership
  if (file.userId.toString() !== user.userId) {
    throw new UnauthorizedError('You do not have access to this file');
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        file: {
          id: file._id!.toString(),
          originalName: file.originalName,
          content: file.content,
          size: file.size,
          createdAt: file.createdAt.toISOString(),
        },
      },
    },
  };
};
