import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI ;
const DB_NAME = process.env.MONGODB_DB_NAME || 'ai_file_assistant';

let client: MongoClient | null = null;
let db: Db | null = null;

// User interface
export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// File interface
export interface FileDocument {
  _id?: ObjectId;
  userId: ObjectId;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: string; // Text content extracted from file
  createdAt: Date;
}

// Activity interface
export interface Activity {
  _id?: ObjectId;
  userId: ObjectId;
  fileId: ObjectId;
  type: 'summarize' | 'bullet-points' | 'quiz';
  result: any;
  createdAt: Date;
}

// Connect to MongoDB
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB successfully');
    
    // Create indexes
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Create database indexes
async function createIndexes(database: Db): Promise<void> {
  try {
    // Users collection indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Files collection indexes
    await database.collection('files').createIndex({ userId: 1 });
    await database.collection('files').createIndex({ createdAt: -1 });
    
    // Activities collection indexes
    await database.collection('activities').createIndex({ userId: 1 });
    await database.collection('activities').createIndex({ fileId: 1 });
    await database.collection('activities').createIndex({ createdAt: -1 });
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Get collections
export async function getUsersCollection(): Promise<Collection<User>> {
  const database = await connectToDatabase();
  return database.collection<User>('users');
}

export async function getFilesCollection(): Promise<Collection<FileDocument>> {
  const database = await connectToDatabase();
  return database.collection<FileDocument>('files');
}

export async function getActivitiesCollection(): Promise<Collection<Activity>> {
  const database = await connectToDatabase();
  return database.collection<Activity>('activities');
}

// Export ObjectId for use in other files
export { ObjectId };
