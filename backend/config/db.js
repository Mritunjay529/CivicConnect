import mongoose from 'mongoose';

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredUri = process.env.MONGO_URI;

  if (isProduction && !configuredUri) {
    throw new Error('MONGO_URI must be configured in production.');
  }

  const uri = configuredUri || 'mongodb://127.0.0.1:27017/civicconnect';

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (isProduction) {
      console.error('Production MongoDB connection failed. Check MONGO_URI and database network access.');
      throw error;
    }

    console.warn('Local MongoDB unavailable; attempting in-memory database for development.');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const conn = await mongoose.connect(mongod.getUri());
      console.log(`MongoDB Connected (In-Memory Development Mode): ${conn.connection.host}`);
      return conn;
    } catch (memError) {
      console.error('MongoDB development connection failed:', memError.message);
      throw memError;
    }
  }
};
