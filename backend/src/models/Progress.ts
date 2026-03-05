import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    lessonId: string;
    courseId: string;
    status: 'in-progress' | 'completed';
    completedAt?: Date;
    watchedDuration?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lessonId: { type: String, required: true },
        courseId: { type: String, required: true },
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress',
        },
        completedAt: { type: Date },
        watchedDuration: { type: Number },
    },
    { timestamps: true }
);

export default mongoose.model<IProgress>('Progress', ProgressSchema);
