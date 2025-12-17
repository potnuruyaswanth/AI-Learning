import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { suggestRelatedTopics } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'SuggestRelatedTopics',
  type: 'api',
  path: '/api/ai/related-topics/:fileId',
  method: 'POST',
  description: 'Suggest related topics for further learning based on the file content',
  emits: [],
  flows: ['ai-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        topics: z.array(z.object({
          topic: z.string(),
          relevance: z.string(),
          searchQuery: z.string(),
        })),
        prerequisites: z.array(z.string()),
        advancedTopics: z.array(z.string()),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};

  logger.info('Suggesting related topics', { userId: user.userId, fileId });

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(fileId);
  } catch {
    throw new NotFoundError('Invalid file ID');
  }

  const filesCollection = await getFilesCollection();
  const file = await filesCollection.findOne({ _id: objectId });

  if (!file) {
    throw new NotFoundError('File not found');
  }

  if (file.userId.toString() !== user.userId) {
    throw new UnauthorizedError('You do not have access to this file');
  }

  logger.info('Suggesting topics with Gemini AI', { fileId });

  const result = await suggestRelatedTopics(file.content);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'related-topics',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Related topics suggested successfully', { fileId });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        ...result,
        fileId: fileId,
      },
    },
  };
};
