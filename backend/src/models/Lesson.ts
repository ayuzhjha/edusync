import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
    id: string; // Custom string ID for compatibility
    title: string;
    description?: string;
    contentUrl: string;
    type: 'video' | 'pdf' | 'quiz';
    moduleId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    order: number;
    duration?: number;
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String },
        contentUrl: { type: String, required: true },
        type: {
            type: String,
            enum: ['video', 'pdf', 'quiz'],
            required: true,
        },
        moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        order: { type: Number, required: true },
        duration: { type: Number },
    },
    { timestamps: true }
);

export default mongoose.model<ILesson>('Lesson', LessonSchema);
