'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BookOpen } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Redirect to login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EduLearn</h1>
        <p className="text-gray-600 mb-8">Loading your dashboard...</p>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      </div>
    </div>
  );
}
