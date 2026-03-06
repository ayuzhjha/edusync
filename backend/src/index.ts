import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI environment variable is not defined.');
    process.exit(1);
}

console.log('Starting server...');
console.log(`Connecting to MongoDB at: ${MONGODB_URI.split('@')[1] || 'hidden'}...`);

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        // On Render, we want to fail fast if we can't connect
        process.exit(1);
    });
