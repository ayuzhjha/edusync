import React, { useState } from 'react';
import { db, dbUtils, type Course, type User } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentsModalProps {
  course: Course;
  onClose: () => void;
  onUpdate: () => void;
}

export function StudentsModal({ course, onClose, onUpdate }: StudentsModalProps) {
  const [students, setStudents] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStudents() {
      try {
        const allUsers = await dbUtils.getUsers();
        // course.enrolledStudents contains user IDs
        const enrolled = allUsers.filter(u => course.enrolledStudents?.includes(u.id));
        setStudents(enrolled);
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [course]);

  const removeStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      const updatedEnrolled = course.enrolledStudents?.filter(id => id !== studentId) || [];
      await db.courses.update(course.id, { enrolledStudents: updatedEnrolled });
      setStudents(students.filter(s => s.id !== studentId));
      toast.success('Student removed successfully');
      onUpdate();
    } catch (e) {
      toast.error('Failed to remove student');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Enrolled Students</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p>Loading...</p>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground italic">No students enrolled yet.</p>
          ) : (
            <ul className="space-y-4">
              {students.map(student => (
                <li key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeStudent(student.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2 sm:mt-0">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 border-t bg-muted/50 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
