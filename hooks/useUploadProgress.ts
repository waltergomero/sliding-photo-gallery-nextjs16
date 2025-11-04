import { useState, useCallback } from 'react';
import { UploadProgress } from '@/types/upload';

interface UseUploadProgressReturn {
  uploadProgress: UploadProgress[];
  updateProgress: (fileId: string, progress: number, status?: UploadProgress['status']) => void;
  setError: (fileId: string, error: string) => void;
  setCompleted: (fileId: string) => void;
  resetProgress: () => void;
  initializeProgress: (fileIds: string[]) => void;
  getOverallProgress: () => number;
}

export const useUploadProgress = (): UseUploadProgressReturn => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const updateProgress = useCallback((
    fileId: string, 
    progress: number, 
    status: UploadProgress['status'] = 'uploading'
  ) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileId === fileId 
          ? { ...item, progress, status }
          : item
      )
    );
  }, []);

  const setError = useCallback((fileId: string, error: string) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileId === fileId 
          ? { ...item, status: 'error', error }
          : item
      )
    );
  }, []);

  const setCompleted = useCallback((fileId: string) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileId === fileId 
          ? { ...item, progress: 100, status: 'completed' }
          : item
      )
    );
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  const initializeProgress = useCallback((fileIds: string[]) => {
    const initialProgress = fileIds.map(fileId => ({
      fileId,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadProgress(initialProgress);
  }, []);

  const getOverallProgress = useCallback(() => {
    if (uploadProgress.length === 0) return 0;
    
    const totalProgress = uploadProgress.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / uploadProgress.length);
  }, [uploadProgress]);

  return {
    uploadProgress,
    updateProgress,
    setError,
    setCompleted,
    resetProgress,
    initializeProgress,
    getOverallProgress,
  };
};