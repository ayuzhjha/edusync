'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { db, dbUtils, type Course } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, BookOpen, BarChart3, Users, Edit, Trash2 } from 'lucide-react';
import { loadMockData } from '@/lib/mockDataLoader';
import { CourseModal } from '@/components/CourseModal';
import { StudentsModal } from '@/components/StudentsModal';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      await loadMockData();
      const fetchedCourses = await dbUtils.getCourses();
      // Standardize instructor field
      const processedCourses = fetchedCourses.map(c => ({
        ...c,
        instructor: typeof c.instructor === 'object' && c.instructor !== null
          ? (c.instructor as any).name
          : c.instructor
      }));
      setCourses(processedCourses);
    } catch (error) {
      console.error('[v0] Error loading teacher dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleManageStudents = (course: Course) => {
    setSelectedCourseForStudents(course);
    setIsStudentsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    await dbUtils.deleteCourse(courseId);
    loadDashboard();
  };

  if (isLoading) {
    return (
      <PrivateRoute allowedRoles={['teacher']}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['teacher']}>
      <PageWrapper>
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-gray-600 mt-2">Manage your courses and track student progress</p>
          </div>
          <Button onClick={handleCreateCourse} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Total Courses</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{courses.length}</p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-200" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold">Total Lessons</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0)}</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-200" />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold">Total Students</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">—</p>
              </div>
              <Users className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Courses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lessons</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Students</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.category}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.lessonCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.enrolledStudents?.length || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleManageStudents(course)}>
                          <Users className="w-4 h-4 mr-1" /> Students
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {isCourseModalOpen && (
          <CourseModal
            course={editingCourse}
            instructorName={user?.name || ''}
            onClose={() => setIsCourseModalOpen(false)}
            onUpdate={() => {
              setIsCourseModalOpen(false);
              loadDashboard();
            }}
          />
        )}

        {isStudentsModalOpen && selectedCourseForStudents && (
          <StudentsModal
            course={selectedCourseForStudents}
            onClose={() => setIsStudentsModalOpen(false)}
            onUpdate={() => {
              loadDashboard();
            }}
          />
        )}
      </PageWrapper>
    </PrivateRoute>
  );
}
