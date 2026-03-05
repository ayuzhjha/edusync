'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { db, dbUtils, type Course, type Progress, type QuizResult } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, BookOpen, CheckCircle, Award, Clock } from 'lucide-react';
import { Progress as ProgressBar } from '@/components/ui/progress';

// Helper to render Cards if shadcn Card is not available, but let's assume standard structure or use basic divs
const CustomCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        {children}
    </div>
);

export default function ProfilePage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [allProgress, setAllProgress] = useState<Progress[]>([]);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProfileData = async () => {
            if (!user) return;
            try {
                setIsLoading(true);

                // Load all courses
                const fetchedCourses = await dbUtils.getCourses();
                setCourses(fetchedCourses);

                // Load actual lesson counts per course from Dexie
                const counts: Record<string, number> = {};
                for (const course of fetchedCourses) {
                    const lessons = await dbUtils.getLessons(course.id);
                    counts[course.id] = lessons.length;
                }
                setLessonCounts(counts);

                // Load all user progress
                const fetchedProgress = await db.progress.where('userId').equals(user.id).toArray();
                setAllProgress(fetchedProgress);

                // Load all quiz results
                const fetchedResults = await dbUtils.getQuizResults(user.id);
                setQuizResults(fetchedResults);
            } catch (error) {
                console.error('[v0] Error loading profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfileData();
    }, [user?.id]);

    const getCourseProgress = (courseId: string) => {
        const courseProgress = allProgress.filter(p => p.courseId === courseId);
        const completed = courseProgress.filter(p => p.completed).length;
        const course = courses.find(c => c.id === courseId);
        // Use the best available denominator: actual lessons in Dexie > course.lessonCount > progress entries
        const actualLessons = lessonCounts[courseId] || 0;
        const denominator = Math.max(
            actualLessons,
            course?.lessonCount || 0,
            courseProgress.length,
            completed
        );
        if (denominator === 0) return 0;
        return Math.round((completed / denominator) * 100);
    };

    const startedCourses = courses.filter(course =>
        allProgress.some(p => p.courseId === course.id)
    );

    const avgQuizScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length)
        : 0;

    if (isLoading) {
        return (
            <PrivateRoute allowedRoles={['student', 'teacher']}>
                <PageWrapper showNav>
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </PageWrapper>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute allowedRoles={['student', 'teacher']}>
            <PageWrapper showNav>
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm capitalize">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stats Overview */}
                        <CustomCard className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Started</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{startedCourses.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Courses in progress</p>
                        </CustomCard>

                        <CustomCard className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Completed</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {allProgress.filter(p => p.completed).length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Lessons finished</p>
                        </CustomCard>

                        <CustomCard className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Avg. Score</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{avgQuizScore}%</p>
                            <p className="text-xs text-gray-500 mt-1">Across {quizResults.length} quizzes</p>
                        </CustomCard>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Course Progress */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Recent Courses
                            </h2>
                            <div className="space-y-3">
                                {startedCourses.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No courses started yet.</p>
                                ) : (
                                    startedCourses.map(course => {
                                        const percentage = getCourseProgress(course.id);
                                        return (
                                            <CustomCard key={course.id} className="p-4">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{course.title}</p>
                                                <div className="mt-3 flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <ProgressBar value={percentage} className="h-1.5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-blue-600 w-8">{percentage}%</span>
                                                </div>
                                            </CustomCard>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Quiz Performance */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Quiz Scores
                            </h2>
                            <div className="space-y-3">
                                {quizResults.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No quizzes taken yet.</p>
                                ) : (
                                    quizResults.sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5).map(result => {
                                        const course = courses.find(c => c.id === result.courseId);
                                        return (
                                            <CustomCard key={result.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                                                        {course?.title || 'Course Activity'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(result.submittedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${result.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {result.score}%
                                                </div>
                                            </CustomCard>
                                        );
                                    })
                                )}
                                {quizResults.length > 5 && (
                                    <button className="text-sm text-blue-600 font-medium hover:underline w-full text-center">
                                        View all quiz scores
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </PageWrapper>
        </PrivateRoute>
    );
}
