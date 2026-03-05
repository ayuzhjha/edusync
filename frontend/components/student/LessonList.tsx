'use client';

import React from 'react';
import Link from 'next/link';
import { Lesson } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Video, FileText, CheckCircle, Circle, HelpCircle } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  courseId: string;
  completed?: Record<string, boolean>;
}

export const LessonList: React.FC<LessonListProps> = ({ lessons, courseId, completed = {} }) => {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const getLessonDuration = (lesson: Lesson) => {
    if (lesson.type === 'video' && lesson.duration) {
      return `${lesson.duration}m`;
    }
    if (lesson.type === 'pdf' && lesson.pageCount) {
      return `${lesson.pageCount}p`;
    }
    return lesson.type === 'quiz' ? 'Quiz' : '';
  };

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => (
        <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getLessonIcon(lesson.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
              <p className="text-sm text-gray-600">{getLessonDuration(lesson)}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {completed[lesson.id] ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </div>

            {/* Badge */}
            {lesson.isDownloaded && (
              <div className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                Saved
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
