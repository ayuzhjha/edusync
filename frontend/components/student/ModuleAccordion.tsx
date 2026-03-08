'use client';

import React from 'react';
import { Module, Lesson } from '@/lib/db';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LessonList } from './LessonList';
import { CheckCircle2 } from 'lucide-react';

interface ModuleAccordionProps {
  modules: Module[];
  lessons: Lesson[];
  courseId: string;
  completed?: Record<string, boolean>;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  modules,
  lessons,
  courseId,
  completed = {},
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {modules.map((module) => {
        const moduleLessons = lessons
          .filter((l) => l.moduleId === module.id)
          .sort((a, b) => a.order - b.order);

        const completedInModule = moduleLessons.filter((l) => completed[l.id]).length;
        const allDone = completedInModule === moduleLessons.length && moduleLessons.length > 0;

        return (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full text-left">
                <div>
                  <h3 className="font-semibold text-foreground">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedInModule}/{moduleLessons.length} lessons completed
                  </p>
                </div>
                {allDone && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <LessonList
                lessons={moduleLessons}
                courseId={courseId}
                completed={completed}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
