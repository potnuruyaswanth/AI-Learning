import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { generateQuiz } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

const bodySchema = z.object({
  numberOfQuestions: z.number().min(1).max(20).optional().default(5),
});

export const config = {
  name: 'GenerateQuiz',
  type: 'api',
  path: '/api/ai/quiz/:fileId',
  method: 'POST',
  description: 'Generate quiz questions from the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  bodySchema,
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number(),
          explanation: z.string(),
        })),
        totalQuestions: z.number(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};
  const { numberOfQuestions } = req.body || { numberOfQuestions: 5 };

  logger.info('Generating quiz', { userId: user.userId, fileId, numberOfQuestions });

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

  logger.info('Generating quiz with Gemini AI', { fileId });

  // Generate quiz using Gemini
  const result = await generateQuiz(file.content, numberOfQuestions);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'quiz',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Quiz generated successfully', { fileId, totalQuestions: result.totalQuestions });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        questions: result.questions,
        totalQuestions: result.totalQuestions,
        fileId: fileId,
      },
    },
  };
};
