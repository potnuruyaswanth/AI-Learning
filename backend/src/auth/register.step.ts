import { z } from 'zod';
import { getUsersCollection } from '../services/mongodb';
import { hashPassword, generateToken } from '../services/auth';
import { coreMiddleware } from '../middlewares/core.middleware';
import { ConflictError, BadRequestError } from '../errors/base.error';

const bodySchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const config = {
  name: 'Register',
  type: 'api',
  path: '/api/auth/register',
  method: 'POST',
  description: 'Register a new user account',
  emits: [],
  flows: ['auth-flow'],
  bodySchema,
  middleware: [coreMiddleware],
  responseSchema: {
    201: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({
        user: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
        }),
        token: z.string(),
      }),
    }),
  },
};

export const handler = async (req: any, { logger }: any) => {
  const { email, password, name } = req.body;

  logger.info('Registration attempt', { email });

  const usersCollection = await getUsersCollection();

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  const now = new Date();

  const result = await usersCollection.insertOne({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    createdAt: now,
    updatedAt: now,
  });

  // Generate token
  const token = generateToken(result.insertedId, email.toLowerCase(), name);

  logger.info('User registered successfully', { userId: result.insertedId.toString() });

  return {
    status: 201,
    body: {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.insertedId.toString(),
          email: email.toLowerCase(),
          name,
        },
        token,
      },
    },
  };
};
