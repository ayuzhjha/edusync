'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { VideoPlayer } from '@/components/student/VideoPlayer';
import { PDFViewer } from '@/components/student/PDFViewer';
import { QuizPlayer } from '@/components/student/QuizPlayer';
import { db, dbUtils, type Lesson, type Quiz, type Progress, type QuizResult } from '@/lib/db';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { user } = useAuth();
  const { addToQueue } = useSyncStatus();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [offlineBlobUrl, setOfflineBlobUrl] = useState<string | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (offlineBlobUrl) {
        URL.revokeObjectURL(offlineBlobUrl);
      }
    };
  }, [offlineBlobUrl]);

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setIsLoading(true);

        // Load lesson from Dexie first
        let lessonData = await dbUtils.getLesson(lessonId);

        // Try to fetch fresh from API if online
        if (navigator.onLine) {
          try {
            const liveLesson = await apiService.get<Lesson>(`/student/lessons/${lessonId}`);
            if (liveLesson) {
              // Merge with existing local data to preserve string IDs for courseId/moduleId.
              const processedLesson: Lesson = {
                ...(lessonData || {} as Lesson),
                ...liveLesson,
                id: liveLesson.id || (liveLesson as any)._id,
                courseId: lessonData?.courseId || courseId,
                moduleId: lessonData?.moduleId || liveLesson.moduleId,
                isDownloaded: lessonData?.isDownloaded ?? false,
                downloadedAt: lessonData?.downloadedAt,
              };
              await dbUtils.saveLesson(processedLesson);
              lessonData = processedLesson;
            }
          } catch (apiError) {
            console.error('[v0] Error fetching live lesson:', apiError);
          }
        }

        // If downloaded, load the actual blob from IndexedDB
        if (lessonData?.isDownloaded) {
          try {
            const asset = await dbUtils.getOfflineAsset(lessonId);
            if (asset && asset.blob) {
              const url = URL.createObjectURL(asset.blob);
              setOfflineBlobUrl(url);
            }
          } catch (assetError) {
            console.error('[v0] Error loading offline asset:', assetError);
          }
        }

        setLesson(lessonData || null);


        // Load quiz if lesson is a quiz type
        if (lessonData?.type === 'quiz') {
          const quizData = await dbUtils.getQuizByLesson(lessonId);
          setQuiz(quizData || null);
          if (user && quizData) {
            const resultData = await dbUtils.getQuizResult(user.id, quizData.id);
            setQuizResult(resultData || null);
          }
        }

        // Load progress if user exists
        if (user) {
          const progressData = await dbUtils.getLessonProgress(user.id, courseId, lessonId);
          setProgress(progressData || null);
        }
      } catch (error) {
        console.error('[v0] Error loading lesson data:', error);
        toast.error('Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    loadLessonData();
  }, [lessonId, courseId, user?.id]);

  const handleMarkComplete = async () => {
    if (!user) return;

    setIsMarking(true);
    try {
      await dbUtils.markLessonComplete(user.id, courseId, lessonId);

      // Add to sync queue
      await addToQueue({
        userId: user.id,
        type: 'progress',
        resourceId: `${user.id}-${courseId}-${lessonId}`,
        payload: { status: 'completed', lessonId, courseId },
      });

      setProgress(
        (await dbUtils.getLessonProgress(user.id, courseId, lessonId)) || null
      );

      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('[v0] Error marking lesson complete:', error);
      toast.error('Failed to mark lesson complete');
    } finally {
      setIsMarking(false);
    }
  };

  const handleQuizSubmit = async (answers: number[], score: number) => {
    if (!user || !quiz) return;

    try {
      const quizResult = {
        id: `${user.id}-${quiz.id}-${Date.now()}`,
        userId: user.id,
        courseId,
        lessonId,
        quizId: quiz.id,
        score: Math.round(score),
        totalQuestions: quiz.questions.length,
        answers,
        submittedAt: Date.now(),
        synced: false,
      };

      // Save locally
      await dbUtils.saveQuizResult(quizResult);

      // Add to sync queue
      await addToQueue({
        userId: user.id,
        type: 'quiz_result',
        resourceId: quizResult.id,
        payload: {
          courseId,
          lessonId,
          quizId: quiz.id,
          score: quizResult.score,
          totalQuestions: quizResult.totalQuestions,
          answers: quizResult.answers,
          submittedAt: quizResult.submittedAt
        },
      });

      // Mark lesson as complete
      if (score >= quiz.passingScore) {
        await handleMarkComplete();
      }

      toast.success('Quiz submitted!');
    } catch (error) {
      console.error('[v0] Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  if (isLoading) {
    return (
      <PrivateRoute allowedRoles={['student']}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  if (!lesson) {
    return (
      <PrivateRoute allowedRoles={['student']}>
        <PageWrapper>
          <Card className="p-8 text-center">
            <p className="text-gray-600">Lesson not found</p>
          </Card>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['student']}>
      <PageWrapper showNav>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-gray-600 mt-2">{lesson.description}</p>
              )}
            </div>
            {progress?.completed && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {lesson.type === 'video' && (
              <VideoPlayer
                title={lesson.title}
                blobUrl={offlineBlobUrl || undefined}
                contentUrl={
                  lesson.contentUrl?.startsWith('/')
                    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${lesson.contentUrl}`
                    : lesson.contentUrl
                }
                duration={lesson.duration}
                onComplete={handleMarkComplete}
              />
            )}

            {lesson.type === 'pdf' && (
              <PDFViewer
                title={lesson.title}
                blobUrl={offlineBlobUrl || undefined}
                pageCount={lesson.pageCount}
                onComplete={handleMarkComplete}
              />
            )}


            {lesson.type === 'quiz' && quiz && (
              quizResult ? (
                <Card className="p-8 text-center bg-blue-50 border-blue-200">
                  <div className="flex justify-center mb-4">
                    <Award className="w-16 h-16 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Quiz Completed</h3>
                  <p className="text-4xl font-bold mt-2 text-blue-700">
                    {quizResult.score}%
                  </p>
                  <p className="text-gray-600 mt-4">
                    You have already appeared for this quiz.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Date: {new Date(quizResult.submittedAt).toLocaleDateString()}
                  </p>
                  <Button className="mt-6" onClick={() => router.back()}>
                    Continue Learning
                  </Button>
                </Card>
              ) : (
                <QuizPlayer
                  quiz={quiz}
                  onSubmit={handleQuizSubmit}
                  onComplete={() => router.back()}
                />
              )
            )}

            {/* Mark Complete Button */}
            {lesson.type !== 'quiz' && !progress?.completed && (
              <div className="mt-6">
                <Button
                  onClick={handleMarkComplete}
                  disabled={isMarking}
                  size="lg"
                  className="w-full"
                >
                  {isMarking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isMarking ? 'Marking...' : 'Mark as Complete'}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lesson Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{lesson.type}</p>
                </div>
                {lesson.type === 'video' && lesson.duration && (
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{lesson.duration} minutes</p>
                  </div>
                )}
                {lesson.type === 'pdf' && lesson.pageCount && (
                  <div>
                    <p className="text-gray-600">Pages</p>
                    <p className="font-medium text-gray-900">{lesson.pageCount}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">
                    {progress?.completed ? '✓ Completed' : 'Not Started'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Downloaded Status */}
            {lesson.isDownloaded && (
              <Card className="p-6 bg-green-50 border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  This lesson is downloaded and available offline
                </p>
              </Card>
            )}
          </div>
        </div>
      </PageWrapper>
    </PrivateRoute>
  );
}
