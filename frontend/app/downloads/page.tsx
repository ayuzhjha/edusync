'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { db, dbUtils, type Lesson, type Course } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Trash2,
  WifiOff,
  HardDrive,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CourseDownloadInfo {
  course: Course;
  lessons: Lesson[];
  downloadedLessons: Lesson[];
  allDownloaded: boolean;
}

const lessonTypeIcon = (type: string) => {
  if (type === 'video') return <PlayCircle className="w-4 h-4 text-blue-500" />;
  if (type === 'pdf') return <FileText className="w-4 h-4 text-orange-500" />;
  return <HelpCircle className="w-4 h-4 text-purple-500" />;
};

export default function DownloadsPage() {
  const { user } = useAuth();
  const [courseInfos, setCourseInfos] = useState<CourseDownloadInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const courses = await dbUtils.getCourses();
      const infos: CourseDownloadInfo[] = [];

      for (const course of courses) {
        const lessons = await dbUtils.getLessons(course.id);
        const downloadedLessons = lessons.filter((l) => l.isDownloaded);
        if (downloadedLessons.length > 0) {
          infos.push({
            course,
            lessons,
            downloadedLessons,
            allDownloaded: downloadedLessons.length === lessons.length,
          });
        }
      }

      setCourseInfos(infos);
    } catch (error) {
      console.error('[v0] Error loading downloads:', error);
      toast.error('Failed to load downloads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveLesson = async (lessonId: string, courseId: string) => {
    const lesson = await dbUtils.getLesson(lessonId);
    if (!lesson) return;
    lesson.isDownloaded = false;
    lesson.downloadedAt = undefined;
    lesson.localBlobUrl = undefined;
    await dbUtils.saveLesson(lesson);
    toast.success('Lesson removed from offline storage');
    await loadData();
  };

  const handleRemoveCourse = async (courseId: string) => {
    const lessons = await dbUtils.getLessons(courseId);
    for (const lesson of lessons) {
      if (lesson.isDownloaded) {
        lesson.isDownloaded = false;
        lesson.downloadedAt = undefined;
        lesson.localBlobUrl = undefined;
        await dbUtils.saveLesson(lesson);
      }
    }
    toast.success('Course removed from offline storage');
    await loadData();
  };

  const toggleExpand = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <PrivateRoute allowedRoles={['student']}>
        <PageWrapper title="Downloads" subtitle="Manage your offline content">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['student']}>
      <PageWrapper title="Downloads" subtitle="Manage your offline content">

        {/* Offline Testing Guide */}
        <Card className="p-5 mb-6 bg-indigo-50 border-indigo-200">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900 mb-1">How to test offline access</h3>
              <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
                <li>Go to a course and click <strong>"Download Course"</strong> — lessons are marked as offline-ready in IndexedDB.</li>
                <li>Open <strong>DevTools → Network tab → select "Offline"</strong> (or disconnect Wi-Fi).</li>
                <li>Navigate to the downloaded course — content loads from local IndexedDB without any network request.</li>
                <li>Mark lessons complete — progress is saved locally and syncs automatically when you come back online.</li>
              </ol>
              <p className="text-xs text-indigo-600 mt-2">
                💡 On localhost, the backend serves video files. For true offline video playback you need a blob URL —
                the current "Download" stores metadata only. Video will still need the server unless the browser has cached it.
              </p>
            </div>
          </div>
        </Card>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Offline Courses</h3>
            <p className="text-sm text-gray-500">{courseInfos.length} course{courseInfos.length !== 1 ? 's' : ''} with downloaded content</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {courseInfos.length === 0 ? (
          <Card className="p-12 text-center">
            <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No offline content yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Open a course and click "Download Course" to make it available offline.
            </p>
            <Link href="/dashboard">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {courseInfos.map(({ course, lessons, downloadedLessons, allDownloaded }) => {
              const isExpanded = expandedCourses.has(course.id);
              const pct = Math.round((downloadedLessons.length / lessons.length) * 100);

              return (
                <Card
                  key={course.id}
                  className={`overflow-hidden border-2 ${allDownloaded ? 'border-green-300 bg-green-50/40' : 'border-blue-200 bg-blue-50/20'}`}
                >
                  {/* Course header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
                          {allDownloaded ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Fully Offline
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Partially Downloaded
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {downloadedLessons.length} / {lessons.length} lessons • {pct}% offline
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${allDownloaded ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="outline" size="sm">Open</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCourse(course.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => toggleExpand(course.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable lesson list */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 divide-y divide-gray-100">
                      {downloadedLessons.map((lesson) => (
                        <div key={lesson.id} className="px-4 py-3 flex items-center justify-between bg-white">
                          <div className="flex items-center gap-3">
                            {lessonTypeIcon(lesson.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                {lesson.type === 'video' && `${lesson.duration ?? '?'} min`}
                                {lesson.type === 'pdf' && `${lesson.pageCount ?? '?'} pages`}
                                {lesson.type === 'quiz' && 'Quiz'}
                                {lesson.downloadedAt && ` · Downloaded ${new Date(lesson.downloadedAt).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">Offline</Badge>
                            <button
                              onClick={() => handleRemoveLesson(lesson.id, course.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Remove from offline"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <Card className="p-5 mt-8 bg-gray-50 border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Tips</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>✓ Download a course before going offline — use the "Download Course" button on the course page.</li>
            <li>✓ Your progress is always saved locally first and synced when back online.</li>
            <li>✓ To simulate offline on localhost: DevTools → Network → Offline.</li>
            <li>✓ The sync indicator in the navbar shows pending changes and a retry button.</li>
          </ul>
        </Card>
      </PageWrapper>
    </PrivateRoute>
  );
}
