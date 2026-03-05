import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface IQuiz extends Document {
    courseId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    passingScore: number;
    questions: IQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String },
});

const QuizSchema: Schema = new Schema(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
        title: { type: String, required: true },
        description: { type: String },
        passingScore: { type: Number, default: 70 },
        questions: [QuestionSchema],
    },
    { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
