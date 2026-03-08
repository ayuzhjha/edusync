'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { CourseCard } from '@/components/student/CourseCard';
import { Card } from '@/components/ui/card';
import { db, dbUtils, type Course, type Progress } from '@/lib/db';
import { loadMockData } from '@/lib/mockDataLoader';
import { apiService } from '@/lib/api';
import { Loader2, BookOpen, CheckCircle, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, Progress[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);

        // Load mock data on first visit
        await loadMockData();

        // Fetch live courses from API if online
        if (navigator.onLine) {
          try {
            const liveCourses = await apiService.get<Course[]>('/student/courses');
            if (liveCourses && liveCourses.length > 0) {
              // Fetch existing local courses so we can merge rather than overwrite
              const existingCoursesMap: Record<string, Course> = {};
              const existingLocal = await dbUtils.getCourses();
              existingLocal.forEach(c => { existingCoursesMap[c.id] = c; });

              const processedCourses = liveCourses.map(c => {
                const id = c.id || (c as any)._id;
                const existing = existingCoursesMap[id];
                return {
                  // Start with existing local data (preserves lessonCount, duration, etc.)
                  ...(existing || {}),
                  // Layer API data on top
                  ...c,
                  id,
                  instructor: typeof c.instructor === 'object' && c.instructor !== null
                    ? (c.instructor as any).name
                    : c.instructor,
                  // Preserve critical fields that the backend model doesn't have
                  lessonCount: c.lessonCount || existing?.lessonCount || 0,
                  moduleCount: c.moduleCount || existing?.moduleCount || 0,
                  duration: c.duration || existing?.duration || 0,
                  level: c.level || existing?.level || 'beginner',
                };
              });
              await dbUtils.saveCourses(processedCourses);
              console.log('[v0] Synced courses from backend');
            }
          } catch (apiError) {
            console.error('[v0] Error fetching live courses:', apiError);
          }
        }

        // Fetch courses from local DB
        const fetchedCourses = await dbUtils.getCourses();

        // Compute real lessonCount from actual lessons in the DB for each course
        const coursesWithRealLessonCount = await Promise.all(
          fetchedCourses.map(async (course) => {
            const lessons = await dbUtils.getLessons(course.id);
            const realCount = lessons.length;
            if (realCount > 0 && realCount !== course.lessonCount) {
              // Persist the corrected value so other pages stay consistent
              const updated = { ...course, lessonCount: realCount };
              await dbUtils.saveCourse(updated);
              return updated;
            }
            return course;
          })
        );

        setCourses(coursesWithRealLessonCount);

        // Fetch progress for each course
        if (user) {
          const progressMap: Record<string, Progress[]> = {};
          for (const course of coursesWithRealLessonCount) {
            const progress = await dbUtils.getProgress(user.id, course.id);
            progressMap[course.id] = progress;
          }
          setCourseProgress(progressMap);
        }
      } catch (error) {
        console.error('[v0] Error initializing dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [user?.id]);

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

  // Only courses where student has started something
  const inProgressCourses = courses.filter(
    (c) => (courseProgress[c.id] || []).length > 0
  );

  const totalCompleted = Object.values(courseProgress)
    .flat()
    .filter((p) => p.completed).length;

  return (
    <PrivateRoute allowedRoles={['student']}>
      <PageWrapper>
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>!
          </h2>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Stats Section - Moved from bottom with premium styling */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Available Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{courses.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Completed</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Lessons Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalCompleted}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                <PlayCircle className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Courses Started</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{inProgressCourses.length}</p>
          </div>
        </div>

        {/* Continue Learning — only courses with progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Continue Learning</h3>
            <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">View all progress</span>
          </div>
          {inProgressCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No courses in progress yet — start a lesson below!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inProgressCourses.slice(0, 4).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={courseProgress[course.id] || []}
                />
              ))}
            </div>
          )}
        </div>

        {/* All Courses */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Courses</h3>
          {courses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No courses available</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={courseProgress[course.id] || []}
                />
              ))}
            </div>
          )}
        </div>

      </PageWrapper>
    </PrivateRoute>
  );
}
