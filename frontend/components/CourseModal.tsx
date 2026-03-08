import React, { useState } from 'react';
import { dbUtils, type Course } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CourseModalProps {
  course?: Course | null;
  onClose: () => void;
  onUpdate: () => void;
  instructorName: string;
}

export function CourseModal({ course, onClose, onUpdate, instructorName }: CourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    level: course?.level || 'beginner',
    thumbnail: course?.thumbnail || '',
    duration: course?.duration || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (course) {
        await dbUtils.saveCourse({ ...course, ...formData, level: formData.level as any, updatedAt: Date.now() });
        toast.success('Course updated successfully');
      } else {
        const newCourse: Course = {
          id: `c_${Date.now()}`,
          ...formData,
          level: formData.level as 'beginner' | 'intermediate' | 'advanced',
          instructor: instructorName,
          moduleCount: 0,
          lessonCount: 0,
          enrolledStudents: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await dbUtils.saveCourse(newCourse);
        toast.success('Course created successfully');
      }
      onUpdate();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{course ? 'Edit Course' : 'Create Course'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <input
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Level</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-card"
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value as any })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Thumbnail URL</label>
              <input
                type="url"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.thumbnail}
                onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
              />
            </div>
          </div>
        </form>
        <div className="p-6 border-t bg-muted/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? 'Saving...' : 'Save Course'}
          </Button>
        </div>
      </div>
    </div>
  );
}
