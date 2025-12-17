import { z } from 'zod';
import { getFilesCollection, ObjectId } from '../services/mongodb';
import { coreMiddleware } from '../middlewares/core.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { BadRequestError } from '../errors/base.error';
import { v4 as uuidv4 } from 'uuid';

const bodySchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  content: z.string().min(1, 'File content is required'),
  mimeType: z.string().optional().default('text/plain'),
});

export const config = {
  name: 'UploadFile',
  type: 'api',
  path: '/api/files/upload',
  method: 'POST',
  description: 'Upload a text file for AI processing',
  emits: [],
  flows: ['file-flow'],
  bodySchema,
  middleware: [coreMiddleware, authMiddleware],
  responseSchema: {
    201: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({
        file: z.object({
          id: z.string(),
          originalName: z.string(),
          size: z.number(),
          createdAt: z.string(),
        }),
      }),
    }),
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for text files

// Supported text file extensions
const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.js', '.ts', '.py', '.java', '.c', '.cpp', '.css', '.yaml', '.yml'];

export const handler = async (req: any, ctx: any) => {
  const { logger, user } = ctx;
  const { fileName, content, mimeType } = req.body;

  logger.info('File upload request', { userId: user.userId, fileName, mimeType });

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('File content cannot be empty');
  }

  // Check file extension
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new BadRequestError(`Unsupported file type. Only text files are supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }

  // Check file size
  const fileSize = Buffer.byteLength(content, 'utf8');
  if (fileSize > MAX_FILE_SIZE) {
    throw new BadRequestError(`File too large. Maximum size is 10MB. Your file is ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
  }

  logger.info('File validated', { extension: ext, size: fileSize });

  const filesCollection = await getFilesCollection();
  const now = new Date();

  const fileDoc = {
    userId: new ObjectId(user.userId),
    originalName: fileName,
    fileName: `${uuidv4()}-${fileName}`,
    mimeType: mimeType || 'text/plain',
    size: fileSize,
    content: content,
    createdAt: now,
  };

  const result = await filesCollection.insertOne(fileDoc);

  logger.info('File uploaded successfully', { fileId: result.insertedId.toString() });

  return {
    status: 201,
    body: {
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: {
          id: result.insertedId.toString(),
          originalName: fileName,
          size: fileDoc.size,
          createdAt: now.toISOString(),
        },
      },
    },
  };
};
