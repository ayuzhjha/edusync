'use client';

import React, { useState } from 'react';
import { Quiz } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizPlayerProps {
  quiz: Quiz;
  onSubmit?: (answers: number[], score: number) => void;
  onComplete?: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onSubmit, onComplete }) => {
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (!submitted) {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / quiz.questions.length) * 100;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const calculatedScore = calculateScore();
      setScore(calculatedScore);
      setSubmitted(true);
      onSubmit?.(answers, calculatedScore);
    } catch (error) {
      console.error('[v0] Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = answers.every((answer) => answer !== -1);
  const passed = score >= quiz.passingScore;

  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Result Card */}
        <Card className={`p-8 text-center ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`flex justify-center mb-4`}>
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <h3 className={`text-2xl font-bold ${passed ? 'text-green-900' : 'text-red-900'}`}>
            {passed ? 'Passed!' : 'Not Passed'}
          </h3>
          <p className={`text-4xl font-bold mt-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {Math.round(score)}%
          </p>
          <p className="text-gray-600 mt-4">
            You got {Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length} questions correct
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Passing score: {quiz.passingScore}%
          </p>

          <Button className="mt-6" onClick={onComplete}>
            Continue
          </Button>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Review Answers</h3>
          {quiz.questions.map((question, qIndex) => {
            const isCorrect = answers[qIndex] === question.correctAnswer;
            return (
              <Card key={qIndex} className={`p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{question.text}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Your answer: <strong>{question.options[answers[qIndex]]}</strong>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-600 mt-1">
                        Correct answer: <strong>{question.options[question.correctAnswer]}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Quiz Instructions</AlertTitle>
        <AlertDescription>
          Answer all questions to submit the quiz. You need to score at least {quiz.passingScore}% to pass.
        </AlertDescription>
      </Alert>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <Card key={qIndex} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex-1">{question.text}</h3>
              <span className="text-xs font-medium text-gray-500 ml-4">
                Q{qIndex + 1}/{quiz.questions.length}
              </span>
            </div>

            <RadioGroup value={answers[qIndex] === -1 ? '' : String(answers[qIndex])}>
              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center">
                    <RadioGroupItem
                      value={String(oIndex)}
                      id={`q${qIndex}-option${oIndex}`}
                      onClick={() => handleSelectOption(qIndex, oIndex)}
                    />
                    <Label
                      htmlFor={`q${qIndex}-option${oIndex}`}
                      className="ml-3 font-normal cursor-pointer text-gray-700 flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  );
};
