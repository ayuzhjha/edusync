import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
    title: string;
    courseId: mongoose.Types.ObjectId;
    order: number;
    lessons: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ModuleSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        order: { type: Number, required: true },
        lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    },
    { timestamps: true }
);

export default mongoose.model<IModule>('Module', ModuleSchema);
