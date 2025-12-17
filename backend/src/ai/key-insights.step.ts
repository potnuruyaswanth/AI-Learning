import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { extractKeyInsights } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'ExtractKeyInsights',
  type: 'api',
  path: '/api/ai/insights/:fileId',
  method: 'POST',
  description: 'Extract key insights from the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        insights: z.array(z.string()),
        mainTheme: z.string(),
        targetAudience: z.string(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};

  logger.info('Extracting key insights', { userId: user.userId, fileId });

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

  logger.info('Generating insights with Gemini AI', { fileId });

  const result = await extractKeyInsights(file.content);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'insights',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Insights extracted successfully', { fileId });

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
