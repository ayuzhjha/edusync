'use client';

import React from 'react';
import Link from 'next/link';
import { Course, Progress } from '@/lib/db';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Clock } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  progress?: Progress[];
  isDownloaded?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, progress = [], isDownloaded = false }) => {
  // Calculate progress percentage
  // Use at least the number of progress entries to avoid 0/0 when course.lessonCount is missing
  const completedCount = progress.filter((p) => p.completed).length;
  const totalLessons = Math.max(course.lessonCount || 0, progress.length, completedCount);
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/20 text-green-800';
      case 'intermediate':
        return 'bg-primary/20 text-primary-foreground';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-800';
      default:
        return 'bg-muted text-foreground/90';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Course Thumbnail */}
      <div className="w-full h-40 relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
        <img
          src="/webdev.png"
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image and reveal fallback gradient + icon
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Course Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{course.title}</h3>
          {isDownloaded && (
            <Badge className="bg-green-500/20 text-green-800 whitespace-nowrap flex-shrink-0">
              <Download className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-2">{course.instructor}</p>

        {/* Level & Duration */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {Math.round((course.duration || 0) / 60)}h
          </div>
        </div>

        {/* Lessons Info */}
        <p className="text-xs text-muted-foreground mb-3">
          {totalLessons} lessons • {completedCount} completed
        </p>

        {/* Progress Bar */}
        <ProgressBar value={progressPercentage} className="mb-2" />
        <p className="text-xs text-muted-foreground text-right mb-4">{Math.round(progressPercentage)}%</p>

        {/* CTA Button */}
        <Link href={`/courses/${course.id}`} className="mt-auto">
          <Button className="w-full bg-primary hover:bg-primary/90">
            {completedCount > 0 ? 'Continue' : 'Start'} Course
          </Button>
        </Link>
      </div>
    </Card>
  );
};
