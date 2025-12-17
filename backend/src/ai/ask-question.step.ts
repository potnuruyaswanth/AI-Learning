import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { askQuestion } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../errors/base.error';

const bodySchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question too long'),
});

export const config = {
  name: 'AskQuestion',
  type: 'api',
  path: '/api/ai/ask/:fileId',
  method: 'POST',
  description: 'Ask a question about the file content using AI',
  emits: [],
  flows: ['ai-flow'],
  bodySchema,
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        answer: z.string(),
        confidence: z.enum(['high', 'medium', 'low']),
        relevantQuotes: z.array(z.string()),
        fileId: z.string(),
        question: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};
  const { question } = req.body;

  logger.info('Asking question about file', { userId: user.userId, fileId, question });

  if (!question || question.trim().length === 0) {
    throw new BadRequestError('Question cannot be empty');
  }

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

  logger.info('Answering question with Gemini AI', { fileId });

  const result = await askQuestion(file.content, question);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'question',
    question: question,
    result: result,
    createdAt: new Date(),
  });

  logger.info('Question answered successfully', { fileId, confidence: result.confidence });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        ...result,
        fileId: fileId,
        question: question,
      },
    },
  };
};
