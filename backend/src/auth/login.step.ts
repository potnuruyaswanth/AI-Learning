import { z } from 'zod';
import { getUsersCollection } from '../services/mongodb';
import { comparePassword, generateToken } from '../services/auth';
import { coreMiddleware } from '../middlewares/core.middleware';
import { UnauthorizedError } from '../errors/base.error';

const bodySchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const config = {
  name: 'Login',
  type: 'api',
  path: '/api/auth/login',
  method: 'POST',
  description: 'Login to user account',
  emits: [],
  flows: ['auth-flow'],
  bodySchema,
  middleware: [coreMiddleware],
  responseSchema: {
    200: z.object({
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
  const { email, password } = req.body;

  logger.info('Login attempt', { email });

  const usersCollection = await getUsersCollection();

  // Find user by email
  const user = await usersCollection.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id!, user.email, user.name);

  logger.info('User logged in successfully', { userId: user._id?.toString() });

  return {
    status: 200,
    body: {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
        },
        token,
      },
    },
  };
};
