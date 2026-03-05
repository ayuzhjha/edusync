import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    id: string; // Custom string ID for compatibility
    title: string;
    description: string;
    instructor: mongoose.Types.ObjectId;
    category: string;
    level?: string;
    thumbnail?: string;
    enrolledStudents: mongoose.Types.ObjectId[];
    modules: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String, required: true },
        level: { type: String },
        thumbnail: { type: String },
        enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    },
    { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);
