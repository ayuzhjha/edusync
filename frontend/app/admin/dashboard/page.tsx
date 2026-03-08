'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PageWrapper } from '@/components/PageWrapper';
import { dbUtils, type Course, type User, type Settings } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Settings as SettingsIcon, Users, BookOpen, UserPlus, Power } from 'lucide-react';
import { CourseModal } from '@/components/CourseModal';
import { UserModal } from '@/components/UserModal';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: 'global', maintenanceMode: false });
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'settings'>('courses');

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedCourses, fetchedUsers, siteSettings] = await Promise.all([
        dbUtils.getCourses(),
        dbUtils.getUsers(),
        dbUtils.getSettings()
      ]);
      setCourses(fetchedCourses);
      setUsers(fetchedUsers);
      setSettings(siteSettings);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleMaintenance = async () => {
    try {
      const newVal = !settings.maintenanceMode;
      await dbUtils.updateSettings({ maintenanceMode: newVal });
      setSettings(prev => ({ ...prev, maintenanceMode: newVal }));
      toast.success(`Maintenance mode ${newVal ? 'enabled' : 'disabled'}`);
    } catch (e) {
      toast.error('Failed to change maintenance mode');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    await dbUtils.deleteCourse(courseId);
    toast.success('Course deleted');
    loadData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Cannot delete yourself');
      return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;
    await dbUtils.deleteUser(userId);
    toast.success('User deleted');
    loadData();
  };

  if (isLoading) {
    return (
      <PrivateRoute allowedRoles={['admin']}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </PageWrapper>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={['admin']}>
      <PageWrapper>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2">Manage the platform, users, and courses.</p>
        </div>

        <div className="flex border-b border-border mb-8 space-x-8">
          <button
            className={`pb-4 flex items-center gap-2 font-medium ${activeTab === 'courses' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen className="w-5 h-5" />
            Courses
          </button>
          <button
            className={`pb-4 flex items-center gap-2 font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            className={`pb-4 flex items-center gap-2 font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </div>

        {activeTab === 'courses' && (
          <Card>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">All Courses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Course</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Instructor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{course.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {typeof course.instructor === 'object' && course.instructor !== null
                          ? (course.instructor as any).name
                          : course.instructor}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)} className="text-destructive hover:bg-destructive/10">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">All Users</h3>
              <Button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-muted text-foreground/90 rounded-full text-sm font-medium capitalize">{u.role}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-destructive hover:bg-destructive/10">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Power className="w-6 h-6 text-orange-600" />
                  Maintenance Mode
                </h3>
                <p className="text-muted-foreground mt-2 max-w-lg">
                  When enabled, the site will be inaccessible to standard users and teachers. This is useful during major updates or resolving critical issues.
                </p>
              </div>
              <Button 
                onClick={handleToggleMaintenance} 
                className={settings.maintenanceMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {settings.maintenanceMode ? "Turn Off Maintenance" : "Turn On Maintenance"}
              </Button>
            </div>
          </Card>
        )}

        {isCourseModalOpen && (
          <CourseModal
            course={editingCourse}
            instructorName={user?.name || ''}
            onClose={() => setIsCourseModalOpen(false)}
            onUpdate={() => {
              setIsCourseModalOpen(false);
              loadData();
            }}
          />
        )}

        {isUserModalOpen && (
          <UserModal
            user={editingUser}
            onClose={() => setIsUserModalOpen(false)}
            onUpdate={() => {
              setIsUserModalOpen(false);
              loadData();
            }}
          />
        )}
      </PageWrapper>
    </PrivateRoute>
  );
}
