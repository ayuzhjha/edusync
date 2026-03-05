'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { ModuleAccordion } from '@/components/student/ModuleAccordion';
import { db, dbUtils, type Course, type Module, type Lesson, type Progress } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Download, BookOpen, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullyDownloaded, setIsFullyDownloaded] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);

        // Load course
        const courseData = await dbUtils.getCourse(courseId);
        setCourse(courseData || null);

        // Load modules
        const modulesData = await dbUtils.getModules(courseId);
        setModules(modulesData);

        // Load lessons
        const lessonsData = await dbUtils.getLessons(courseId);
        setLessons(lessonsData);
        setIsFullyDownloaded(lessonsData.length > 0 && lessonsData.every(l => l.isDownloaded));

        // Load progress if user exists
        if (user) {
          const progressData = await dbUtils.getProgress(user.id, courseId);
          setProgress(progressData);
        }
      } catch (error) {
        console.error('[v0] Error loading course data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, user?.id]);

  // Lightweight progress refresh — runs when tab becomes visible again
  // so completed checkmarks update after navigating back from a lesson
  const refreshProgress = useCallback(async () => {
    if (!user) return;
    const progressData = await dbUtils.getProgress(user.id, courseId);
    setProgress(progressData);
  }, [user, courseId]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshProgress();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [refreshProgress]);

  const handleDownloadCourse = async () => {
    setIsDownloading(true);
    try {
      if (isFullyDownloaded) {
        // Remove downloads
        for (const lesson of lessons) {
          lesson.isDownloaded = false;
          lesson.downloadedAt = undefined;
          lesson.localBlobUrl = undefined;
          await dbUtils.saveLesson(lesson);
        }
        setIsFullyDownloaded(false);
        toast.success('Course removed from offline storage');
      } else {
        // Mark all lessons as downloaded
        for (const lesson of lessons) {
          lesson.isDownloaded = true;
          lesson.downloadedAt = Date.now();
          await dbUtils.saveLesson(lesson);
        }
        setIsFullyDownloaded(true);
        toast.success(`${lessons.length} lessons saved for offline access!`);
      }
      // Reload lessons to reflect updated state
      const updated = await dbUtils.getLessons(courseId);
      setLessons(updated);
    } catch (error) {
      console.error('[v0] Download error:', error);
      toast.error('Failed to update offline storage');
    } finally {
      setIsDownloading(false);
    }
  };

  const completedCount = progress.filter((p) => p.completed).length;
  const completedMap: Record<string, boolean> = {};
  progress.forEach((p) => {
    completedMap[p.lessonId] = p.completed;
  });

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

  if (!course) {
    return (
      <PrivateRoute allowedRoles={['student']}>
        <PageWrapper>
          <Card className="p-8 text-center">
            <p className="text-gray-600">Course not found</p>
          </Card>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['student']}>
      <PageWrapper showNav>
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-blue-100 mb-4">{course.description}</p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">{Math.round((course.duration || 0) / 60)}h total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">{lessons.length || course.lessonCount || 0} lessons</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownloadCourse}
              disabled={isDownloading}
              className={`whitespace-nowrap flex items-center gap-2 ${isFullyDownloaded
                ? 'bg-green-600 hover:bg-red-600'
                : ''
                }`}
              variant={isFullyDownloaded ? 'default' : 'secondary'}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isFullyDownloaded ? 'Removing...' : 'Saving...'}
                </>
              ) : isFullyDownloaded ? (
                <>
                  <Download className="w-4 h-4" />
                  Saved Offline ✓
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Course
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 font-semibold">Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {completedCount}/{lessons.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0}% complete
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 font-semibold">Modules</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{modules.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 font-semibold">Lessons</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{lessons.length}</p>
          </Card>
        </div>

        {/* Course Content */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Content</h2>
          <ModuleAccordion
            modules={modules}
            lessons={lessons}
            courseId={course.id}
            completed={completedMap}
          />
        </Card>
      </PageWrapper>
    </PrivateRoute>
  );
}
