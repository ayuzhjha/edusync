'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { dbUtils, type Lesson } from '@/lib/db';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { resolveContentUrl } from '@/lib/utils';

export interface DownloadProgress {
    lessonId: string;
    lessonTitle: string;
    percent: number; // 0-100
    status: 'pending' | 'downloading' | 'done' | 'error';
}

export interface UseDownloadReturn {
    isDownloading: boolean;
    downloadProgress: DownloadProgress[];
    overallPercent: number;
    downloadCourse: (courseId: string) => Promise<void>;
    removeCourse: (courseId: string) => Promise<void>;
}


/**
 * Force-loads a page in a hidden iframe to ensure all JS chunks and HTML
 * are captured by the Service Worker for offline use.
 */
function warmUpPage(url: string): Promise<void> {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve();

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;

        const timeout = setTimeout(() => {
            cleanup();
            resolve();
        }, 10000); // 10s max

        const cleanup = () => {
            clearTimeout(timeout);
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        };

        iframe.onload = () => {
            // Give it 2 seconds after load to fetch all sub-resources
            setTimeout(() => {
                cleanup();
                resolve();
            }, 2000);
        };

        iframe.onerror = () => {
            cleanup();
            resolve();
        };

        document.body.appendChild(iframe);
    });
}


export function useDownload(): UseDownloadReturn {
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);

    const updateProgress = useCallback(
        (lessonId: string, update: Partial<DownloadProgress>) => {
            setDownloadProgress((prev) =>
                prev.map((p) => (p.lessonId === lessonId ? { ...p, ...update } : p))
            );
        },
        []
    );

    const overallPercent =
        downloadProgress.length === 0
            ? 0
            : Math.round(
                downloadProgress.reduce((sum, p) => sum + p.percent, 0) /
                downloadProgress.length
            );

    /**
     * Downloads all downloadable lessons (video/pdf) in a course.
     * Blobs are stored in IndexedDB `assets` table.
     * Quiz lessons are marked as downloaded immediately (no file needed).
     */
    const downloadCourse = useCallback(async (courseId: string) => {
        setIsDownloading(true);
        try {
            const lessons = await dbUtils.getLessons(courseId);
            if (lessons.length === 0) {
                toast.error('No lessons found for this course');
                return;
            }

            // Warm up the shared lesson page code by loading the first lesson in a hidden iframe.
            // This ensures all the JS chunks for the lesson route are cached.
            if (navigator.onLine) {
                updateProgress(lessons[0].id, { status: 'pending', percent: 0 }); // Show some activity
                await warmUpPage(`/courses/${courseId}/lessons/${lessons[0].id}`);
            }

            // Initialize progress trackers
            setDownloadProgress(
                lessons.map((l) => ({
                    lessonId: l.id,
                    lessonTitle: l.title,
                    percent: 0,
                    status: 'pending',
                }))
            );

            let successCount = 0;
            let errorCount = 0;

            for (const lesson of lessons) {
                // Quiz lessons don't have a downloadable file — just mark them
                if (lesson.type === 'quiz' || !lesson.contentUrl) {
                    await dbUtils.saveLesson({
                        ...lesson,
                        isDownloaded: true,
                        downloadedAt: Date.now(),
                    });
                    updateProgress(lesson.id, { percent: 100, status: 'done' });
                    successCount++;
                    continue;
                }

                updateProgress(lesson.id, { status: 'downloading', percent: 0 });

                try {
                    const url = resolveContentUrl(lesson.contentUrl);
                    const blob = await apiService.downloadBlob(url, (pct) => {
                        updateProgress(lesson.id, { percent: pct });
                    });

                    // Persist the blob in IndexedDB
                    await dbUtils.saveOfflineAsset(lesson.id, blob);

                    // Prefetch the lesson page to ensure RSC data and JS chunks are cached
                    if (navigator.onLine) {
                        router.prefetch(`/courses/${courseId}/lessons/${lesson.id}`);
                    }

                    // Update lesson metadata
                    await dbUtils.saveLesson({
                        ...lesson,
                        isDownloaded: true,
                        downloadedAt: Date.now(),
                        size: blob.size,
                    });

                    updateProgress(lesson.id, { percent: 100, status: 'done' });
                    successCount++;
                } catch (err) {
                    console.error(`[useDownload] Failed to download lesson ${lesson.id}:`, err);
                    updateProgress(lesson.id, { status: 'error' });
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                toast.success(`✅ ${successCount} lessons downloaded for offline access!`);
            } else {
                toast.warning(
                    `Downloaded ${successCount} lessons. ${errorCount} failed — they may need an internet connection.`
                );
            }
        } catch (error) {
            console.error('[useDownload] Download course error:', error);
            toast.error('Download failed. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    }, [updateProgress]);

    /**
     * Removes all downloaded assets for a course from IndexedDB.
     */
    const removeCourse = useCallback(async (courseId: string) => {
        try {
            const lessons = await dbUtils.getLessons(courseId);
            for (const lesson of lessons) {
                // Remove blob from assets table
                await import('@/lib/db').then(({ db }) => db.assets.delete(lesson.id));
                // Update lesson record
                await dbUtils.saveLesson({
                    ...lesson,
                    isDownloaded: false,
                    downloadedAt: undefined,
                    localBlobUrl: undefined,
                    size: undefined,
                });
            }
            setDownloadProgress([]);
            toast.success('Offline content removed');
        } catch (error) {
            console.error('[useDownload] Remove course error:', error);
            toast.error('Failed to remove offline content');
        }
    }, []);

    return {
        isDownloading,
        downloadProgress,
        overallPercent,
        downloadCourse,
        removeCourse,
    };
}
