'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { OfflineBanner } from './OfflineBanner';
import { DevelopmentToggle } from './DevelopmentToggle';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  subtitle,
  showNav = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <Navbar />}
      
      {title && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <OfflineBanner />
      <DevelopmentToggle />
    </div>
  );
};
