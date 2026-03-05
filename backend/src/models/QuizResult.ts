import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
    userId: mongoose.Types.ObjectId;
    quizId: string;
    courseId: string;
    score: number;
    totalQuestions: number;
    answers: any[];
    passed?: boolean;
    submittedAt: Date;
}

const QuizResultSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        quizId: { type: String, required: true },
        courseId: { type: String, required: true },
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
        answers: [{ type: Schema.Types.Mixed }],
        passed: { type: Boolean },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
