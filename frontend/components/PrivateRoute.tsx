'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { dbUtils } from '@/lib/db';

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: ('student' | 'teacher' | 'admin')[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [settingsLoading, setSettingsLoading] = React.useState(true);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const settings = await dbUtils.getSettings();
        setMaintenanceMode(settings.maintenanceMode);
      } catch (e) {
        // ignore
      } finally {
        setSettingsLoading(false);
      }
    };
    checkSettings();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !settingsLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, settingsLoading, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && allowedRoles && user && !settingsLoading) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, authLoading, settingsLoading, user, allowedRoles, router]);

  const isLoading = authLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (maintenanceMode && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Under Maintenance</h1>
        <p className="text-muted-foreground max-w-md">
          We are currently updating our systems to provide you with a better experience. Please check back later.
        </p>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
