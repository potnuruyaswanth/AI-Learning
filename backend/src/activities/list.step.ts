import { z } from 'zod';
import { getActivitiesCollection, getFilesCollection, ObjectId } from '../services/mongodb';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const config = {
  name: 'GetActivities',
  type: 'api',
  path: '/api/activities',
  method: 'GET',
  description: 'Get user activities (AI processing history)',
  emits: [],
  flows: ['activity-flow'],
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    200: z.object({
      success: z.boolean(),
      data: z.object({
        activities: z.array(z.object({
          id: z.string(),
          fileId: z.string(),
          fileName: z.string(),
          type: z.string(),
          createdAt: z.string(),
        })),
      }),
    }),
  },
};

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;

  logger.info('Getting activities', { userId: user.userId });

  const activitiesCollection = await getActivitiesCollection();
  const filesCollection = await getFilesCollection();

  const activities = await activitiesCollection
    .find({ userId: new ObjectId(user.userId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  // Get file names
  const fileIds = [...new Set(activities.map(a => a.fileId.toString()))];
  const files = await filesCollection
    .find({ _id: { $in: fileIds.map(id => new ObjectId(id)) } })
    .toArray();
  
  const fileMap = new Map(files.map(f => [f._id!.toString(), f.originalName]));

  return {
    status: 200,
    body: {
      success: true,
      data: {
        activities: activities.map(activity => ({
          id: activity._id!.toString(),
          fileId: activity.fileId.toString(),
          fileName: fileMap.get(activity.fileId.toString()) || 'Unknown',
          type: activity.type,
          createdAt: activity.createdAt.toISOString(),
        })),
      },
    },
  };
};
