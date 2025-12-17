import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { generateFlashcards } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

export const config = {
  name: 'GenerateFlashcards',
  type: 'api',
  path: '/api/ai/flashcards/:fileId',
  method: 'POST',
  description: 'Generate study flashcards from the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        flashcards: z.array(z.object({
          front: z.string(),
          back: z.string(),
          category: z.string(),
        })),
        totalCards: z.number(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};
  const numberOfCards = 10; // Default to 10 flashcards

  logger.info('Generating flashcards', { userId: user.userId, fileId, numberOfCards });

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

  logger.info('Generating flashcards with Gemini AI', { fileId });

  const result = await generateFlashcards(file.content, numberOfCards);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'flashcards',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Flashcards generated successfully', { fileId, count: result.totalCards });

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
