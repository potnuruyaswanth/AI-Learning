import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { extractGlossary } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'ExtractGlossary',
  type: 'api',
  path: '/api/ai/glossary/:fileId',
  method: 'POST',
  description: 'Extract key terms and glossary from the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        terms: z.array(z.object({
          term: z.string(),
          definition: z.string(),
          importance: z.enum(['high', 'medium', 'low']),
        })),
        totalTerms: z.number(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};

  logger.info('Extracting glossary', { userId: user.userId, fileId });

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

  logger.info('Extracting glossary with Gemini AI', { fileId });

  const result = await extractGlossary(file.content);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'glossary',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Glossary extracted successfully', { fileId, termCount: result.totalTerms });

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
