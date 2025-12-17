import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { summarizeContent } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'SummarizeFile',
  type: 'api',
  path: '/api/ai/summarize/:fileId',
  method: 'POST',
  description: 'Generate a summary of the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        summary: z.string(),
        wordCount: z.number(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};

  logger.info('Summarizing file', { userId: user.userId, fileId });

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

  // Check ownership
  if (file.userId.toString() !== user.userId) {
    throw new UnauthorizedError('You do not have access to this file');
  }

  logger.info('Generating summary with Gemini AI', { fileId });

  // Generate summary using Gemini
  const result = await summarizeContent(file.content);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'summarize',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Summary generated successfully', { fileId, wordCount: result.wordCount });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        summary: result.summary,
        wordCount: result.wordCount,
        fileId: fileId,
      },
    },
  };
};
