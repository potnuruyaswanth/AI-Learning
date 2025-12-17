import { z } from 'zod';
import { getFilesCollection, getActivitiesCollection, ObjectId } from '../services/mongodb';
import { generateBulletPoints } from '../services/gemini';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../errors/base.error';

const bodySchema = z.object({
  maxPoints: z.number().min(1).max(20).optional().default(10),
});

export const config = {
  name: 'GenerateBulletPoints',
  type: 'api',
  path: '/api/ai/bullet-points/:fileId',
  method: 'POST',
  description: 'Generate bullet points from the uploaded file using AI',
  emits: [],
  flows: ['ai-flow'],
  bodySchema,
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        bulletPoints: z.array(z.string()),
        totalPoints: z.number(),
        fileId: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileId } = req.pathParams || req.params || {};
  const { maxPoints } = req.body || { maxPoints: 10 };

  logger.info('Generating bullet points', { userId: user.userId, fileId, maxPoints });

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

  logger.info('Generating bullet points with Gemini AI', { fileId });

  // Generate bullet points using Gemini
  const result = await generateBulletPoints(file.content, maxPoints);

  // Save activity
  const activitiesCollection = await getActivitiesCollection();
  await activitiesCollection.insertOne({
    userId: new ObjectId(user.userId),
    fileId: objectId,
    type: 'bullet-points',
    result: result,
    createdAt: new Date(),
  });

  logger.info('Bullet points generated successfully', { fileId, totalPoints: result.totalPoints });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        bulletPoints: result.bulletPoints,
        totalPoints: result.totalPoints,
        fileId: fileId,
      },
    },
  };
};
